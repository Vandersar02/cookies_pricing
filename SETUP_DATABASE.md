# 🗄️ Configuration de la Base de Données

## 📋 Vue d'ensemble

Ce logiciel supporte maintenant la **synchronisation multi-appareils** via Supabase. Vos données sont automatiquement sauvegardées en ligne et synchronisées entre votre ordinateur et votre portable.

### Fonctionnement

- **Sans configuration** : Les données sont stockées localement dans votre navigateur (localStorage)
- **Avec Supabase** : Les données sont sauvegardées localement ET synchronisées en ligne automatiquement

---

## 🚀 Configuration Supabase (Gratuit)

### Étape 1 : Créer un compte Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"**
3. Créez un compte gratuit (Google, GitHub, ou email)

### Étape 2 : Créer un nouveau projet

1. Une fois connecté, cliquez sur **"New Project"**
2. Remplissez les informations :
   - **Name** : `cookies-pricing` (ou le nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort (notez-le !)
   - **Region** : Choisissez la région la plus proche (ex: `Europe West`)
   - **Pricing Plan** : Sélectionnez **Free** (gratuit)
3. Cliquez sur **"Create new project"**
4. Attendez 1-2 minutes que le projet soit créé

### Étape 3 : Créer la table de données

1. Dans votre projet Supabase, allez dans **"SQL Editor"** (menu de gauche)
2. Cliquez sur **"New query"**
3. Copiez-collez ce code SQL :

```sql
-- Créer la table pour stocker les données utilisateur
CREATE TABLE user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_user_data_user_id ON user_data(user_id);
CREATE INDEX idx_user_data_updated_at ON user_data(updated_at);

-- Activer Row Level Security (sécurité)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Politique de sécurité : Un utilisateur ne peut voir que ses propres données
CREATE POLICY "Users can view their own data"
  ON user_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique de sécurité : Un utilisateur peut insérer ses propres données
CREATE POLICY "Users can insert their own data"
  ON user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique de sécurité : Un utilisateur peut mettre à jour ses propres données
CREATE POLICY "Users can update their own data"
  ON user_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique de sécurité : Un utilisateur peut supprimer ses propres données
CREATE POLICY "Users can delete their own data"
  ON user_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. Cliquez sur **"Run"** pour exécuter le script
5. Vous devriez voir "Success. No rows returned" (c'est normal)

### Étape 4 : Récupérer les clés API

1. Dans votre projet Supabase, allez dans **"Settings"** (icône engrenage en bas à gauche)
2. Cliquez sur **"API"** dans le menu
3. Trouvez les deux informations suivantes :
   - **Project URL** : ressemble à `https://xxxxx.supabase.co`
   - **anon public** : une longue clé commençant par `eyJ...`

### Étape 5 : Configurer l'application

#### Pour le développement local

1. Dans le dossier du projet, créez un fichier `.env` à la racine :

```bash
# Copier le fichier exemple
cp .env.example .env
```

2. Ouvrez le fichier `.env` et remplissez avec vos informations :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...votre-longue-cle
```

3. Redémarrez l'application :

```bash
npm run dev
```

#### Pour le déploiement sur Vercel

**Important** : Ne committez PAS le fichier `.env` sur GitHub !

Pour déployer sur Vercel, vous devez configurer les variables d'environnement directement dans l'interface Vercel. Consultez le guide complet :

👉 **[Guide de déploiement sur Vercel](./DEPLOIEMENT_VERCEL.md)**

En résumé :
1. Importez votre projet dans Vercel
2. Ajoutez les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les paramètres Vercel
3. Déployez !

Aucun fichier `.env` n'est nécessaire sur Vercel. 🎉

---

## 🔐 Utilisation

### Première utilisation

1. Ouvrez l'application dans votre navigateur
2. Dans la sidebar, vous verrez maintenant un indicateur de sync en haut
3. Cliquez dessus et choisissez **"Se connecter"**
4. **S'inscrire** avec votre email et mot de passe
5. Vos données seront automatiquement synchronisées !

### Sur un autre appareil

1. Installez et lancez l'application
2. Configurez le même fichier `.env` avec les mêmes clés Supabase
3. Connectez-vous avec le même compte
4. Vos données seront automatiquement chargées !

---

## 🔄 Synchronisation

### Automatique

- **Sauvegarde locale** : Instantanée à chaque modification
- **Sauvegarde cloud** : Automatique toutes les 2 secondes après une modification
- **Chargement** : Automatique au démarrage si connecté

### Manuelle

Cliquez sur l'indicateur de sync et choisissez :
- **"Synchroniser maintenant"** : Force une sauvegarde immédiate
- **"Charger depuis le cloud"** : Remplace les données locales par celles du cloud

---

## ❓ FAQ

### Q : Que se passe-t-il si je ne configure pas Supabase ?

R : L'application fonctionne normalement, mais vos données restent locales (comme avant). Vous ne pouvez pas les synchroniser entre appareils.

### Q : Mes données actuelles seront-elles perdues ?

R : Non ! À la première connexion, vos données locales sont automatiquement envoyées au cloud.

### Q : Puis-je utiliser l'application hors ligne ?

R : Oui ! Les données sont toujours sauvegardées localement. La synchronisation cloud se fait automatiquement quand vous êtes en ligne.

### Q : Est-ce sécurisé ?

R : Oui ! 
- Vos données sont protégées par authentification
- Row Level Security garantit que chaque utilisateur ne voit que ses données
- Communication chiffrée (HTTPS)
- Supabase est une plateforme professionnelle certifiée SOC 2

### Q : Combien ça coûte ?

R : Le plan gratuit de Supabase offre :
- 500 MB de base de données
- 1 GB de stockage fichiers
- 2 GB de bande passante
- Largement suffisant pour ce projet !

### Q : Plusieurs personnes peuvent-elles utiliser la même base de données ?

R : Oui ! Chaque utilisateur a son propre compte et ses propres données. Créez simplement plusieurs comptes (différents emails).

### Q : Comment partager des données entre utilisateurs ?

R : Pour l'instant, chaque utilisateur a ses propres données isolées. Le partage multi-utilisateurs pourra être ajouté dans une future version si nécessaire.

### Q : Puis-je exporter mes données ?

R : Oui ! Les fonctionnalités d'export existantes (PDF, CSV) continuent de fonctionner. Vous pouvez aussi exporter directement depuis Supabase si besoin.

---

## 🛠️ Dépannage

### Erreur "Supabase non configuré"

- Vérifiez que le fichier `.env` existe à la racine du projet
- Vérifiez que les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont définies
- Redémarrez l'application avec `npm run dev`

### Erreur "Erreur de connexion"

- Vérifiez votre connexion internet
- Vérifiez que l'URL Supabase est correcte (commence par `https://`)
- Vérifiez que la clé API est complète (très longue, commence par `eyJ`)

### Erreur lors de l'inscription

- Le mot de passe doit faire au moins 6 caractères
- L'email doit être valide
- Vérifiez que vous n'avez pas déjà un compte avec cet email

### Les données ne se synchronisent pas

- Vérifiez que vous êtes connecté (regardez l'indicateur de sync)
- Vérifiez votre connexion internet
- Essayez une synchronisation manuelle
- Vérifiez les logs du navigateur (F12 → Console)

### "RLS policy violation" ou erreur de sécurité

- La table `user_data` doit avoir les politiques RLS configurées
- Relancez le script SQL de l'Étape 3
- Vérifiez que vous êtes bien connecté avec votre compte

---

## 🎯 Avantages de la synchronisation cloud

✅ **Multi-appareils** : Accédez à vos données depuis n'importe quel ordinateur
✅ **Sauvegarde automatique** : Vos données sont sauvegardées en permanence
✅ **Pas de perte de données** : Même si vous changez d'ordinateur
✅ **Mode hors ligne** : Continuez à travailler sans internet
✅ **Performances** : Sauvegarde locale instantanée + sync en arrière-plan
✅ **Sécurité** : Données protégées et isolées par utilisateur

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez la section Dépannage ci-dessus
2. Vérifiez les logs dans la console du navigateur (F12)
3. Consultez la documentation Supabase : [https://supabase.com/docs](https://supabase.com/docs)

---

**Bon usage de la synchronisation multi-appareils ! 🍪☁️**
