# 📱 Configuration Twilio pour l'envoi de SMS d'absence

## 🎯 Objectif

Ce système envoie automatiquement un SMS aux parents lorsque leur enfant est marqué absent (justifié ou non justifié) lors de l'appel.

---

## 📋 Étapes d'installation

### 1️⃣ Configurer Twilio

1. **Créer un compte Twilio**
   - Rendez-vous sur [https://www.twilio.com/](https://www.twilio.com/)
   - Créez un compte (essai gratuit disponible)

2. **Récupérer vos identifiants**
   - Connectez-vous à votre [Console Twilio](https://console.twilio.com/)
   - Notez votre **Account SID** (commence par `AC...`)
   - Notez votre **Auth Token**

3. **Obtenir un numéro de téléphone Twilio**
   - Dans la console, allez dans **Phone Numbers** > **Buy a number**
   - Achetez un numéro compatible SMS (environ 1€/mois)
   - Notez ce numéro au format international (ex: `+33123456789`)

### 2️⃣ Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+33612345678
```

⚠️ **Important** : 
- Ne commitez JAMAIS ce fichier dans Git
- Le fichier `.env.local` est déjà dans `.gitignore`

### 3️⃣ Mettre à jour la base de données Supabase

Exécutez la migration SQL fournie (`supabase-migration-add-parent-phone.sql`) dans votre console Supabase :

```sql
-- Ajouter la colonne parent_phone à la table students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20);

COMMENT ON COLUMN students.parent_phone IS 'Numéro de téléphone du parent au format international (ex: +33612345678)';

CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone);
```

### 4️⃣ Ajouter les numéros de téléphone des parents

Dans votre interface d'administration ou directement dans Supabase :

1. Allez dans la table `students`
2. Pour chaque élève, ajoutez le numéro de téléphone du parent dans la colonne `parent_phone`
3. **Format obligatoire** : `+33612345678` (format international avec indicatif pays)

Exemples de formats corrects :
- France : `+33612345678`
- Belgique : `+32470123456`
- Maroc : `+212612345678`

---

## 🚀 Fonctionnement

### Déclenchement automatique

Lorsqu'un professeur enregistre l'appel via l'application :

1. Le système sauvegarde les présences/absences dans Supabase
2. Pour chaque élève absent (justifié ou non), le système :
   - Récupère le numéro de téléphone du parent
   - Envoie un SMS automatique via Twilio
   - Log le résultat dans la console

### Message SMS envoyé

```
Bonjour,

Nous vous informons que [Prénom NOM] de la classe [X] a été marqué(e) en absence [justifiée/non justifiée] le [date].

Pour toute question, merci de contacter l'établissement.

CSCBM
```

### Exemple de log

```
✅ SMS envoyé avec succès à +33612345678 (ID: SMxxxxxxxx)
📊 Résumé d'envoi: 3 réussis, 0 échoués
```

---

## 🔧 Tests et débogage

### Tester l'envoi de SMS

1. Marquez un élève comme absent dans l'application
2. Vérifiez la console du navigateur pour les logs
3. Vérifiez votre console Twilio pour voir les SMS envoyés
4. Le parent devrait recevoir le SMS instantanément

### Gestion des erreurs

Le système est robuste et gère automatiquement :

- ❌ **Numéro manquant** : Log un avertissement, continue l'appel
- ❌ **Format invalide** : Vérifie le format international (+...)
- ❌ **Erreur Twilio** : Log l'erreur, ne bloque pas l'enregistrement
- ✅ **Aucun absent** : N'envoie aucun SMS

### Vérifier les logs

```javascript
// Dans la console du navigateur
console.log('✅ SMS d\'absence: 2 envoyés, 0 échoués')

// Ou en cas d'erreur
console.error('❌ Erreur lors de l\'envoi du SMS:', error)
```

---

## 💰 Coûts Twilio

- **Numéro de téléphone** : ~1€/mois
- **SMS sortant** : ~0,08€/SMS (varie selon le pays)
- **Essai gratuit** : Crédit de 15$ pour tester

**Estimation mensuelle** :
- 50 élèves avec taux d'absence de 5% = ~10 SMS/semaine
- 40 SMS/mois × 0,08€ = **~3,20€/mois + 1€ (numéro)**
- **Total : ~4,20€/mois**

---

## 📝 Fichiers modifiés

### Nouveaux fichiers
- ✅ `src/lib/sms.ts` - Service d'envoi SMS via Twilio
- ✅ `src/app/api/send-absence-sms/route.ts` - API Route Next.js
- ✅ `supabase-migration-add-parent-phone.sql` - Migration SQL
- ✅ `TWILIO_CONFIGURATION.md` - Cette documentation

### Fichiers modifiés
- ✅ `src/lib/attendance.ts` - Ajout de l'envoi automatique de SMS
- ✅ `src/lib/supabase.ts` - Types mis à jour (parent_phone)
- ✅ `package.json` - Dépendance Twilio ajoutée

---

## 🔐 Sécurité

- ✅ Variables sensibles dans `.env.local` (non commité)
- ✅ API Route sécurisée côté serveur
- ✅ Validation des numéros de téléphone
- ✅ Gestion des erreurs sans exposer les données
- ✅ Rate limiting géré par Twilio

---

## 📞 Support

En cas de problème :

1. Vérifiez les logs de la console navigateur
2. Vérifiez votre [console Twilio](https://console.twilio.com/)
3. Consultez la [documentation Twilio](https://www.twilio.com/docs)
4. Vérifiez que les numéros sont au format international

---

## ✨ Améliorations futures possibles

- [ ] Interface pour modifier les numéros de téléphone
- [ ] Personnalisation du message SMS
- [ ] Envoi de SMS pour d'autres événements (notes, etc.)
- [ ] Statistiques d'envoi dans l'interface admin
- [ ] Support multi-langues pour les SMS
- [ ] Envoi de SMS groupés en fin de journée

---

**Créé le** : 2 octobre 2025  
**Version** : 1.0.0  
**Application** : CSCBM Vie Scolaire 