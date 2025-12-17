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
  CalculPricing
} from '@/types';

// ============================================
// 1. CONVERSIONS D'UNITÉS
// ============================================

/**
 * Convertit une quantité en grammes
 */
export function convertirEnGrammes(quantite: number, unite: string): number {
  const conversions: Record<string, number> = {
    'kg': 1000,
    'g': 1,
    'L': 1000, // approximation pour liquides (densité ~1)
    'mL': 1,
    'unité': 1,
    'paquet': 1,
  };
  
  return quantite * (conversions[unite] || 1);
}

/**
 * Calcule le prix par gramme d'un ingrédient
 */
export function calculerPrixParGramme(ingredient: Ingredient): number {
  const grammesTotal = convertirEnGrammes(
    ingredient.quantite_achetee, 
    ingredient.unite_achat
  );
  
  return grammesTotal > 0 ? ingredient.prix_achat_total / grammesTotal : 0;
}

/**
 * Calcule le prix par unité d'un ingrédient
 */
export function calculerPrixParUnite(ingredient: Ingredient): number {
  return ingredient.quantite_achetee > 0 
    ? ingredient.prix_achat_total / ingredient.quantite_achetee 
    : 0;
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
  
  // 2. Coût emballage
  const coutEmballage = emballage.cout_unitaire;
  
  // 3. Charges réparties sur le format
  const chargesActives = chargesGlobales.filter(c => c.actif);
  const coutCharges = chargesActives.reduce((total, charge) => {
    const chargeParCookie = calculerChargeParCookie(charge, coutParCookie);
    return total + (chargeParCookie * format.quantite_cookies);
  }, 0);
  
  // 4. Pertes
  const pertesActives = pertes.filter(p => p.actif);
  const tauxPerteTotal = pertesActives.reduce((total, perte) => {
    return total + perte.taux_perte_pourcentage;
  }, 0);
  
  const coutAvantPertes = coutCookies + coutEmballage + coutCharges;
  const coutPertes = calculerCoutPertes(coutAvantPertes, tauxPerteTotal);
  
  // 5. Coût total de revient
  const coutTotalRevient = coutAvantPertes + coutPertes;
  
  // 6. Pricing
  const pricing = calculerPricingComplet(
    coutTotalRevient,
    format.marge_cible_pourcentage,
    format.prix_vente_pratique
  );
  
  return {
    ...format,
    cout_cookies: coutCookies,
    cout_emballage: coutEmballage,
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
 * Calcule le seuil de rentabilité (break-even)
 */
export function calculerSeuilRentabilite(
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
