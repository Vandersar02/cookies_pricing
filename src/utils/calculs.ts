/**
 * UTILITAIRES DE CALCUL - FORMULES MÉTIER
 * Toutes les formules de calcul des coûts, pricing et rentabilité
 */

import type { 
  Ingredient, 
  Recette, 
  IngredientRecette,
  Emballage,
  ChargesGlobales,
  Perte,
  FormatVente,
  CalculCoutCookie,
  CalculPricing,
  AchatIngredient, 
  StatistiquesFournisseur, 
  DepensesPeriode,
  PeriodeAnalyse,
  RecommandationReapprovisionnement,
  AnalyseABCProduit,
  SeuilRentabilite,
  KPIDashboard,
  ComparaisonFournisseur,
  ClasseABC,
} from '@/types';
import { startOfWeek, startOfMonth, format, differenceInDays } from 'date-fns';

// ============================================
// 1. CONVERSIONS D'UNITÉS
// ============================================

/**
 * Facteurs de conversion vers grammes (unité de base)
 * 
 * Note: Les facteurs de conversion sont des approximations raisonnables.
 * - Pour unités variables (pièce, boîte, sachet, paquet): facteur 1 = l'utilisateur définit le poids réel via le prix
 * - Pour volumes (cuillère, tasse): approximations standards pour usage général en pâtisserie
 * - Pour unités impériales: lb (livres) et oz (onces) avec conversions exactes
 * - Pour meilleure précision: utiliser kg/g pour ingrédients secs et L/mL pour liquides
 */
const CONVERSIONS_VERS_GRAMMES: Record<string, number> = {
  'kg': 1000,
  'g': 1,
  'L': 1000, // approximation pour liquides (densité ~1)
  'mL': 1,
  'lb': 453.592, // livre (pound) = 453.592 grammes
  'oz': 28.3495, // once (ounce) = 28.3495 grammes
  'unité': 1, // l'utilisateur définit le poids via le prix d'achat
  'paquet': 1, // l'utilisateur définit le poids via le prix d'achat
  'pièce': 1, // l'utilisateur définit le poids via le prix d'achat
  'boîte': 1, // l'utilisateur définit le poids via le prix d'achat
  'sachet': 1, // l'utilisateur définit le poids via le prix d'achat
  'cuillère': 15, // approximation cuillère à soupe (~15g pour ingrédients secs)
  'tasse': 240, // approximation tasse standard (~240g/mL pour eau et ingrédients similaires)
};

/**
 * Convertit une quantité en grammes
 */
export function convertirEnGrammes(quantite: number, unite: string): number {
  return quantite * (CONVERSIONS_VERS_GRAMMES[unite] || 1);
}

/**
 * Convertit une quantité d'une unité vers une autre
 * Utile pour convertir entre différentes unités (ex: lb vers kg, oz vers g, etc.)
 * 
 * Note: Pour les unités variables (pièce, boîte, sachet, etc.), la conversion
 * retourne la quantité en grammes car ces unités n'ont pas de facteur de conversion fixe.
 */
export function convertirUnite(
  quantite: number,
  uniteSource: string,
  uniteCible: string
): number {
  // Si les unités sont identiques, pas besoin de conversion
  if (uniteSource === uniteCible) {
    return quantite;
  }
  
  // Convertir d'abord en grammes (unité de base)
  const grammes = convertirEnGrammes(quantite, uniteSource);
  
  // Puis convertir des grammes vers l'unité cible
  const facteurCible = CONVERSIONS_VERS_GRAMMES[uniteCible];
  if (facteurCible && facteurCible > 0) {
    return grammes / facteurCible;
  }
  
  // Si l'unité cible n'est pas convertible (unités variables), retourner la quantité en grammes
  return grammes;
}

/**
 * Calcule le prix par gramme d'un ingrédient depuis son prix par unité
 */
export function calculerPrixParGramme(ingredient: Ingredient): number {
  const grammesParUnite = convertirEnGrammes(1, ingredient.unite_achat);
  return grammesParUnite > 0 ? ingredient.prix_par_unite / grammesParUnite : 0;
}

/**
 * Calcule le prix par unité d'un ingrédient depuis l'historique des achats
 * Utilise le dernier achat ou la moyenne des achats récents
 */
export function calculerPrixParUniteDepuisAchats(
  ingredient_id: string,
  achats: AchatIngredient[]
): number {
  const achatsIngredient = achats
    .filter(a => a.ingredient_id === ingredient_id)
    .sort((a, b) => new Date(b.date_achat).getTime() - new Date(a.date_achat).getTime());
  
  if (achatsIngredient.length === 0) {
    return 0;
  }
  
  // Utiliser le prix du dernier achat
  return achatsIngredient[0].prix_unitaire;
}

// ============================================
// 2. CALCULS RECETTES
// ============================================

/**
 * Calcule le coût d'un ingrédient dans une recette
 */
export function calculerCoutIngredientRecette(
  ingredientRecette: IngredientRecette,
  ingredient: Ingredient
): number {
  // Convertir en unité de base (grammes)
  const quantiteGrammes = convertirEnGrammes(
    ingredientRecette.quantite_necessaire,
    ingredientRecette.unite
  );
  
  const prixParGramme = calculerPrixParGramme(ingredient);
  
  return quantiteGrammes * prixParGramme;
}

/**
 * Calcule le coût total d'une recette
 */
export function calculerCoutTotalRecette(
  recette: Recette,
  ingredients: Ingredient[]
): number {
  return recette.ingredients.reduce((total, ingRecette) => {
    const ingredient = ingredients.find(i => i.id === ingRecette.ingredient_id);
    if (!ingredient) return total;
    
    return total + calculerCoutIngredientRecette(ingRecette, ingredient);
  }, 0);
}

/**
 * Calcule le coût par cookie d'une recette
 */
export function calculerCoutParCookie(recette: Recette, coutTotal: number): number {
  return recette.nombre_cookies_produits > 0 
    ? coutTotal / recette.nombre_cookies_produits 
    : 0;
}

/**
 * Met à jour tous les coûts calculés d'une recette
 */
export function calculerRecetteComplete(
  recette: Recette,
  ingredients: Ingredient[]
): Recette {
  const coutTotal = calculerCoutTotalRecette(recette, ingredients);
  const coutParCookie = calculerCoutParCookie(recette, coutTotal);
  
  // Mettre à jour les ingrédients avec leurs coûts
  const ingredientsAvecCouts = recette.ingredients.map(ingRecette => {
    const ingredient = ingredients.find(i => i.id === ingRecette.ingredient_id);
    const cout = ingredient 
      ? calculerCoutIngredientRecette(ingRecette, ingredient) 
      : 0;
    
    return {
      ...ingRecette,
      cout_calcule: cout,
    };
  });
  
  return {
    ...recette,
    ingredients: ingredientsAvecCouts,
    cout_total_ingredients: coutTotal + (recette.cout_energie_four || 0),
    cout_par_cookie_ingredients: coutParCookie,
  };
}

// ============================================
// 3. CALCULS EMBALLAGES
// ============================================

/**
 * Calcule le coût d'emballage par cookie
 */
export function calculerCoutEmballageParCookie(emballage: Emballage): number {
  return emballage.capacite_cookies > 0 
    ? emballage.cout_unitaire / emballage.capacite_cookies 
    : 0;
}

/**
 * Calcule le coût des extras d'emballage par cookie
 */
export function calculerCoutExtrasParCookie(emballage: Emballage): number {
  if (!emballage.cout_extras || emballage.capacite_cookies === 0) {
    return 0;
  }
  return emballage.cout_extras / emballage.capacite_cookies;
}

// ============================================
// 4. CALCULS CHARGES
// ============================================

/**
 * Calcule le total des charges
 */
export function calculerTotalCharges(charges: ChargesGlobales): number {
  const c = charges.charges;
  return (
    c.electricite_gaz +
    c.transport +
    (c.loyer_atelier || 0) +
    (c.eau || 0) +
    (c.entretien_materiel || 0) +
    (c.assurance || 0) +
    (c.main_oeuvre || 0)
  );
}

/**
 * Calcule la charge par cookie selon la méthode choisie
 */
export function calculerChargeParCookie(
  charges: ChargesGlobales,
  coutIngredientsCookie?: number
): number {
  const totalCharges = calculerTotalCharges(charges);
  
  switch (charges.methode_repartition) {
    case 'par_cookie':
      return charges.nombre_cookies_produits_periode && charges.nombre_cookies_produits_periode > 0
        ? totalCharges / charges.nombre_cookies_produits_periode
        : 0;
    
    case 'pourcentage':
      if (coutIngredientsCookie && charges.pourcentage_charges) {
        return coutIngredientsCookie * (charges.pourcentage_charges / 100);
      }
      return 0;
    
    case 'par_batch':
      // À implémenter selon besoins spécifiques
      return 0;
    
    default:
      return 0;
  }
}

// ============================================
// 5. CALCULS PERTES
// ============================================

/**
 * Applique le taux de perte à un coût
 */
export function appliquerTauxPerte(cout: number, tauxPerte: number): number {
  return cout * (1 + tauxPerte / 100);
}

/**
 * Calcule le nombre de cookies à produire en tenant compte des pertes
 */
export function calculerQuantiteAvecPertes(
  quantiteVoulue: number,
  tauxPerte: number
): number {
  return tauxPerte > 0 
    ? Math.ceil(quantiteVoulue / (1 - tauxPerte / 100))
    : quantiteVoulue;
}

/**
 * Calcule le coût supplémentaire dû aux pertes
 */
export function calculerCoutPertes(coutBase: number, tauxPerte: number): number {
  return coutBase * (tauxPerte / 100);
}

// ============================================
// 6. CALCUL COÛT COMPLET D'UN COOKIE
// ============================================

/**
 * Calcule tous les coûts d'un cookie
 */
export function calculerCoutCompletCookie(
  coutIngredients: number,
  emballage: Emballage | null,
  chargesGlobales: ChargesGlobales[],
  pertes: Perte[]
): CalculCoutCookie {
  // 1. Coût ingrédients
  const coutBase = coutIngredients;
  
  // 2. Coût emballage
  const coutEmballage = emballage ? calculerCoutEmballageParCookie(emballage) : 0;
  
  // 3. Charges réparties
  const chargesActives = chargesGlobales.filter(c => c.actif);
  const coutCharges = chargesActives.reduce((total, charge) => {
    return total + calculerChargeParCookie(charge, coutBase);
  }, 0);
  
  // 4. Pertes
  const pertesActives = pertes.filter(p => p.actif);
  const tauxPerteTotal = pertesActives.reduce((total, perte) => {
    return total + perte.taux_perte_pourcentage;
  }, 0);
  
  const coutAvantPertes = coutBase + coutEmballage + coutCharges;
  const coutPertes = calculerCoutPertes(coutAvantPertes, tauxPerteTotal);
  
  // 5. Coût total
  const coutTotal = coutAvantPertes + coutPertes;
  
  return {
    cout_ingredients: coutBase,
    cout_emballage: coutEmballage,
    cout_charges: coutCharges,
    cout_pertes: coutPertes,
    cout_total: coutTotal,
  };
}

// ============================================
// 7. CALCULS PRICING
// ============================================

/**
 * Calcule le prix de vente recommandé avec marge
 * FORMULE CORRECTE : Prix = Coût / (1 - Marge%)
 */
export function calculerPrixVenteAvecMarge(
  coutRevient: number,
  margePourcentage: number
): number {
  if (margePourcentage >= 100) {
    throw new Error('La marge ne peut pas être >= 100%');
  }
  
  return coutRevient / (1 - margePourcentage / 100);
}

/**
 * Calcule le prix de vente minimum (point mort)
 */
export function calculerPrixMinimum(coutRevient: number): number {
  return coutRevient;
}

/**
 * Calcule le profit unitaire
 */
export function calculerProfit(prixVente: number, coutRevient: number): number {
  return prixVente - coutRevient;
}

/**
 * Calcule la marge réelle en %
 */
export function calculerMargeReelle(profit: number, prixVente: number): number {
  return prixVente > 0 ? (profit / prixVente) * 100 : 0;
}

/**
 * Vérifie si le pricing est rentable
 */
export function estRentable(prixVente: number, coutRevient: number): boolean {
  return prixVente > coutRevient;
}

/**
 * Calcul complet du pricing
 */
export function calculerPricingComplet(
  coutRevient: number,
  margeCible: number,
  prixPratique?: number
): CalculPricing {
  const prixMinimum = calculerPrixMinimum(coutRevient);
  const prixRecommande = calculerPrixVenteAvecMarge(coutRevient, margeCible);
  
  // Utiliser le prix pratique si fourni, sinon le recommandé
  const prixFinal = prixPratique || prixRecommande;
  
  const profit = calculerProfit(prixFinal, coutRevient);
  const margeReelle = calculerMargeReelle(profit, prixFinal);
  const rentable = estRentable(prixFinal, coutRevient);
  
  return {
    cout_revient: coutRevient,
    marge_cible: margeCible,
    prix_minimum: prixMinimum,
    prix_recommande: prixRecommande,
    prix_pratique: prixPratique,
    profit,
    marge_reelle: margeReelle,
    rentable,
  };
}

// ============================================
// 8. CALCUL COMPLET FORMAT DE VENTE
// ============================================

/**
 * Calcule tous les éléments d'un format de vente
 */
export function calculerFormatVenteComplet(
  format: FormatVente,
  coutParCookie: number,
  emballage: Emballage,
  chargesGlobales: ChargesGlobales[],
  pertes: Perte[]
): FormatVente {
  // 1. Coût des cookies
  const coutCookies = coutParCookie * format.quantite_cookies;
  
  // 2. Coût emballage (base)
  const coutEmballage = emballage.cout_unitaire;
  
  // 3. Coût des extras d'emballage (étiquettes, rubans, décorations, etc.)
  const coutEmballageExtras = emballage.cout_extras || 0;
  
  // 4. Charges réparties sur le format
  const chargesActives = chargesGlobales.filter(c => c.actif);
  const coutCharges = chargesActives.reduce((total, charge) => {
    const chargeParCookie = calculerChargeParCookie(charge, coutParCookie);
    return total + (chargeParCookie * format.quantite_cookies);
  }, 0);
  
  // 5. Pertes
  const pertesActives = pertes.filter(p => p.actif);
  const tauxPerteTotal = pertesActives.reduce((total, perte) => {
    return total + perte.taux_perte_pourcentage;
  }, 0);
  
  const coutAvantPertes = coutCookies + coutEmballage + coutEmballageExtras + coutCharges;
  const coutPertes = calculerCoutPertes(coutAvantPertes, tauxPerteTotal);
  
  // 6. Coût total de revient
  const coutTotalRevient = coutAvantPertes + coutPertes;
  
  // 7. Pricing
  const pricing = calculerPricingComplet(
    coutTotalRevient,
    format.marge_cible_pourcentage,
    format.prix_vente_pratique
  );
  
  return {
    ...format,
    cout_cookies: coutCookies,
    cout_emballage: coutEmballage,
    cout_emballage_extras: coutEmballageExtras,
    cout_charges: coutCharges,
    cout_pertes: coutPertes,
    cout_total_revient: coutTotalRevient,
    prix_vente_recommande: pricing.prix_recommande,
    profit_unitaire: pricing.profit,
    marge_reelle_pourcentage: pricing.marge_reelle,
  };
}

// ============================================
// 9. ANALYSES & COMPARAISONS
// ============================================

/**
 * Compare plusieurs formats et identifie le plus rentable
 */
export function comparerFormats(formats: FormatVente[]): FormatVente[] {
  return [...formats].sort((a, b) => b.profit_unitaire - a.profit_unitaire);
}

/**
 * Calcule le seuil de rentabilité simple (break-even)
 */
export function calculerSeuilRentabiliteSimple(
  chargesFixesMensuelles: number,
  margeUnitaire: number
): number {
  return margeUnitaire > 0 
    ? Math.ceil(chargesFixesMensuelles / margeUnitaire) 
    : Infinity;
}

/**
 * Simule l'impact d'un changement de prix ingrédient
 */
export function simulerImpactPrix(
  coutActuel: number,
  variationPourcentage: number
): { nouveau_cout: number; variation_euro: number } {
  const nouveauCout = coutActuel * (1 + variationPourcentage / 100);
  const variationEuro = nouveauCout - coutActuel;
  
  return {
    nouveau_cout: nouveauCout,
    variation_euro: variationEuro,
  };
}

// ============================================
// 10. UTILITAIRES DE FORMATAGE
// ============================================

/**
 * Formate un nombre en gourdes haïtiennes (HTG)
 * Note: Le nom de la fonction est maintenu pour la compatibilité avec le code existant
 */
export function formaterEuro(montant: number): string {
  return new Intl.NumberFormat('fr-HT', {
    style: 'currency',
    currency: 'HTG',
  }).format(montant);
}

/**
 * Formate un pourcentage
 */
export function formaterPourcentage(valeur: number, decimales = 1): string {
  return `${valeur.toFixed(decimales)}%`;
}

/**
 * Arrondit à 2 décimales
 */
export function arrondir(valeur: number, decimales = 2): number {
  return Math.round(valeur * Math.pow(10, decimales)) / Math.pow(10, decimales);
}

/**
 * Génère un ID unique
 */
export function genererID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// 11. ANALYTICS ACHATS & FOURNISSEURS
// ============================================

/**
 * Calcule les statistiques par fournisseur
 */
export function calculerStatistiquesFournisseur(
  achats: AchatIngredient[],
  fournisseur: string
): StatistiquesFournisseur {
  const achatsFournisseur = achats.filter(a => a.fournisseur === fournisseur);
  
  if (achatsFournisseur.length === 0) {
    return {
      fournisseur,
      nombre_achats: 0,
      montant_total: 0,
      montant_moyen: 0,
      ingredients: [],
    };
  }

  const montantTotal = achatsFournisseur.reduce((sum, a) => sum + a.prix_total, 0);
  const ingredientsUniques = [...new Set(achatsFournisseur.map(a => a.ingredient_nom))];
  
  // Trier les achats par date
  const achatsTries = [...achatsFournisseur].sort(
    (a, b) => new Date(a.date_achat).getTime() - new Date(b.date_achat).getTime()
  );
  
  const premierAchat = achatsTries[0]?.date_achat;
  const dernierAchat = achatsTries[achatsTries.length - 1]?.date_achat;
  
  // Calculer la fréquence moyenne en jours
  let frequenceMoyenne: number | undefined;
  if (achatsTries.length >= 2 && premierAchat && dernierAchat) {
    const joursTotal = differenceInDays(
      new Date(dernierAchat),
      new Date(premierAchat)
    );
    frequenceMoyenne = Math.round(joursTotal / (achatsTries.length - 1));
  }

  return {
    fournisseur,
    nombre_achats: achatsFournisseur.length,
    montant_total: montantTotal,
    montant_moyen: montantTotal / achatsFournisseur.length,
    dernier_achat: dernierAchat,
    premier_achat: premierAchat,
    ingredients: ingredientsUniques,
    frequence_jours: frequenceMoyenne,
  };
}

/**
 * Regroupe les achats par période
 */
export function grouperAchatsParPeriode(
  achats: AchatIngredient[],
  periode: PeriodeAnalyse
): DepensesPeriode[] {
  const groupes = new Map<string, AchatIngredient[]>();

  achats.forEach(achat => {
    const date = new Date(achat.date_achat);
    let cle: string;

    switch (periode) {
      case 'hebdomadaire':
        cle = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-\'W\'II');
        break;
      case 'mensuelle':
        cle = format(startOfMonth(date), 'yyyy-MM');
        break;
      case 'trimestrielle': {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        cle = `${date.getFullYear()}-Q${quarter}`;
        break;
      }
      case 'annuelle':
        cle = date.getFullYear().toString();
        break;
    }

    if (!groupes.has(cle)) {
      groupes.set(cle, []);
    }
    const groupe = groupes.get(cle);
    if (groupe) {
      groupe.push(achat);
    }
  });

  // Convertir en tableau et trier par période
  return Array.from(groupes.entries())
    .map(([periode, achats]) => ({
      periode,
      montant: achats.reduce((sum, a) => sum + a.prix_total, 0),
      nombre_achats: achats.length,
      fournisseurs: [...new Set(achats.map(a => a.fournisseur))],
    }))
    .sort((a, b) => a.periode.localeCompare(b.periode));
}

/**
 * Génère des recommandations de réapprovisionnement
 */
export function genererRecommandationsReapprovisionnement(
  ingredients: Ingredient[],
  achats: AchatIngredient[]
): RecommandationReapprovisionnement[] {
  const recommandations: RecommandationReapprovisionnement[] = [];

  ingredients.forEach(ingredient => {
    // Ne générer une recommandation que si le stock est défini
    if (ingredient.quantite_stock === undefined || ingredient.stock_minimum === undefined) {
      return;
    }

    const stockActuel = ingredient.quantite_stock;
    const stockMinimum = ingredient.stock_minimum;

    // Si le stock est suffisant, pas de recommandation
    if (stockActuel > stockMinimum) {
      return;
    }

    // Trouver le fournisseur habituel (celui avec le plus d'achats)
    const achatsIngredient = achats.filter(a => a.ingredient_id === ingredient.id);
    const fournisseurCounts = new Map<string, number>();
    
    achatsIngredient.forEach(achat => {
      const count = fournisseurCounts.get(achat.fournisseur) || 0;
      fournisseurCounts.set(achat.fournisseur, count + 1);
    });

    let fournisseurHabituel: string | undefined;
    let maxCount = 0;
    fournisseurCounts.forEach((count, fournisseur) => {
      if (count > maxCount) {
        maxCount = count;
        fournisseurHabituel = fournisseur;
      }
    });

    // Calculer le prix moyen
    const prixMoyen = achatsIngredient.length > 0
      ? achatsIngredient.reduce((sum, a) => sum + a.prix_unitaire, 0) / achatsIngredient.length
      : ingredient.prix_par_unite;

    // Déterminer l'urgence
    let urgence: "faible" | "moyenne" | "haute" | "critique";
    if (stockActuel === 0) {
      urgence = "critique";
    } else if (stockActuel <= stockMinimum * 0.3) {
      urgence = "haute";
    } else if (stockActuel <= stockMinimum * 0.6) {
      urgence = "moyenne";
    } else {
      urgence = "faible";
    }

    recommandations.push({
      ingredient_id: ingredient.id,
      ingredient_nom: ingredient.nom,
      stock_actuel: stockActuel,
      stock_minimum: stockMinimum,
      fournisseur_habituel: fournisseurHabituel,
      prix_moyen: prixMoyen,
      urgence,
    });
  });

  // Trier par urgence (critique en premier)
  const ordreUrgence = { critique: 0, haute: 1, moyenne: 2, faible: 3 };
  return recommandations.sort((a, b) => ordreUrgence[a.urgence] - ordreUrgence[b.urgence]);
}

// ============================================
// 12. PHASE 1 ANALYTICS - ABC ANALYSIS
// ============================================

/**
 * Analyse ABC des produits par rentabilité
 * Classe A: 80% du profit (produits stars)
 * Classe B: 15% du profit (produits standards)
 * Classe C: 5% du profit (produits à revoir)
 */
export function analyseABCProduits(formats: FormatVente[]): AnalyseABCProduit[] {
  // Filtrer les formats rentables et trier par profit décroissant
  const formatsRentables = formats
    .filter(f => f.profit_unitaire > 0)
    .sort((a, b) => b.profit_unitaire - a.profit_unitaire);

  if (formatsRentables.length === 0) {
    return [];
  }

  // Calculer le profit total
  const profitTotal = formatsRentables.reduce((sum, f) => sum + f.profit_unitaire, 0);

  // Calculer les contributions et classifier
  let cumulatif = 0;
  const analyse: AnalyseABCProduit[] = formatsRentables.map((format, index) => {
    const contribution = (format.profit_unitaire / profitTotal) * 100;
    cumulatif += contribution;

    let classe: ClasseABC;
    if (cumulatif <= 80) {
      classe = 'A';
    } else if (cumulatif <= 95) {
      classe = 'B';
    } else {
      classe = 'C';
    }

    return {
      format_id: format.id,
      format_nom: format.nom,
      profit_unitaire: format.profit_unitaire,
      contribution_profit: arrondir(contribution),
      contribution_cumulative: arrondir(cumulatif),
      classe,
      rang: index + 1,
    };
  });

  return analyse;
}

// ============================================
// 13. BREAK-EVEN ANALYSIS (SEUIL DE RENTABILITÉ)
// ============================================

/**
 * Calcule le seuil de rentabilité
 * Combien d'unités vendre pour couvrir les charges fixes
 */
export function calculerSeuilRentabilite(
  chargesFixesMensuelles: number,
  formats: FormatVente[]
): SeuilRentabilite {
  const formatsRentables = formats.filter(f => f.profit_unitaire > 0);

  if (formatsRentables.length === 0) {
    return {
      charges_fixes_mensuelles: chargesFixesMensuelles,
      marge_contribution_moyenne: 0,
      unites_a_vendre: 0,
      chiffre_affaires_minimum: 0,
      formats_analyse: [],
    };
  }

  // Calculer la marge de contribution moyenne (profit moyen par unité)
  const margeContributionMoyenne =
    formatsRentables.reduce((sum, f) => sum + f.profit_unitaire, 0) /
    formatsRentables.length;

  // Nombre total d'unités à vendre pour couvrir les charges
  const unitesAVendre = Math.ceil(chargesFixesMensuelles / margeContributionMoyenne);

  // Répartir proportionnellement selon le profit de chaque format
  const profitTotal = formatsRentables.reduce((sum, f) => sum + f.profit_unitaire, 0);
  
  const formatsAnalyse = formatsRentables.map(format => {
    const proportion = format.profit_unitaire / profitTotal;
    const unitesNecessaires = Math.ceil(unitesAVendre * proportion);
    const prixVente = format.prix_vente_pratique || format.prix_vente_recommande;
    const caGenere = unitesNecessaires * prixVente;

    return {
      format_id: format.id,
      format_nom: format.nom,
      unites_necessaires: unitesNecessaires,
      ca_genere: caGenere,
    };
  });

  const chiffreAffairesMinimum = formatsAnalyse.reduce((sum, f) => sum + f.ca_genere, 0);

  return {
    charges_fixes_mensuelles: chargesFixesMensuelles,
    marge_contribution_moyenne: margeContributionMoyenne,
    unites_a_vendre: unitesAVendre,
    chiffre_affaires_minimum: chiffreAffairesMinimum,
    formats_analyse: formatsAnalyse,
  };
}

// ============================================
// 14. KPI DASHBOARD
// ============================================

/**
 * Calcule tous les KPIs pour le tableau de bord
 */
export function calculerKPIDashboard(
  formats: FormatVente[],
  ingredients: Ingredient[],
  achats: AchatIngredient[]
): KPIDashboard {
  // Rentabilité
  const marges = formats.map(f => f.marge_reelle_pourcentage);
  const margeBruteMoyenne = marges.length > 0
    ? marges.reduce((a, b) => a + b, 0) / marges.length
    : 0;

  // ROI simplifié (profit total / coûts totaux)
  const profitTotal = formats.reduce((sum, f) => sum + f.profit_unitaire, 0);
  const coutsTotal = formats.reduce((sum, f) => sum + f.cout_total_revient, 0);
  const roi = coutsTotal > 0 ? (profitTotal / coutsTotal) * 100 : 0;

  // Stocks
  const valeurStockTotal = ingredients.reduce((total, ing) => {
    if (ing.quantite_stock !== undefined) {
      return total + (ing.quantite_stock * ing.prix_par_unite);
    }
    return total;
  }, 0);

  const ingredientsEnAlerte = ingredients.filter(
    i => i.quantite_stock !== undefined &&
         i.stock_minimum !== undefined &&
         i.quantite_stock <= i.stock_minimum
  ).length;

  // Fournisseurs
  const fournisseurs = [...new Set(achats.map(a => a.fournisseur))];
  const statsParFournisseur = fournisseurs.map(f =>
    calculerStatistiquesFournisseur(achats, f)
  );
  const fournisseurPrincipal = statsParFournisseur.length > 0
    ? statsParFournisseur.sort((a, b) => b.montant_total - a.montant_total)[0].fournisseur
    : "Aucun";

  // Production
  const couts = formats.map(f => f.cout_total_revient / f.quantite_cookies);
  const coutMoyenParCookie = couts.length > 0
    ? couts.reduce((a, b) => a + b, 0) / couts.length
    : 0;

  const formatPlusRentable = formats.length > 0
    ? [...formats].sort((a, b) => b.profit_unitaire - a.profit_unitaire)[0].nom
    : "Aucun";

  return {
    marge_brute_moyenne: arrondir(margeBruteMoyenne),
    marge_nette_moyenne: arrondir(margeBruteMoyenne * 0.8), // Estimation
    roi: arrondir(roi),
    valeur_stock_total: valeurStockTotal,
    rotation_stock_jours: 30, // À implémenter avec historique
    ingredients_en_alerte: ingredientsEnAlerte,
    nombre_fournisseurs: fournisseurs.length,
    fournisseur_principal: fournisseurPrincipal,
    economie_potentielle: 0, // À calculer avec comparaison fournisseurs
    cout_moyen_par_cookie: coutMoyenParCookie,
    recette_plus_rentable: formatPlusRentable,
    format_plus_rentable: formatPlusRentable,
  };
}

// ============================================
// 15. SUPPLIER COMPARISON ANALYSIS
// ============================================

/**
 * Compare les fournisseurs pour chaque ingrédient
 */
export function comparerFournisseursPourIngredients(
  ingredients: Ingredient[],
  achats: AchatIngredient[]
): ComparaisonFournisseur[] {
  const comparaisons: ComparaisonFournisseur[] = [];

  ingredients.forEach(ingredient => {
    const achatsIngredient = achats.filter(a => a.ingredient_id === ingredient.id);
    
    if (achatsIngredient.length === 0) return;

    // Grouper par fournisseur
    const parFournisseur = new Map<string, AchatIngredient[]>();
    achatsIngredient.forEach(achat => {
      if (!parFournisseur.has(achat.fournisseur)) {
        parFournisseur.set(achat.fournisseur, []);
      }
      parFournisseur.get(achat.fournisseur)!.push(achat);
    });

    // Analyser chaque fournisseur
    const fournisseursAnalyse = Array.from(parFournisseur.entries()).map(([nom, achats]) => {
      const prixMoyen = achats.reduce((sum, a) => sum + a.prix_unitaire, 0) / achats.length;
      const dernierAchat = achats.sort((a, b) => 
        new Date(b.date_achat).getTime() - new Date(a.date_achat).getTime()
      )[0].date_achat;

      // Score de fiabilité basé sur nombre d'achats et régularité
      const fiabiliteScore = Math.min(100, (achats.length * 20) + 20);

      return {
        nom,
        prix_unitaire_moyen: prixMoyen,
        nombre_achats: achats.length,
        dernier_achat: dernierAchat,
        fiabilite_score: fiabiliteScore,
      };
    });

    // Trouver le meilleur fournisseur (prix le plus bas avec fiabilité > 40)
    const fournisseursFiables = fournisseursAnalyse.filter(f => f.fiabilite_score >= 40);
    const meilleurFournisseur = fournisseursFiables.length > 0
      ? fournisseursFiables.sort((a, b) => a.prix_unitaire_moyen - b.prix_unitaire_moyen)[0].nom
      : fournisseursAnalyse[0]?.nom || "Aucun";

    // Calculer économie potentielle
    const prixMin = Math.min(...fournisseursAnalyse.map(f => f.prix_unitaire_moyen));
    const prixActuel = ingredient.prix_par_unite;
    const economieAnnuelleEstimee = prixActuel > prixMin
      ? (prixActuel - prixMin) * 1000 // Estimation avec 1000 unités/an
      : 0;

    comparaisons.push({
      ingredient_id: ingredient.id,
      ingredient_nom: ingredient.nom,
      fournisseurs: fournisseursAnalyse,
      meilleur_fournisseur: meilleurFournisseur,
      economie_annuelle_estimee: economieAnnuelleEstimee,
    });
  });

  return comparaisons.sort((a, b) => b.economie_annuelle_estimee - a.economie_annuelle_estimee);
}

// ============================================
// PHASE 3 - PRICING & PROMOTIONS
// ============================================

import type { AnalyseSensibilite, Promotion, FormatVente as FormatVenteType } from "@/types";

/**
 * Analyse de sensibilité des prix
 * Calcule l'impact de variations de prix sur le profit
 */
export function calculerAnalyseSensibilite(
  format: FormatVenteType,
  volumeVentesActuel: number = 100, // Volume de ventes actuel (unités/mois)
  elasticitePrix: number = -1.5 // Élasticité par défaut (élastique)
): AnalyseSensibilite {
  const prixActuel = format.prix_vente_pratique || format.prix_vente_recommande;
  const coutActuel = format.cout_total_revient;
  const margeActuelle = format.marge_reelle_pourcentage;

  // Variations de prix à tester : -15%, -10%, -5%, 0, +5%, +10%, +15%
  const variations = [-15, -10, -5, 0, 5, 10, 15];

  const scenarios = variations.map((variation) => {
    const nouveauPrix = prixActuel * (1 + variation / 100);
    
    // Estimer l'impact sur le volume avec l'élasticité
    // Si élasticité = -1.5 et prix augmente de 10%, volume diminue de 15%
    const variationVolume = elasticitePrix * variation;
    const estimationVolume = Math.max(0, volumeVentesActuel * (1 + variationVolume / 100));
    
    const chiffreAffaires = nouveauPrix * estimationVolume;
    const coutTotal = coutActuel * estimationVolume;
    const profitTotal = chiffreAffaires - coutTotal;
    
    const profitActuel = (prixActuel - coutActuel) * volumeVentesActuel;
    const variationProfit = profitTotal - profitActuel;

    return {
      variation_pourcentage: variation,
      nouveau_prix: nouveauPrix,
      estimation_volume: Math.round(estimationVolume),
      chiffre_affaires: chiffreAffaires,
      profit_total: profitTotal,
      variation_profit: variationProfit,
    };
  });

  // Trouver le scénario optimal (profit maximum)
  const meilleurScenario = scenarios.reduce((max, scenario) =>
    scenario.profit_total > max.profit_total ? scenario : max
  );

  const recommandation =
    meilleurScenario.variation_pourcentage === 0
      ? "Le prix actuel semble optimal"
      : meilleurScenario.variation_pourcentage > 0
      ? `Augmenter le prix de ${meilleurScenario.variation_pourcentage}% pourrait maximiser le profit (+${formaterEuro(meilleurScenario.variation_profit)})`
      : `Réduire le prix de ${Math.abs(meilleurScenario.variation_pourcentage)}% pourrait maximiser le profit (+${formaterEuro(meilleurScenario.variation_profit)})`;

  return {
    format_id: format.id,
    format_nom: format.nom,
    prix_actuel: prixActuel,
    cout_actuel: coutActuel,
    marge_actuelle: margeActuelle,
    scenarios,
    elasticite_prix: elasticitePrix,
    recommandation,
  };
}

/**
 * Applique une promotion à un prix
 */
export function appliquerPromotion(
  prixBase: number,
  promotion: Promotion,
  quantite: number = 1
): number {
  if (!promotion.actif) return prixBase;

  let prixFinal = prixBase;

  switch (promotion.type) {
    case "pourcentage":
      prixFinal = prixBase * (1 - promotion.valeur_remise / 100);
      break;
    
    case "montant_fixe":
      prixFinal = Math.max(0, prixBase - promotion.valeur_remise);
      break;
    
    case "volume":
      if (quantite >= (promotion.quantite_minimum || 0)) {
        prixFinal = prixBase * (1 - promotion.valeur_remise / 100);
      }
      break;
  }

  return prixFinal;
}

/**
 * Calcule le prix avec promotions appliquées pour un format
 */
export function calculerPrixAvecPromotions(
  format: FormatVenteType,
  promotions: Promotion[],
  quantite: number = 1
): { prixFinal: number; promotionsAppliquees: Promotion[]; remiseTotale: number } {
  const prixBase = format.prix_vente_pratique || format.prix_vente_recommande;
  let prixFinal = prixBase;
  const promotionsAppliquees: Promotion[] = [];

  // Filtrer les promotions applicables
  const promotionsActives = promotions.filter((p) => {
    if (!p.actif) return false;
    
    const maintenant = new Date();
    if (new Date(p.date_debut) > maintenant || new Date(p.date_fin) < maintenant) {
      return false;
    }

    // Vérifier si applicable à ce format
    if (p.format_ids && p.format_ids.length > 0) {
      if (!p.format_ids.includes(format.id)) return false;
    }

    // Vérifier les conditions de quantité pour les promotions volume
    if (p.type === "volume" && quantite < (p.quantite_minimum || 0)) {
      return false;
    }

    return true;
  });

  // Appliquer les promotions (on prend la meilleure)
  let meilleurePrix = prixBase;
  let meilleurePromotion: Promotion | null = null;

  promotionsActives.forEach((promo) => {
    const prixAvecPromo = appliquerPromotion(prixBase, promo, quantite);
    if (prixAvecPromo < meilleurePrix) {
      meilleurePrix = prixAvecPromo;
      meilleurePromotion = promo;
    }
  });

  if (meilleurePromotion) {
    prixFinal = meilleurePrix;
    promotionsAppliquees.push(meilleurePromotion);
  }

  const remiseTotale = prixBase - prixFinal;

  return {
    prixFinal,
    promotionsAppliquees,
    remiseTotale,
  };
}
