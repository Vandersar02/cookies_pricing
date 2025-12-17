# 🚀 Déploiement sur Vercel avec Supabase

## 📋 Vue d'ensemble

Ce guide vous explique comment déployer l'application Cookie Pricing sur Vercel et configurer Supabase **sans fichier `.env`**. Sur Vercel, les variables d'environnement sont configurées directement dans l'interface web de Vercel.

---

## ⚡ Prérequis

1. Un compte Vercel (gratuit) : [https://vercel.com](https://vercel.com)
2. Un compte Supabase configuré : voir [SETUP_DATABASE.md](./SETUP_DATABASE.md)
3. Votre code sur GitHub (public ou privé)

---

## 🎯 Étapes de déploiement

### Étape 1 : Préparer Supabase

Si ce n'est pas déjà fait, configurez Supabase en suivant le guide [SETUP_DATABASE.md](./SETUP_DATABASE.md).

Vous aurez besoin de :
- **VITE_SUPABASE_URL** : L'URL de votre projet (ex: `https://xxxxx.supabase.co`)
- **VITE_SUPABASE_ANON_KEY** : Votre clé publique anonyme (commence par `eyJ...`)

Pour récupérer ces informations :
1. Allez sur [https://supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **Settings** → **API**
4. Copiez le **Project URL** et la clé **anon public**

### Étape 2 : Connecter Vercel à votre dépôt GitHub

1. Allez sur [https://vercel.com](https://vercel.com)
2. Cliquez sur **"New Project"**
3. Importez votre dépôt GitHub :
   - Si c'est votre première fois, autorisez Vercel à accéder à GitHub
   - Sélectionnez le dépôt `cookies_pricing`
4. Cliquez sur **"Import"**

### Étape 3 : Configurer les variables d'environnement

**Important** : NE téléchargez PAS votre fichier `.env` sur GitHub !

Au lieu de cela, configurez les variables d'environnement directement dans Vercel :

1. Dans l'écran d'import du projet, **avant** de cliquer sur "Deploy" :
   - Trouvez la section **"Environment Variables"**
   - Ajoutez les deux variables suivantes :

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` (votre URL Supabase) |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (votre clé Supabase) |

2. Pour chaque variable :
   - Cliquez sur **"Add New"**
   - Entrez le **Name** (ex: `VITE_SUPABASE_URL`)
   - Entrez la **Value** (collez votre valeur depuis Supabase)
   - Sélectionnez les environnements : **Production**, **Preview**, et **Development**
   - Cliquez sur **"Add"**

3. Vérifiez que les deux variables sont bien ajoutées

### Étape 4 : Déployer

1. Une fois les variables d'environnement configurées, cliquez sur **"Deploy"**
2. Vercel va :
   - Cloner votre code
   - Installer les dépendances (`npm install`)
   - Construire l'application (`npm run build`)
   - Déployer le résultat
3. Attendez quelques minutes (2-3 minutes en général)
4. Votre application sera disponible sur une URL comme : `https://votre-app.vercel.app`

### Étape 5 : Tester

1. Ouvrez l'URL de votre application
2. Vérifiez que l'indicateur de synchronisation apparaît dans la sidebar
3. Créez un compte ou connectez-vous
4. Ajoutez quelques données (ingrédients, recettes, etc.)
5. Vérifiez que les données se synchronisent avec Supabase

---

## 🔄 Modifier les variables d'environnement après déploiement

Si vous devez changer vos clés Supabase plus tard :

1. Allez sur [https://vercel.com](https://vercel.com)
2. Sélectionnez votre projet `cookies_pricing`
3. Allez dans **Settings** → **Environment Variables**
4. Trouvez la variable à modifier (ex: `VITE_SUPABASE_URL`)
5. Cliquez sur les **3 points** → **Edit**
6. Modifiez la valeur
7. Cliquez sur **"Save"**
8. **Important** : Redéployez l'application :
   - Allez dans l'onglet **"Deployments"**
   - Trouvez le dernier déploiement
   - Cliquez sur les **3 points** → **"Redeploy"**

---

## 🌍 Configuration du domaine personnalisé (optionnel)

Si vous voulez utiliser votre propre domaine (ex: `cookies.votresite.com`) :

1. Dans votre projet Vercel, allez dans **Settings** → **Domains**
2. Cliquez sur **"Add"**
3. Entrez votre domaine
4. Suivez les instructions pour configurer les DNS chez votre hébergeur
5. Attendez la propagation DNS (quelques minutes à quelques heures)

---

## 🔐 Sécurité

### ✅ Bonnes pratiques

- ✅ Les variables d'environnement dans Vercel sont **sécurisées** et **chiffrées**
- ✅ Le fichier `.env` reste local et n'est **jamais** committé sur GitHub
- ✅ Les clés Supabase utilisées sont les clés **publiques** (`anon key`), pas les clés secrètes
- ✅ Supabase protège les données avec Row Level Security (RLS)

### ⚠️ À ne jamais faire

- ❌ Ne commitez JAMAIS le fichier `.env` sur GitHub
- ❌ Ne partagez JAMAIS votre clé secrète Supabase (`service_role key`)
- ❌ N'utilisez que la clé publique (`anon key`) dans le frontend

---

## 🔄 Mises à jour automatiques

Vercel peut redéployer automatiquement votre application à chaque commit :

1. Dans les paramètres de votre projet Vercel
2. Allez dans **Git** → **Deploy Hooks** (ou la configuration est automatique)
3. Par défaut, Vercel redéploie automatiquement sur chaque push vers la branche `main`

Pour déployer une nouvelle version :
```bash
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```

Vercel détectera le push et redéploiera automatiquement !

---

## 🐛 Dépannage

### Problème : "Supabase non configuré" sur Vercel

**Causes possibles** :
1. Les variables d'environnement ne sont pas configurées
2. Les noms des variables sont incorrects
3. Les valeurs contiennent des erreurs de copier-coller

**Solution** :
1. Allez dans Vercel → **Settings** → **Environment Variables**
2. Vérifiez que vous avez bien :
   - `VITE_SUPABASE_URL` (commence par `https://`)
   - `VITE_SUPABASE_ANON_KEY` (très longue clé commençant par `eyJ`)
3. Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
4. Redéployez l'application

### Problème : Build échoue sur Vercel

**Erreur** : `Command "npm run build" exited with 1`

**Solutions** :
1. Vérifiez que votre code compile localement : `npm run build`
2. Si ça fonctionne localement mais pas sur Vercel, vérifiez les versions de Node.js :
   - Dans Vercel → **Settings** → **General**
   - Changez la **Node.js Version** (essayez la version 18.x ou 20.x)
3. Vérifiez les logs de build dans Vercel pour voir l'erreur exacte

### Problème : L'application se charge mais reste blanche

**Causes possibles** :
1. Erreur JavaScript dans la console
2. Problème de routing

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Regardez s'il y a des erreurs
3. Vérifiez que le fichier `vercel.json` est bien présent avec la configuration de rewrites

### Problème : Les données ne se synchronisent pas

**Solution** :
1. Vérifiez la connexion dans l'interface (indicateur de sync)
2. Ouvrez la console (F12) et cherchez les erreurs Supabase
3. Vérifiez que vous êtes bien connecté avec votre compte
4. Vérifiez que la table `user_data` existe dans Supabase
5. Vérifiez que les politiques RLS sont bien configurées (voir [SETUP_DATABASE.md](./SETUP_DATABASE.md))

---

## 📊 Monitoring

### Logs en temps réel

Pour voir les logs de votre application en production :

1. Allez sur Vercel
2. Sélectionnez votre projet
3. Allez dans l'onglet **"Logs"** (ou **"Runtime Logs"**)
4. Vous verrez les erreurs et messages en temps réel

### Analytics

Vercel offre des analytics gratuits :

1. Allez dans l'onglet **"Analytics"**
2. Vous verrez :
   - Nombre de visiteurs
   - Temps de chargement
   - Pages les plus visitées

---

## 💰 Coûts

### Plan gratuit Vercel

- ✅ **100 GB** de bande passante par mois
- ✅ **100 déploiements** par jour
- ✅ **SSL automatique** (HTTPS)
- ✅ **CDN global**
- ✅ Largement suffisant pour un usage personnel ou une petite entreprise

### Plan gratuit Supabase

- ✅ **500 MB** de base de données
- ✅ **1 GB** de stockage fichiers
- ✅ **2 GB** de bande passante
- ✅ Largement suffisant pour ce projet

**Total : Gratuit ! 🎉**

---

## ✅ Checklist de déploiement

Avant de déployer, vérifiez que :

- [ ] Vous avez créé un projet Supabase
- [ ] Vous avez créé la table `user_data` avec le script SQL
- [ ] Vous avez récupéré l'URL et la clé anon de Supabase
- [ ] Vous avez un compte Vercel
- [ ] Votre code est sur GitHub
- [ ] Le fichier `.env` est dans `.gitignore` (ne pas le committer !)
- [ ] Le fichier `vercel.json` existe à la racine du projet

Pour déployer :

- [ ] Importez le projet dans Vercel
- [ ] Ajoutez les variables d'environnement dans Vercel
- [ ] Cliquez sur "Deploy"
- [ ] Testez l'application déployée
- [ ] Vérifiez la synchronisation avec Supabase

---

## 🎓 Ressources supplémentaires

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Guide Vite + Vercel](https://vercel.com/guides/deploying-vite-with-vercel)
- [Variables d'environnement Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Consultez la section **Dépannage** ci-dessus
2. Vérifiez les logs dans Vercel onglet "Logs"
3. Vérifiez la console du navigateur (F12)
4. Consultez les issues sur GitHub du projet

---

**Bon déploiement ! 🍪🚀**
