# 🍪 Cookie Pricing - Logiciel de Calcul des Coûts & Prix

## 📋 Description

Logiciel complet pour calculer le coût réel et le prix de vente optimal de cookies, en tenant compte de :

- ✅ Ingrédients utilisés et quantités
- ✅ Emballages et formats de vente
- ✅ Charges indirectes (électricité, gaz, etc.)
- ✅ Pertes et gaspillage
- ✅ Marges et pricing stratégique
- ✅ Comparaisons multi-variétés
- ✅ Simulations d'impact prix

## 🚀 Installation

```bash
npm install
```

## 💻 Démarrage

```bash
npm run dev
```

## 🏗️ Structure

- **Ingrédients** : Gestion des matières premières avec prix unitaires
- **Recettes** : Création de recettes avec calcul automatique des coûts
- **Emballages** : Gestion des coûts de packaging
- **Charges** : Répartition des coûts indirects
- **Formats de Vente** : Configuration des produits finaux
- **Pricing** : Calcul des prix de vente et marges
- **Dashboard** : Vue d'ensemble et analyses

## 🎯 Objectif

**Savoir combien coûte réellement chaque cookie et à quel prix le vendre pour être rentable.**

## 📊 Fonctionnalités

1. Calcul du coût unitaire réel par cookie
2. Calcul du prix de vente recommandé selon marge
3. Comparaison de rentabilité entre variétés
4. Simulation d'impact de variations de prix
5. Exports PDF/CSV
6. Alertes automatiques

## 🧮 Formules Clés

```
COÛT RÉEL = Ingrédients + Emballage + Charges + Pertes
PRIX VENTE = COÛT RÉEL / (1 - MARGE%)
PROFIT = PRIX VENTE - COÛT RÉEL
```

## 📦 Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Supabase (synchronisation cloud - optionnel)
- Lucide Icons

## ☁️ Synchronisation Multi-Appareils

Le logiciel supporte maintenant la **synchronisation automatique** de vos données entre plusieurs appareils !

- **Sans configuration** : Fonctionne en mode local uniquement (comme avant)
- **Avec Supabase** : Synchronisation automatique entre vos appareils

👉 **[Guide de configuration de la base de données](./SETUP_DATABASE.md)**

### Avantages
- ✅ Accédez à vos données depuis n'importe quel ordinateur
- ✅ Sauvegarde automatique dans le cloud
- ✅ Fonctionne aussi hors ligne
- ✅ Gratuit avec Supabase
