# 🔄 Guide de Synchronisation Multi-Appareils

## 🎯 Objectif

Maintenant, tu peux accéder à tes données de **n'importe quel appareil** (ordinateur, portable) ! Tes recettes, ingrédients et calculs de prix sont automatiquement synchronisés dans le cloud.

---

## 💡 Comment ça marche ?

### Avant (localStorage uniquement)
```
Ordinateur A  →  Données stockées localement
Ordinateur B  →  Données différentes, pas de sync
```

### Maintenant (localStorage + Supabase)
```
Ordinateur A  ↘
                  ☁️ Cloud Supabase  →  Données synchronisées
Ordinateur B  ↗
```

---

## 🚀 Mise en route rapide

### Option 1 : Utilisation locale (sans configuration)

**Rien à faire !** L'application fonctionne exactement comme avant. Tes données sont sauvegardées localement dans le navigateur.

### Option 2 : Synchronisation cloud (recommandé)

**En 5 minutes**, configure la synchronisation pour accéder à tes données partout :

1. **Créer un compte Supabase gratuit** (1 min)
   - Va sur [https://supabase.com](https://supabase.com)
   - Inscris-toi gratuitement
   - Crée un nouveau projet

2. **Créer la base de données** (2 min)
   - Va dans "SQL Editor"
   - Copie-colle le script SQL fourni dans [SETUP_DATABASE.md](./SETUP_DATABASE.md)
   - Clique sur "Run"

3. **Configurer l'application** (1 min)
   - Copie `.env.example` → `.env`
   - Ajoute ton URL et ta clé Supabase (trouvables dans Settings → API)
   - Redémarre l'appli avec `npm run dev`

4. **Se connecter** (1 min)
   - Clique sur "Local uniquement" dans la sidebar
   - Choisis "S'inscrire"
   - Entre ton email et mot de passe
   - C'est tout ! Tes données sont maintenant synchronisées

---

## 🎨 Nouveautés dans l'Interface

### Indicateur de synchronisation

En haut de la sidebar, tu verras maintenant :

- **☁️ Vert** : Connecté et synchronisé
- **☁️ Gris** : Mode local uniquement
- **⏳ Tournant** : Synchronisation en cours

### Actions disponibles

Clique sur l'indicateur pour :
- 🔐 **Se connecter / S'inscrire**
- 🔄 **Synchroniser maintenant** (force une sync immédiate)
- ☁️ **Charger depuis le cloud** (remplace les données locales)
- 🚪 **Se déconnecter**

---

## 📱 Utiliser sur plusieurs appareils

### Sur ton premier appareil (ex: ordinateur)

1. Configure Supabase (une seule fois)
2. Lance l'application
3. Connecte-toi avec ton compte
4. Tes données sont automatiquement envoyées au cloud

### Sur ton deuxième appareil (ex: portable)

1. Clone le projet
2. Copie le même fichier `.env` (avec les mêmes clés Supabase)
3. Lance l'application
4. Connecte-toi avec le **même compte**
5. Tes données sont automatiquement chargées !

---

## ⚡ Fonctionnement Technique

### Sauvegarde automatique

- **Local** : Chaque modification est sauvegardée instantanément dans le navigateur
- **Cloud** : Les modifications sont envoyées au cloud toutes les 2 secondes (pour économiser les requêtes)

### Chargement au démarrage

Quand tu ouvres l'application :
1. Les données locales sont chargées immédiatement (rapide)
2. Si tu es connecté, les données cloud sont vérifiées
3. Si les données cloud sont plus récentes, elles remplacent les données locales

### Mode hors ligne

Pas d'internet ? Aucun problème !
- Tu peux continuer à travailler normalement
- Toutes les modifications sont sauvegardées localement
- Dès que tu te reconnectes, tout est automatiquement synchronisé

---

## 🔐 Sécurité

### Protection des données

- ✅ Authentification requise pour accéder aux données cloud
- ✅ Chaque utilisateur ne voit que **ses propres données**
- ✅ Communication chiffrée (HTTPS)
- ✅ Politique de sécurité au niveau base de données (Row Level Security)

### Données personnelles

- Seul ton email est stocké pour l'authentification
- Toutes tes recettes, ingrédients et prix restent privés
- Aucun partage avec des tiers

---

## 💰 Coûts

### Plan gratuit Supabase

C'est **100% gratuit** pour :
- 500 MB de base de données
- 1 GB de stockage
- 2 GB de bande passante par mois

Pour ce projet, c'est **largement suffisant** (tes données font quelques KB seulement).

---

## ❓ Questions Fréquentes

### Q : Je dois absolument configurer Supabase ?

**Non !** L'application fonctionne parfaitement sans. Tu utiliseras juste le mode local.

### Q : Mes données actuelles seront perdues ?

**Non !** À la première connexion, tes données locales sont automatiquement envoyées au cloud.

### Q : Que se passe-t-il si j'oublie mon mot de passe ?

Tu peux utiliser la fonction "Mot de passe oublié" de Supabase (gérée automatiquement par email).

### Q : Puis-je utiliser l'appli sur mon téléphone ?

Techniquement oui, mais l'interface n'est pas encore optimisée pour mobile. Utilise plutôt un ordinateur/laptop.

### Q : Mes collègues peuvent-ils voir mes données ?

Non, chaque compte a ses propres données isolées. Pour partager, il faudra créer plusieurs comptes séparés.

### Q : Je peux revenir en arrière ?

Oui ! Si tu ne configures pas Supabase, rien ne change. Tes données restent locales comme avant.

---

## 🛠️ Dépannage

### "Supabase non configuré"

→ Vérifie que le fichier `.env` existe et contient les bonnes clés

### Les données ne se synchronisent pas

→ Vérifie que tu es bien connecté (regarde l'indicateur ☁️)
→ Vérifie ta connexion internet

### "Erreur de connexion"

→ Vérifie que l'URL Supabase est correcte (doit commencer par `https://`)
→ Vérifie que la clé API est complète

---

## 📞 Besoin d'aide ?

1. Consulte le guide détaillé : [SETUP_DATABASE.md](./SETUP_DATABASE.md)
2. Vérifie la console du navigateur (F12) pour les erreurs
3. Consulte la doc Supabase : [https://supabase.com/docs](https://supabase.com/docs)

---

**Profite de tes données synchronisées partout ! 🍪☁️**
