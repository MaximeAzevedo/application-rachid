# 📋 INFORMATIONS TWILIO À RÉCUPÉRER

## 🔍 Où trouver ces informations ?

➡️ Allez sur : **https://console.twilio.com/**

---

## ✅ Liste des 3 informations nécessaires

### 1️⃣ Account SID
- **Où le trouver** : Sur la page d'accueil de la console Twilio
- **À quoi ça ressemble** : `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (commence par "AC")
- **Exemple** : `AC1234567890abcdef1234567890abcd`
- **Longueur** : 34 caractères

### 2️⃣ Auth Token
- **Où le trouver** : Sur la page d'accueil, cliquez sur "Show" à côté de "Auth Token"
- **À quoi ça ressemble** : Une longue chaîne de caractères alphanumériques
- **Exemple** : `1234567890abcdef1234567890abcdef`
- **Longueur** : 32 caractères
- ⚠️ **ATTENTION** : Gardez-le secret !

### 3️⃣ Numéro de téléphone Twilio
- **Où le trouver** : Phone Numbers → Manage → Active numbers
- **Format OBLIGATOIRE** : `+33612345678` (avec le + et l'indicatif du pays)
- **Exemples valides** :
  - France : `+33612345678`
  - Belgique : `+32470123456`
- ⚠️ **Pas d'espaces, pas de tirets, pas de parenthèses**

---

## 📝 OÙ METTRE CES INFORMATIONS ?

### Créez un fichier `.env.local` à la racine du projet

**Emplacement exact** : `/Users/maximedeazevedo/Desktop/Application Rachid/.env.local`

### Contenu du fichier (copiez-collez et remplissez) :

```bash
# --- Configuration Supabase (déjà configuré normalement) ---
NEXT_PUBLIC_SUPABASE_URL=https://hzaiqudxyhrpxcqsxbrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_si_nécessaire

# --- Configuration Twilio ---
TWILIO_ACCOUNT_SID=AC_ICI_VOTRE_ACCOUNT_SID
TWILIO_AUTH_TOKEN=ICI_VOTRE_AUTH_TOKEN
TWILIO_PHONE_NUMBER=+33_ICI_VOTRE_NUMERO
```

---

## ✍️ EXEMPLE COMPLET REMPLI

```bash
# Configuration Twilio (EXEMPLE - remplacez par vos vraies valeurs)
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd
TWILIO_AUTH_TOKEN=9876543210fedcba9876543210fedcba
TWILIO_PHONE_NUMBER=+33612345678
```

---

## 🚨 VÉRIFICATIONS IMPORTANTES

### ✅ Format Account SID correct
- Commence par `AC`
- 34 caractères au total
- Pas d'espaces

### ✅ Format Auth Token correct
- 32 caractères
- Uniquement lettres et chiffres
- Pas d'espaces

### ✅ Format numéro de téléphone correct
- COMMENCE PAR `+`
- Suivi de l'indicatif du pays (33 pour France)
- Suivi du numéro sans le 0
- **AUCUN ESPACE, AUCUN TIRET**
- Exemples :
  - ✅ `+33612345678`
  - ❌ `+33 6 12 34 56 78`
  - ❌ `+33-6-12-34-56-78`
  - ❌ `0612345678`

---

## 📧 SI VOUS N'AVEZ PAS ENCORE DE COMPTE TWILIO

1. Allez sur https://www.twilio.com/
2. Cliquez sur "Sign up"
3. Créez un compte (gratuit avec 15$ de crédit)
4. Vérifiez votre email et votre téléphone
5. Dans la console, achetez un numéro de téléphone (~1€/mois)
   - Phone Numbers → Buy a number
   - Sélectionnez France (+33)
   - Filtrez par "SMS"
   - Achetez un numéro
6. Récupérez les 3 informations ci-dessus

---

## ⚡ APRÈS AVOIR CRÉÉ LE FICHIER .env.local

1. **Redémarrez le serveur Next.js** (important !)
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   # Puis relancez
   npm run dev
   ```

2. **Testez** en marquant un élève absent

3. **Vérifiez les logs** dans la console du navigateur (F12)

---

**Une fois que vous avez ces informations, donnez-les moi et je créerai le fichier .env.local pour vous ! 🚀** 