# 🍪 GUIDE D'UTILISATION - COOKIE PRICING

## 🎯 OBJECTIF
Ce logiciel vous permet de calculer précisément le **coût réel** de vos cookies et le **prix de vente optimal** pour être rentable.

---

## 🚀 DÉMARRAGE RAPIDE

### Installation
```bash
cd CookiePricing
npm install
npm run dev
```

Le logiciel s'ouvre sur **http://localhost:5173/**

---

## 📖 GUIDE D'UTILISATION ÉTAPE PAR ÉTAPE

### ✅ ÉTAPE 1 : Ajouter vos ingrédients

1. Cliquez sur **"Ingrédients"** dans le menu
2. Cliquez sur **"Nouvel ingrédient"**
3. Remplissez les informations :
   - **Nom** : Ex: "Farine T55"
   - **Catégorie** : farine, sucre, gras, etc.
   - **Unité d'achat** : kg, g, L, unité, etc.
   - **Quantité achetée** : Ex: 5 (kg)
   - **Prix total payé** : Ex: 4.50€
   
4. Le logiciel calcule automatiquement :
   - Prix par unité (ex: 0.90€/kg)
   - Prix par gramme (ex: 0.0009€/g)

💡 **Astuce** : Entrez tous vos ingrédients dès le début pour faciliter la création de recettes.

**Exemples d'ingrédients :**
- Farine T55 : 5 kg → 4.50€
- Sucre blanc : 2 kg → 2.80€
- Beurre doux : 1 kg → 8.00€
- Œufs : 12 unités → 4.20€
- Pépites chocolat : 1 kg → 12.00€

---

### ✅ ÉTAPE 2 : Créer vos recettes

1. Cliquez sur **"Recettes"**
2. Cliquez sur **"Nouvelle recette"**
3. Définissez :
   - **Nom** : Ex: "Cookie Chocolat Noir"
   - **Niveau** : standard / premium / luxe
   - **Nombre de cookies produits** : Ex: 50 (combien cette recette fait de cookies)
   - **Température** : Ex: 180°C
   - **Temps** : Ex: 30 minutes

4. **Ajoutez les ingrédients** :
   - Cliquez sur "Ajouter"
   - Sélectionnez l'ingrédient
   - Entrez la quantité (ex: 500g de farine)
   - Répétez pour tous les ingrédients

5. **Résultat automatique** :
   - Coût total de la recette : Ex: 15.00€
   - Coût par cookie : Ex: 0.30€

💡 **Important** : Le nombre de cookies produits est crucial pour le calcul du coût unitaire !

---

### ✅ ÉTAPE 3 : Ajouter vos emballages

1. Cliquez sur **"Emballages"**
2. Ajoutez vos types d'emballages :
   - **Sachet kraft 6 cookies** : 0.20€
   - **Boîte premium 12 cookies** : 1.50€
   - **Sachet simple 3 cookies** : 0.10€

3. **Nouveauté : Produits additionnels**
   - Ajoutez le coût des extras (étiquettes, rubans, décorations)
   - Exemple : Boîte + étiquette (0.10€) + ruban (0.15€) = 0.25€ d'extras
   - Ces coûts sont automatiquement inclus dans le calcul final

Le logiciel calcule le coût par cookie :
- Sachet 6 cookies à 0.20€ = **0.033€/cookie**
- Avec extras (0.25€) : coût total = 0.45€ = **0.075€/cookie**

---

### ✅ ÉTAPE 4 : Configurer charges et pertes

**Charges indirectes :**
- Électricité/Gaz : Ex: 50€/mois
- Transport : Ex: 20€/mois
- Loyer atelier : Ex: 200€/mois
- Main-d'œuvre : Ex: 500€/mois

Le logiciel répartit ces charges sur tous les cookies produits.

**Pertes :**
- Cuisson : 3% (cookies ratés)
- Cassure : 2% (transport)
- Péremption : 1% (invendus)

**Total pertes : 6%** → Le coût réel augmente de 6%

---

### ✅ ÉTAPE 5 : Créer vos formats de vente

1. Cliquez sur **"Formats de Vente"**
2. Créez vos produits finaux :

**Exemple : Pack de 6 Cookies Chocolat**
- Cookie : Cookie Chocolat (0.30€/unité)
- Quantité : 6
- Emballage : Sachet kraft 6 cookies (0.20€)

**Calcul automatique :**
```
Coût cookies       : 6 × 0.30€ = 1.80€
Coût emballage     : 0.20€
Charges réparties  : 0.15€
Pertes (6%)        : 0.13€
────────────────────────────────
COÛT TOTAL         : 2.28€
```

3. **Définissez votre marge** : Ex: 40%

**Calcul du prix :**
```
Prix recommandé = 2.28€ / (1 - 0.40) = 3.80€

Vérification :
Prix vente : 3.80€
Coût       : 2.28€
Profit     : 1.52€
Marge réelle : 1.52 / 3.80 = 40% ✅
```

---

### ✅ ÉTAPE 6 : Comparateur de marges (NOUVEAU)

1. Cliquez sur **"Comparateur Marges"**
2. Sélectionnez un format de vente
3. Visualisez :
   - **Coût sans emballage** : Ingrédients + charges + pertes uniquement
   - **Coût avec emballage** : Coût complet incluant emballage et extras
   - **Coût par cookie** : Détail du coût unitaire
   - **Comparaison des marges** : Tableau comparatif de 25% à 60%

4. **Utilisez le guide de sélection** :
   - Compétitif (25-30%) : Vente en volume
   - Standard (30-45%) : Boutique, vente directe
   - Premium (45-55%) : Qualité supérieure
   - Luxe (55%+) : Haut de gamme

---

## 🎯 COMPRENDRE LES CALCULS

### Formule du coût réel :
```
COÛT RÉEL = 
  Coût ingrédients +
  Coût emballage +
  Coût extras emballage +
  Charges réparties +
  Majoration pertes
```

### Formule du prix de vente :
```
PRIX VENTE = COÛT RÉEL / (1 - MARGE%)

⚠️ ATTENTION :
Marge sur PRIX (correct) ≠ Marge sur COÛT (erreur courante)

Exemple :
- Coût : 10€
- Marge voulue : 40%

❌ FAUX : 10€ + 40% = 14€ → marge réelle = 28.5%
✅ CORRECT : 10€ / 0.6 = 16.67€ → marge réelle = 40%
```

---

## 📊 TABLEAU DE BORD

Le dashboard affiche :
- ✅ Nombre d'ingrédients, recettes, formats
- ✅ Marge moyenne
- ✅ Format le plus rentable
- ✅ Alertes si marge trop faible
- ✅ Vue d'ensemble de tous vos formats

**Indicateurs de couleur :**
- 🟢 Vert : Marge ≥ 40% (excellent)
- 🟡 Jaune : Marge 25-40% (correct)
- 🔴 Rouge : Marge < 25% (attention)

---

## 🚨 ALERTES AUTOMATIQUES

Le logiciel vous alerte si :
- ❗ Marge < 30% (warning)
- ⛔ Marge < 20% (danger)
- ⛔ Prix de vente < Coût (perte)
- ❗ Pertes élevées (> 10%)

---

## 💡 CONSEILS PRATIQUES

### 1. Actualisez vos prix régulièrement
Les prix des ingrédients changent (surtout beurre, chocolat).
→ Mettez à jour tous les mois.

### 2. N'oubliez pas les charges "cachées"
- Électricité du four
- Votre temps de travail
- Emballages et étiquettes
- Transport et livraisons

### 3. Testez plusieurs marges
Comparez :
- Marge 35% → Prix compétitif
- Marge 50% → Prix premium
- Marge 60% → Luxe / Événements

### 4. Anticipez les pertes
5% de pertes semblent peu, mais sur 1000 cookies/mois :
→ 50 cookies perdus = coûts qui s'accumulent

### 5. Prix psychologiques
- 2.99€ vend mieux que 3.00€
- 4.90€ vend mieux que 5.00€

---

## 🎨 EXEMPLE COMPLET

### Recette : Cookie Chocolat Noir (50 cookies)
**Ingrédients :**
- Farine : 500g → 0.45€
- Sucre : 300g → 0.42€
- Beurre : 250g → 2.00€
- Œufs : 3 → 1.05€
- Chocolat : 200g → 2.40€
- Levure : 10g → 0.05€

**Total ingrédients : 6.37€**
**Coût par cookie : 0.127€**

### Format : Pack de 6 cookies
```
Cookies (6×)      : 0.76€
Emballage         : 0.20€
Charges (estimé)  : 0.10€
Pertes (5%)       : 0.05€
─────────────────────────
COÛT TOTAL        : 1.11€

Marge 40% :
Prix recommandé   : 1.85€
Profit            : 0.74€
Marge réelle      : 40%
```

### Format : Vente à l'unité
```
Cookie (1×)       : 0.13€
Emballage         : 0.05€
Charges           : 0.02€
Pertes (5%)       : 0.01€
─────────────────────────
COÛT TOTAL        : 0.21€

Marge 50% :
Prix recommandé   : 0.42€
Arrondi           : 0.50€
Profit            : 0.29€
Marge réelle      : 58%
```

---

## 🔧 FONCTIONNALITÉS AVANCÉES (À VENIR)

- ✨ Simulations de changement de prix
- ✨ Comparaison multi-variétés
- ✨ Historique des prix
- ✨ Exports PDF/Excel
- ✨ Graphiques de rentabilité
- ✨ Prévisions saisonnières

---

## ❓ FAQ

**Q : Dois-je compter mon temps de travail ?**
R : OUI ! Même si c'est vous, votre temps a une valeur. Estimez un taux horaire (ex: 15€/h).

**Q : Comment répartir les charges ?**
R : Deux méthodes :
- Par cookie : Total charges / Nombre total cookies produits
- En % : Charges = X% du coût ingrédients (souvent 20-30%)

**Q : Quelle marge viser ?**
R : 
- Minimum : 30% (rentabilité de base)
- Standard : 40-50% (bon équilibre)
- Premium : 60%+ (produits haut de gamme)

**Q : Mes prix sont trop élevés ?**
R : Options :
- Négocier prix ingrédients (achats en gros)
- Optimiser recettes (moins de perte)
- Produire plus (diluer charges fixes)
- Accepter marge plus faible temporairement

**Q : Comment gérer plusieurs variétés ?**
R : Créez une recette par variété. Le logiciel les compare automatiquement.

---

## 📞 SUPPORT

Pour toute question ou amélioration :
- 📧 Email : [votre email]
- 💬 GitHub : [repo]

---

**Bonne gestion de vos coûts ! 🍪💰**
