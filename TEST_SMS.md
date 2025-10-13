# 🧪 Guide de Test - Système SMS d'Absence

## ✅ Vérifications effectuées

### Base de données
- ✅ Table `students` existe
- ✅ Colonne `parent_phone` ajoutée (type VARCHAR)
- ✅ Migration appliquée avec succès
- ✅ Politiques RLS configurées
- ✅ Test d'écriture réussi (élève PETIT_Maira)

### Code
- ✅ Types TypeScript mis à jour
- ✅ Champ parent_phone ajouté dans le modal
- ✅ Client Supabase configuré avec fallback
- ✅ Logs de debug ajoutés

---

## 🧪 Comment tester maintenant

### Étape 1 : Ouvrir l'application

Le serveur devrait déjà tourner sur `http://localhost:3002`

Si ce n'est pas le cas :
```bash
npm run dev
```

### Étape 2 : Ouvrir la console du navigateur

1. Ouvrez Chrome/Firefox
2. Appuyez sur **F12** pour ouvrir les DevTools
3. Allez dans l'onglet **Console**

### Étape 3 : Tester la modification d'un élève

1. Allez sur `http://localhost:3002/admin/students`
2. Cliquez sur un élève (par exemple "Maira PETIT")
3. Dans l'onglet "Informations", remplissez le champ téléphone : `+33612345678`
4. Cliquez sur "Sauvegarder"

### Étape 4 : Vérifier les logs dans la console

Vous devriez voir :
```
🔄 Sauvegarde élève: {first_name: "Maira", last_name: "PETIT", class_id: "...", parent_phone: "+33612345678"}
📝 Mise à jour élève ID: PETIT_Maira
📱 Numéro parent: +33612345678
✅ Élève mis à jour avec succès: [...]
```

### Étape 5 : Vérifier dans Supabase

Vous pouvez vérifier directement dans la base :
- Allez sur https://supabase.com/dashboard
- Ouvrez votre projet
- Table Editor → students
- Cherchez l'élève modifié
- La colonne `parent_phone` doit contenir le numéro

---

## ❌ Si ça ne fonctionne pas

### Problème 1 : "Erreur lors de la modification"

**Dans la console, regardez le message d'erreur complet**

Causes possibles :
- Variables d'environnement mal chargées
- Problème de connexion Supabase
- Format du numéro incorrect

**Solution** :
1. Redémarrez le serveur : `Ctrl+C` puis `npm run dev`
2. Vérifiez `.env` contient les bonnes variables
3. Ouvrez http://localhost:3002 et vérifiez la console

### Problème 2 : Le champ téléphone n'apparaît pas

**Le code n'a pas été rechargé**

**Solution** :
1. Rechargez la page (F5)
2. Videz le cache (Ctrl+Shift+R)
3. Redémarrez le serveur

### Problème 3 : "Supabase is not defined"

**Le client Supabase n'est pas initialisé**

**Solution** :
1. Vérifiez que `.env` contient :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hzaiqudxyhrpxcqsxbrj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
2. Redémarrez le serveur

---

## 📱 Test complet du SMS

Une fois qu'un élève a un numéro de téléphone sauvegardé :

### 1. Allez sur la page d'une classe
`http://localhost:3002/class/[id]`

### 2. Marquez l'élève absent
- Changez son statut à "Absent justifié" ou "Absent injustifié"
- Ajoutez une note si besoin

### 3. Enregistrez l'appel
Cliquez sur "Enregistrer l'appel"

### 4. Vérifiez les logs
Dans la console, vous devriez voir :
```
✅ SMS envoyé avec succès à +33612345678 (ID: SM...)
📊 Résumé d'envoi: 1 réussis, 0 échoués
```

### 5. Le parent reçoit le SMS
```
Bonjour,

Nous vous informons que Maira PETIT de la classe X 
a été marqué(e) en absence non justifiée le 
vendredi 2 octobre 2025.

Pour toute question, merci de contacter l'établissement.

CSCBM
```

---

## 🔍 Logs utiles à surveiller

### ✅ Succès
- `🔄 Sauvegarde élève:` → L'action est déclenchée
- `✅ Élève mis à jour avec succès` → Supabase a accepté
- `✅ SMS envoyé avec succès` → Twilio a envoyé le SMS

### ❌ Erreurs
- `❌ Erreur modification élève:` → Problème Supabase
- `❌ Erreur lors de l'envoi du SMS:` → Problème Twilio
- `Variables Supabase manquantes !` → Problème .env

---

## 📞 Support

Si rien ne fonctionne :

1. **Vérifiez la console navigateur** (F12)
2. **Vérifiez les logs du terminal** où tourne `npm run dev`
3. **Testez manuellement dans Supabase** avec ce SQL :
   ```sql
   UPDATE students 
   SET parent_phone = '+33612345678' 
   WHERE id = 'PETIT_Maira';
   
   SELECT * FROM students WHERE id = 'PETIT_Maira';
   ```

---

**Date** : 2 octobre 2025  
**Version** : 1.0.0 