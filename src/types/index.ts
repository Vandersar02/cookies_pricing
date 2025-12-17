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

  // Unité de base pour cet ingrédient
  unite_achat: UniteAchat;

  // Calculés automatiquement depuis l'historique des achats
  prix_par_unite: number; // Prix moyen ou du dernier achat
  prix_par_gramme?: number; // conversion facilitée

  // Gestion de stock
  quantite_stock?: number; // Quantité disponible en stock (dans l'unité d'achat)
  stock_minimum?: number; // Seuil d'alerte de réapprovisionnement
  stock_maximum?: number; // Stock maximum recommandé

  // Traçabilité
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

  // Produits additionnels (étiquettes, rubans, décorations, etc.)
  cout_extras?: number; // coût des produits additionnels par emballage
  description_extras?: string; // description des extras (ex: "Étiquette + ruban")

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
  cout_emballage_extras: number; // coût des produits additionnels (étiquettes, rubans, etc.)
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
  
  // Phase 3: Prix par canal (optionnel, si non défini utilise prix_vente_pratique pour tous)
  prix_par_canal?: PrixParCanal[];
  
  // Phase 3: Promotions applicables
  promotions_actives?: string[]; // IDs des promotions actives
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

// ============================================
// 13. PHASE 1 ANALYTICS - ABC, KPI, BREAK-EVEN
// ============================================

export type ClasseABC = "A" | "B" | "C";

export interface AnalyseABCProduit {
  format_id: string;
  format_nom: string;
  profit_unitaire: number;
  contribution_profit: number; // % du profit total
  contribution_cumulative: number; // % cumulé
  classe: ClasseABC;
  rang: number;
}

export interface SeuilRentabilite {
  charges_fixes_mensuelles: number;
  marge_contribution_moyenne: number; // profit moyen par unité vendue
  unites_a_vendre: number; // nombre de cookies/formats à vendre
  chiffre_affaires_minimum: number;
  formats_analyse: {
    format_id: string;
    format_nom: string;
    unites_necessaires: number; // combien vendre de ce format
    ca_genere: number;
  }[];
}

export interface KPIDashboard {
  // Rentabilité
  marge_brute_moyenne: number; // %
  marge_nette_moyenne: number; // %
  roi: number; // Return on Investment %
  
  // Stocks
  valeur_stock_total: number;
  rotation_stock_jours: number; // jours moyen de rotation
  ingredients_en_alerte: number;
  
  // Fournisseurs
  nombre_fournisseurs: number;
  fournisseur_principal: string;
  economie_potentielle: number; // si on optimise les fournisseurs
  
  // Production
  cout_moyen_par_cookie: number;
  recette_plus_rentable: string;
  format_plus_rentable: string;
}

export interface ComparaisonFournisseur {
  ingredient_id: string;
  ingredient_nom: string;
  fournisseurs: {
    nom: string;
    prix_unitaire_moyen: number;
    nombre_achats: number;
    dernier_achat?: Date;
    fiabilite_score: number; // basé sur fréquence et régularité
  }[];
  meilleur_fournisseur: string;
  economie_annuelle_estimee: number;
}

// ============================================
// 14. PHASE 2 - PRODUCTION MANAGEMENT
// ============================================

export interface ProductionRecord {
  id: string;
  recette_id: string;
  recette_nom: string;
  format_vente_id?: string;
  format_vente_nom?: string;
  date_production: Date;
  quantite_produite: number; // nombre de cookies produits
  temps_preparation_minutes: number;
  temps_cuisson_minutes: number;
  temps_refroidissement_minutes: number;
  temps_total_minutes: number;
  operateur?: string; // qui a fait la production
  notes?: string;
  stock_consomme: {
    ingredient_id: string;
    ingredient_nom: string;
    quantite_consommee: number;
    unite: string;
  }[];
  statut: "planifie" | "en_cours" | "termine" | "annule";
}

export interface PlanificationProduction {
  id: string;
  date_prevue: Date;
  recette_id: string;
  recette_nom: string;
  quantite_a_produire: number;
  format_vente_id?: string;
  priorite: "basse" | "normale" | "haute" | "urgente";
  ingredients_necessaires: {
    ingredient_id: string;
    ingredient_nom: string;
    quantite_necessaire: number;
    quantite_disponible: number;
    manque: boolean;
  }[];
  temps_estime_minutes: number;
  statut: "planifie" | "pret" | "en_cours" | "termine" | "annule";
  production_id?: string; // lien vers ProductionRecord une fois executé
  notes?: string;
}

export interface TempsProductionEstimation {
  recette_id: string;
  recette_nom: string;
  nombre_cookies: number;
  temps_preparation_unitaire: number; // minutes par cookie
  temps_cuisson_par_batch: number; // minutes par fournée
  temps_refroidissement: number; // minutes
  cookies_par_batch: number; // combien de cookies par fournée
  nombre_batches: number; // nombre de fournées nécessaires
  temps_total_minutes: number;
  temps_total_heures: number;
}

// ============================================
// 15. PHASE 3 - PRICING & PROMOTIONS
// ============================================

export type TypeCanal = "boutique" | "evenement" | "en_ligne" | "livraison";

export interface PrixParCanal {
  canal: TypeCanal;
  prix_vente: number;
  marge_pourcentage: number;
  actif: boolean; // si ce canal est actif pour ce format
}

export interface Promotion {
  id: string;
  nom: string;
  description?: string;
  type: "pourcentage" | "montant_fixe" | "volume";
  
  // Remise
  valeur_remise: number; // % ou montant en G
  
  // Conditions de volume (pour type "volume")
  quantite_minimum?: number; // ex: 50 cookies minimum
  
  // Applicabilité
  recette_ids?: string[]; // Si vide, applicable à toutes
  format_ids?: string[]; // Si vide, applicable à tous
  canaux?: TypeCanal[]; // Si vide, applicable à tous canaux
  
  // Validité
  date_debut: Date;
  date_fin: Date;
  actif: boolean;
  
  // Application
  application_automatique: boolean; // ou manuelle
  code_promo?: string; // pour application manuelle
  
  notes?: string;
}

export interface AnalyseSensibilite {
  format_id: string;
  format_nom: string;
  prix_actuel: number;
  cout_actuel: number;
  marge_actuelle: number;
  
  // Scénarios de variation de prix
  scenarios: {
    variation_pourcentage: number; // -15, -10, -5, 0, +5, +10, +15
    nouveau_prix: number;
    estimation_volume: number; // estimation de l'impact sur les ventes (élasticité)
    chiffre_affaires: number;
    profit_total: number;
    variation_profit: number; // vs prix actuel
  }[];
  
  // Élasticité prix (par défaut -1.5 = élastique)
  elasticite_prix: number;
  
  recommandation?: string; // Prix recommandé basé sur l'analyse
}

// ============================================
// 11. EXPORTS & LABELS (PHASE 4)
// ============================================

export type TypeEtiquette = 
  | "prix" // Étiquette de prix pour vente
  | "ingredients" // Liste des ingrédients (allergènes, composition)
  | "production" // Numéro de lot, date de production/péremption
  | "inventaire" // Gestion de stock avec code-barres
  | "complete"; // Toutes les informations

export type FormatCodeBarre =
  | "EAN13" // Code-barres standard européen (13 chiffres)
  | "CODE128" // Code-barres alphanumérique
  | "QR"; // QR code (peut contenir plus d'infos)

export interface ConfigurationEtiquette {
  // Format d'étiquette
  largeur_mm: number; // Largeur en millimètres
  hauteur_mm: number; // Hauteur en millimètres
  
  // Type d'étiquette
  type: TypeEtiquette;
  
  // Affichage
  inclure_logo: boolean;
  inclure_code_barre: boolean;
  format_code_barre: FormatCodeBarre;
  inclure_qr_code: boolean;
  
  // Contenu (selon le type)
  afficher_prix: boolean;
  afficher_ingredients: boolean;
  afficher_allergenes: boolean;
  afficher_valeurs_nutritionnelles: boolean;
  afficher_date_production: boolean;
  afficher_date_peremption: boolean;
  jours_avant_peremption?: number; // DLC par défaut
  
  // Mise en page
  taille_police: number; // En points
  langue: "fr" | "en";
}

export interface DonneesEtiquette {
  // Produit
  format_id: string;
  nom_produit: string;
  recette_nom: string;
  quantite: number; // nombre de cookies dans le format
  
  // Prix
  prix_vente?: number;
  
  // Composition
  liste_ingredients?: string[]; // Liste ordonnée des ingrédients
  allergenes?: string[]; // Liste des allergènes présents
  
  // Dates
  date_production?: Date;
  date_peremption?: Date;
  numero_lot?: string;
  
  // Code identification
  code_barre?: string; // EAN-13 ou CODE128
  qr_code_data?: string; // URL ou données JSON
  
  // Informations légales
  poids_net?: number; // En grammes
  nom_fabricant?: string;
  adresse_fabricant?: string;
  
  // Valeurs nutritionnelles (optionnel)
  valeurs_nutritionnelles?: {
    energie_kj: number;
    energie_kcal: number;
    matieres_grasses_g: number;
    acides_gras_satures_g: number;
    glucides_g: number;
    sucres_g: number;
    proteines_g: number;
    sel_g: number;
  };
}

export interface ExportConfiguration {
  // Type d'export
  format: "csv" | "excel" | "pdf" | "json";
  
  // Données à exporter
  inclure_ingredients: boolean;
  inclure_recettes: boolean;
  inclure_formats: boolean;
  inclure_achats: boolean;
  inclure_stocks: boolean;
  inclure_productions: boolean;
  inclure_analyses: boolean;
  
  // Période
  date_debut?: Date;
  date_fin?: Date;
  
  // Options
  separator?: string; // Pour CSV (virgule ou point-virgule)
  devise?: string; // Symbole de devise
}

// Service Worker pour mode hors-ligne
export interface SyncStatus {
  derniere_sync: Date | null;
  sync_en_cours: boolean;
  mode_hors_ligne: boolean;
  donnees_en_attente: number; // Nombre de modifications non synchronisées
}

export interface ModificationHorsLigne {
  id: string;
  type: "create" | "update" | "delete";
  entity: string; // "ingredient", "recette", "format", etc.
  entity_id: string;
  data: any;
  timestamp: Date;
}
