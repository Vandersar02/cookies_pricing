/**
 * TYPES MÉTIER - LOGICIEL COOKIE PRICING
 * Architecture complète des entités
 */

// ============================================
// 1. INGRÉDIENTS
// ============================================

export type UniteAchat = "kg" | "g" | "L" | "mL" | "unité" | "paquet";

export type CategorieIngredient =
  | "farine"
  | "sucre"
  | "gras"
  | "œufs"
  | "additif"
  | "chocolat"
  | "autre"
  | string; // Permet les catégories personnalisées

// Historique d'achat d'un ingrédient
export interface AchatIngredient {
  id: string;
  ingredient_id: string;
  ingredient_nom: string; // denormalisé pour affichage
  fournisseur: string;
  quantite: number;
  unite: UniteAchat;
  prix_total: number;
  prix_unitaire: number; // calculé
  date_achat: Date;
  notes?: string;
}

export interface Ingredient {
  id: string;
  nom: string;
  categorie: string; // Changé pour accepter toute chaîne de caractères

  // Achat
  unite_achat: UniteAchat;
  quantite_achetee: number;
  prix_achat_total: number;

  // Calculés automatiquement
  prix_par_unite: number; // = prix_achat_total / quantite_achetee
  prix_par_gramme?: number; // conversion facilitée

  // Gestion de stock
  quantite_stock?: number; // Quantité disponible en stock (dans l'unité d'achat)
  stock_minimum?: number; // Seuil d'alerte de réapprovisionnement
  stock_maximum?: number; // Stock maximum recommandé

  // Traçabilité
  fournisseur?: string;
  date_achat?: Date;
  date_expiration?: Date;
  notes?: string;

  // Métadonnées
  actif: boolean;
  date_creation: Date;
  derniere_modification: Date;
}

// ============================================
// 2. RECETTES
// ============================================

export interface IngredientRecette {
  ingredient_id: string;
  ingredient_nom: string; // denormalisé pour affichage
  quantite_necessaire: number;
  unite: UniteAchat;
  cout_calcule: number; // calculé automatiquement
}

export type NiveauRecette = "standard" | "premium" | "luxe";

export interface Recette {
  id: string;
  nom: string;
  description?: string;
  niveau: NiveauRecette;

  // Production
  nombre_cookies_produits: number; // combien de cookies fait cette recette
  temps_preparation_minutes?: number;
  temperature_cuisson?: number;

  // Ingrédients
  ingredients: IngredientRecette[];

  // Calculés automatiquement
  cout_total_ingredients: number;
  cout_par_cookie_ingredients: number; // = cout_total / nombre_cookies

  // Énergie (optionnel)
  cout_energie_four?: number;

  // Métadonnées
  actif: boolean;
  date_creation: Date;
  derniere_modification: Date;
  notes?: string;
}

// ============================================
// 3. TYPES DE COOKIES (Produit fini)
// ============================================

export interface TypeCookie {
  id: string;
  nom: string;
  recette_id: string;
  recette_nom: string; // denormalisé

  // Coûts (calculés)
  cout_ingredients: number; // de la recette
  cout_production_unitaire: number; // avec charges

  // Caractéristiques
  poids_unitaire_grammes?: number;
  niveau_qualite: NiveauRecette;

  // Coût réel final
  prix_revient_reel: number; // après pertes et charges

  // Métadonnées
  actif: boolean;
  date_creation: Date;
  notes?: string;
}

// ============================================
// 4. EMBALLAGES
// ============================================

export type TypeEmballage = "sachet" | "boite" | "carton" | "luxe" | "vrac";

export interface Emballage {
  id: string;
  nom: string;
  type: TypeEmballage;

  capacite_cookies: number; // combien de cookies dedans
  cout_unitaire: number; // prix d'UN emballage

  // Détails
  fournisseur?: string;
  materiau?: string;
  quantite_stock?: number;

  // Calculé
  cout_par_cookie: number; // = cout_unitaire / capacite_cookies

  // Métadonnées
  actif: boolean;
  date_creation: Date;
  notes?: string;
}

// ============================================
// 5. CHARGES GLOBALES
// ============================================

export type PeriodeCharge = "mensuel" | "par_batch" | "annuel";
export type MethodeRepartition = "par_cookie" | "par_batch" | "pourcentage";

export interface ChargesDetail {
  electricite_gaz: number;
  transport: number;
  loyer_atelier?: number;
  eau?: number;
  entretien_materiel?: number;
  assurance?: number;
  main_oeuvre?: number;
}

export interface ChargesGlobales {
  id: string;
  nom: string;
  periode: PeriodeCharge;

  charges: ChargesDetail;
  total_charges: number; // somme de toutes les charges

  // Méthode de répartition
  methode_repartition: MethodeRepartition;
  nombre_cookies_produits_periode?: number;
  pourcentage_charges?: number; // si méthode = pourcentage

  // Calculé
  charge_par_cookie: number;

  // Métadonnées
  actif: boolean;
  date_creation: Date;
  notes?: string;
}

// ============================================
// 6. PERTES & GASPILLAGE
// ============================================

export type TypePerte =
  | "cuisson"
  | "cassure"
  | "erreur"
  | "invendus"
  | "peremption";
export type ApplicationPerte = "ingredients" | "production" | "vente";

export interface Perte {
  id: string;
  nom: string;
  type_perte: TypePerte;

  taux_perte_pourcentage: number; // ex: 5 (pour 5%)

  // Application
  applique_sur: ApplicationPerte;

  // Métadonnées
  actif: boolean;
  date_creation: Date;
  notes?: string;
}

// ============================================
// 7. FORMATS DE VENTE
// ============================================

export type CanalVente = "boutique" | "evenement" | "gros" | "online";

export interface FormatVente {
  id: string;
  nom: string;
  description?: string;

  // Composition
  type_cookie_id: string;
  type_cookie_nom: string; // denormalisé
  quantite_cookies: number;
  emballage_id: string;
  emballage_nom: string; // denormalisé

  // Coûts calculés
  cout_cookies: number; // = cout_par_cookie × quantite
  cout_emballage: number;
  cout_charges: number; // charges réparties
  cout_pertes: number; // impact pertes
  cout_total_revient: number; // SOMME totale

  // Pricing
  marge_cible_pourcentage: number; // ex: 40
  prix_vente_recommande: number;
  prix_vente_pratique?: number; // prix réel si différent

  // Rentabilité calculée
  profit_unitaire: number;
  marge_reelle_pourcentage: number;

  // Métadonnées
  canal_vente: CanalVente;
  actif: boolean;
  date_creation: Date;
  notes?: string;
}

// ============================================
// 8. SIMULATION DE PRIX
// ============================================

export type TypeModification = "ingredient" | "charge" | "perte" | "emballage";

export interface ModificationSimulation {
  type: TypeModification;
  element_id: string;
  element_nom: string;
  valeur_actuelle: number;
  variation_pourcentage: number; // ex: +20, -10
  nouvelle_valeur: number;
}

export interface ImpactSimulation {
  format_vente_id: string;
  format_vente_nom: string;
  cout_avant: number;
  cout_apres: number;
  variation_cout_euro: number;
  variation_cout_pourcentage: number;
  prix_vente_avant: number;
  prix_vente_apres: number;
  marge_avant: number;
  marge_apres: number;
}

export interface Simulation {
  id: string;
  nom: string;
  description?: string;
  date: Date;

  modifications: ModificationSimulation[];
  impacts: ImpactSimulation[];

  notes?: string;
}

// ============================================
// 9. RÉSULTATS & ANALYSES
// ============================================

export interface ResultatCookie {
  cookie_id: string;
  cookie_nom: string;
  recette_nom: string;

  // Coûts détaillés
  cout_ingredients: number;
  cout_emballage_moyen: number;
  cout_charges: number;
  cout_pertes: number;
  cout_total: number;

  // Pricing moyen (si plusieurs formats)
  prix_vente_moyen: number;
  marge_moyenne: number;
  profit_moyen: number;

  // Volume
  quantite_vendue_mois?: number;
  chiffre_affaires_mois?: number;
}

export interface ComparaisonVarietes {
  cookies: ResultatCookie[];
  date_analyse: Date;
}

export interface AlerteRentabilite {
  id: string;
  type: "marge_faible" | "cout_eleve" | "prix_ingredient" | "perte_elevee";
  severite: "info" | "warning" | "danger";
  element_concerne: string;
  message: string;
  date: Date;
  resolu: boolean;
}

// ============================================
// 10. STORE / STATE
// ============================================

export interface AppState {
  // Données
  ingredients: Ingredient[];
  recettes: Recette[];
  cookies: TypeCookie[];
  emballages: Emballage[];
  charges: ChargesGlobales[];
  pertes: Perte[];
  formats_vente: FormatVente[];
  simulations: Simulation[];
  achats: AchatIngredient[]; // Historique des achats

  // UI State
  page_active: string;
  alertes: AlerteRentabilite[];

  // Actions (seront définies dans le store)
}

// ============================================
// 11. UTILITAIRES DE CALCUL (Résultats)
// ============================================

export interface CalculCoutCookie {
  cout_ingredients: number;
  cout_emballage: number;
  cout_charges: number;
  cout_pertes: number;
  cout_total: number;
}

export interface CalculPricing {
  cout_revient: number;
  marge_cible: number;
  prix_minimum: number;
  prix_recommande: number;
  prix_pratique?: number;
  profit: number;
  marge_reelle: number;
  rentable: boolean;
}

// ============================================
// 12. ANALYTICS ACHATS & FOURNISSEURS
// ============================================

export type PeriodeAnalyse = "hebdomadaire" | "mensuelle" | "trimestrielle" | "annuelle";

export interface StatistiquesFournisseur {
  fournisseur: string;
  nombre_achats: number;
  montant_total: number;
  montant_moyen: number;
  dernier_achat?: Date;
  premier_achat?: Date;
  ingredients: string[]; // Liste des ingrédients achetés
  frequence_jours?: number; // Fréquence moyenne en jours entre achats
}

export interface DepensesPeriode {
  periode: string; // ex: "2024-W01", "2024-01", "2024-Q1", "2024"
  montant: number;
  nombre_achats: number;
  fournisseurs: string[];
}

export interface RecommandationReapprovisionnement {
  ingredient_id: string;
  ingredient_nom: string;
  stock_actuel: number;
  stock_minimum: number;
  fournisseur_habituel?: string;
  prix_moyen: number;
  jours_avant_rupture?: number;
  urgence: "faible" | "moyenne" | "haute" | "critique";
}
