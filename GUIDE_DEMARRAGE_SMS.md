# 🚀 Guide de Démarrage Rapide - SMS d'Absence

## ⏱️ Configuration en 5 minutes

### Étape 1 : Créer un compte Twilio (2 minutes)

1. Allez sur [twilio.com](https://www.twilio.com/) et créez un compte
2. Vérifiez votre email et votre numéro de téléphone
3. Vous recevez **15$ de crédit gratuit** pour tester ! 🎉

### Étape 2 : Récupérer vos identifiants Twilio (1 minute)

1. Dans la [console Twilio](https://console.twilio.com/), vous voyez :
   - **Account SID** (commence par `AC...`)
   - **Auth Token** (cliquez sur "Show" pour le voir)
2. Notez ces deux valeurs

### Étape 3 : Acheter un numéro de téléphone (1 minute)

1. Dans Twilio, allez dans **Phone Numbers** → **Buy a number**
2. Sélectionnez le pays (France = +33)
3. Filtrez par "SMS" capability
4. Achetez un numéro (~1€/mois)

### Étape 4 : Configurer votre application (30 secondes)

1. Copiez le fichier `env.local.template` et renommez-le en `.env.local`
2. Remplissez avec vos identifiants Twilio :

```bash
TWILIO_ACCOUNT_SID=AC...votre_sid
TWILIO_AUTH_TOKEN=...votre_token
TWILIO_PHONE_NUMBER=+33612345678
```

### Étape 5 : Mettre à jour Supabase (30 secondes)

1. Allez dans votre [console Supabase](https://supabase.com/dashboard)
2. Ouvrez le **SQL Editor**
3. Copiez-collez le contenu de `supabase-migration-add-parent-phone.sql`
4. Cliquez sur **Run**

C'est tout ! ✅

---

## 📱 Ajouter les numéros de téléphone des parents

### Option A : Via l'interface Supabase

1. Ouvrez votre projet Supabase
2. Allez dans **Table Editor** → **students**
3. Pour chaque élève, ajoutez le numéro dans la colonne `parent_phone`

⚠️ **Format obligatoire** : `+33612345678` (avec le +33 et sans espaces)

### Option B : Via SQL (plus rapide pour plusieurs élèves)

```sql
-- Exemple pour mettre à jour plusieurs élèves
UPDATE students 
SET parent_phone = '+33612345678' 
WHERE id = 'id_de_l_eleve';

-- Ou en masse
UPDATE students SET parent_phone = '+33698765432' WHERE last_name = 'DUPONT';
```

---

## 🧪 Tester le système

1. **Démarrez votre application** : `npm run dev`
2. **Connectez-vous** comme professeur
3. **Ouvrez une classe**
4. **Marquez un élève absent** (qui a un numéro de téléphone)
5. **Enregistrez l'appel**
6. **Vérifiez** :
   - La console du navigateur (F12) pour les logs
   - Le parent devrait recevoir le SMS instantanément ! 📲

### Message SMS reçu par le parent

```
Bonjour,

Nous vous informons que Mohamed BELKHAOUEL de la 
classe D a été marqué(e) en absence non justifiée 
le vendredi 2 octobre 2025.

Pour toute question, merci de contacter l'établissement.

CSCBM
```

---

## 💡 Conseils et Astuces

### ✅ À FAIRE
- Utilisez le **format international** : `+33612345678`
- Testez avec **votre propre numéro** d'abord
- Vérifiez les **logs** dans la console du navigateur
- Consultez votre **console Twilio** pour voir l'historique des SMS

### ❌ À NE PAS FAIRE
- Ne mettez pas les numéros sans le `+33`
- N'ajoutez pas d'espaces ou de tirets : `+33 6 12 34 56 78` ❌
- Ne commitez jamais votre fichier `.env.local`

---

## 💰 Estimation des coûts

### Avec le crédit gratuit
- **Crédit de départ** : 15$ (offert)
- **Prix par SMS** : ~0,08€ (~0,09$)
- ≈ **160 SMS gratuits** pour tester ! 🎉

### Après le crédit gratuit
Pour une école de 50 élèves avec 5% d'absence :
- **10 SMS/semaine** = 40 SMS/mois
- **40 × 0,08€** = 3,20€/mois
- **Numéro Twilio** = 1€/mois
- **Total** : ~4,20€/mois

---

## 🆘 Résolution des problèmes

### Le SMS n'est pas envoyé

1. ✅ Vérifiez que le fichier `.env.local` existe et contient les bonnes valeurs
2. ✅ Vérifiez que le numéro parent est au format `+33...`
3. ✅ Ouvrez la console du navigateur (F12) et cherchez les erreurs
4. ✅ Vérifiez votre console Twilio pour voir les tentatives d'envoi

### "Variables Twilio manquantes"

➡️ Le fichier `.env.local` n'existe pas ou est mal configuré
- Redémarrez votre serveur Next.js après avoir créé `.env.local`

### "Le numéro doit être au format international"

➡️ Le numéro ne commence pas par `+`
- Format correct : `+33612345678`
- Format incorrect : `0612345678`

### Le parent ne reçoit rien

1. Vérifiez que le numéro est correct dans Supabase
2. Vérifiez que le pays du numéro parent est compatible avec Twilio
3. Consultez votre console Twilio pour voir le statut d'envoi

---

## 📊 Voir les statistiques d'envoi

### Dans la console Twilio

1. Allez sur [console.twilio.com](https://console.twilio.com/)
2. **Messaging** → **Logs**
3. Vous voyez :
   - ✅ Messages envoyés avec succès
   - ❌ Messages échoués (avec raison)
   - 💰 Coût de chaque SMS
   - 📈 Statistiques d'utilisation

---

## 📚 Documentation complète

Pour plus de détails, consultez `TWILIO_CONFIGURATION.md`

---

**Besoin d'aide ?** Vérifiez la [documentation Twilio](https://www.twilio.com/docs/sms) ou consultez les logs de votre application.

**Bon courage ! 🚀** 

## 📋 Variables d'environnement pour Vercel

Quand vous déployez sur Vercel, ajoutez ces 3 variables :

```bash
TWILIO_ACCOUNT_SID=votre_account_sid_ici
TWILIO_AUTH_TOKEN=votre_auth_token_ici
TWILIO_PHONE_NUMBER=votre_numero_twilio_ici
```

⚠️ **ATTENTION** : Ne jamais commiter vos vraies clés Twilio dans Git !

---

## ✅ Récapitulatif - Tout est prêt !

| Étape | Statut |
|-------|--------|
| ✅ SDK Twilio installé | Fait |
| ✅ Service SMS créé | Fait |
| ✅ API Route créée | Fait |
| ✅ Fonction d'envoi intégrée | Fait |
| ✅ Migration Supabase appliquée | Fait |
| ✅ Types TypeScript mis à jour | Fait |
| ✅ Variables d'environnement | Fait |

---

## 🚀 Prochaines étapes

### 1️⃣ Ajouter les numéros de téléphone des parents dans Supabase

Allez dans votre console Supabase → Table `students` → Colonne `parent_phone`

**Format obligatoire** : `+33612345678` (avec +, sans espaces)

### 2️⃣ Tester le système

```bash
<code_block_to_apply_changes_from>
```

1. Connectez-vous comme professeur
2. Ouvrez une classe
3. Marquez un élève absent (qui a un numéro de téléphone parent)
4. Enregistrez l'appel
5. ✅ Le parent devrait recevoir un SMS !

### 3️⃣ Vérifier les logs

Ouvrez la console du navigateur (F12) pour voir :
- `✅ SMS envoyé avec succès à +33...`
- `📊 Résumé d'envoi: X envoyés, X échoués`

---

## 🔍 Console Twilio

Vérifiez l'historique des SMS sur : https://console.twilio.com/us1/monitor/logs/sms

Vous y verrez :
- Messages envoyés
- Messages en attente
- Messages échoués (avec raison)
- Coût de chaque SMS

---

**Tout est en place ! Il ne reste plus qu'à ajouter les numéros de téléphone des parents et tester ! 🎉**

# Redémarrez le serveur si nécessaire
npm run dev 