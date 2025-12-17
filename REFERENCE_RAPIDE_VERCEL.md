# ⚡ Référence Rapide : Déployer sur Vercel

## 🎯 En 5 minutes

### 1. Préparer Supabase
- Allez sur [supabase.com](https://supabase.com)
- Créez un projet gratuit
- Exécutez le script SQL (voir [SETUP_DATABASE.md](./SETUP_DATABASE.md))
- Notez votre **URL** et **clé anon** (Settings → API)

### 2. Déployer sur Vercel
- Allez sur [vercel.com](https://vercel.com)
- Cliquez "New Project"
- Importez votre dépôt GitHub
- **Avant de cliquer "Deploy"**, ajoutez les variables :

```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...votre-cle
```

- Cliquez "Deploy"
- Attendez 2-3 minutes
- C'est fait ! 🎉

## 📝 Commandes utiles

```bash
# Développement local
npm run dev

# Build local (tester avant de déployer)
npm run build

# Preview du build
npm run preview
```

## 🔑 Variables d'environnement requises

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | URL du projet | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Clé publique | Supabase → Settings → API → anon public |

## ⚠️ Important

- ❌ **NE JAMAIS** committer le fichier `.env`
- ✅ Utiliser les variables d'environnement Vercel
- ✅ Utiliser uniquement la clé **anon** (pas service_role)

## 🔄 Redéployer après modification

Vercel redéploie automatiquement à chaque push sur `main` :

```bash
git add .
git commit -m "Mise à jour"
git push origin main
```

## 🆘 Problèmes courants

### "Supabase non configuré"
→ Vérifiez les variables d'environnement dans Vercel

### Build échoue
→ Testez `npm run build` localement d'abord

### Page blanche
→ Vérifiez que `vercel.json` existe avec les rewrites

## 📚 Guides complets

- 📖 [Configuration Supabase complète](./SETUP_DATABASE.md)
- 🚀 [Guide Vercel complet](./DEPLOIEMENT_VERCEL.md)

---

**Temps total : 5-10 minutes | Coût : Gratuit 🎉**
