/**
 * STORE ZUSTAND - GESTION GLOBALE DE L'ÉTAT
 * Avec persistence localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Ingredient,
  Recette,
  TypeCookie,
  Emballage,
  ChargesGlobales,
  Perte,
  FormatVente,
  Simulation,
  AlerteRentabilite,
  AchatIngredient,
  ProductionRecord,
  PlanificationProduction,
} from "@/types";

import {
  genererID,
  calculerPrixParGramme,
  calculerPrixParUniteDepuisAchats,
  calculerRecetteComplete,
  calculerCoutEmballageParCookie,
  calculerTotalCharges,
  calculerFormatVenteComplet,
} from "@/utils/calculs";

interface AppState {
  // ============ DONNÉES ============
  ingredients: Ingredient[];
  recettes: Recette[];
  cookies: TypeCookie[];
  emballages: Emballage[];
  charges: ChargesGlobales[];
  pertes: Perte[];
  formatsVente: FormatVente[];
  simulations: Simulation[];
  alertes: AlerteRentabilite[];
  categoriesPersonnalisees: string[]; // Catégories personnalisées ajoutées par l'utilisateur
  achats: AchatIngredient[]; // Historique des achats
  productions: ProductionRecord[]; // Historique des productions
  planifications: PlanificationProduction[]; // Planifications de production

  // ============ UI ============
  pageActive: string;

  // ============ ACTIONS CATÉGORIES ============
  ajouterCategoriePersonnalisee: (categorie: string) => void;
  supprimerCategoriePersonnalisee: (categorie: string) => void;

  // ============ ACTIONS INGRÉDIENTS ============
  ajouterIngredient: (
    ingredient: Omit<
      Ingredient,
      | "id"
      | "date_creation"
      | "derniere_modification"
      | "prix_par_unite"
      | "actif"
    >
  ) => void;
  modifierIngredient: (id: string, modifications: Partial<Ingredient>) => void;
  supprimerIngredient: (id: string) => void;
  recalculerPrixIngredient: (id: string) => void;
  recalculerTousPrixIngredients: () => void;

  // ============ ACTIONS RECETTES ============
  ajouterRecette: (
    recette: Omit<
      Recette,
      | "id"
      | "date_creation"
      | "derniere_modification"
      | "cout_total_ingredients"
      | "cout_par_cookie_ingredients"
      | "actif"
    >
  ) => void;
  modifierRecette: (id: string, modifications: Partial<Recette>) => void;
  supprimerRecette: (id: string) => void;
  recalculerRecette: (id: string) => void;

  // ============ ACTIONS EMBALLAGES ============
  ajouterEmballage: (
    emballage: Omit<
      Emballage,
      "id" | "date_creation" | "cout_par_cookie" | "actif"
    >
  ) => void;
  modifierEmballage: (id: string, modifications: Partial<Emballage>) => void;
  supprimerEmballage: (id: string) => void;

  // ============ ACTIONS CHARGES ============
  ajouterCharges: (
    charges: Omit<
      ChargesGlobales,
      "id" | "date_creation" | "total_charges" | "charge_par_cookie" | "actif"
    >
  ) => void;
  modifierCharges: (
    id: string,
    modifications: Partial<ChargesGlobales>
  ) => void;
  supprimerCharges: (id: string) => void;

  // ============ ACTIONS PERTES ============
  ajouterPerte: (perte: Omit<Perte, "id" | "date_creation" | "actif">) => void;
  modifierPerte: (id: string, modifications: Partial<Perte>) => void;
  supprimerPerte: (id: string) => void;

  // ============ ACTIONS FORMATS VENTE ============
  ajouterFormatVente: (
    format: Omit<
      FormatVente,
      | "id"
      | "date_creation"
      | "cout_cookies"
      | "cout_emballage"
      | "cout_emballage_extras"
      | "cout_charges"
      | "cout_pertes"
      | "cout_total_revient"
      | "prix_vente_recommande"
      | "profit_unitaire"
      | "marge_reelle_pourcentage"
      | "actif"
    >
  ) => void;
  modifierFormatVente: (
    id: string,
    modifications: Partial<FormatVente>
  ) => void;
  supprimerFormatVente: (id: string) => void;
  recalculerFormatVente: (id: string) => void;
  recalculerTousFormatsVente: () => void;

  // ============ ACTIONS SIMULATIONS ============
  ajouterSimulation: (simulation: Omit<Simulation, "id">) => void;
  supprimerSimulation: (id: string) => void;

  // ============ ACTIONS ACHATS ============
  ajouterAchat: (achat: Omit<AchatIngredient, "id" | "prix_unitaire">) => void;
  supprimerAchat: (id: string) => void;
  getAchatsByFournisseur: (fournisseur: string) => AchatIngredient[];
  getAchatsByIngredient: (ingredient_id: string) => AchatIngredient[];

  // ============ ACTIONS ALERTES ============
  genererAlertes: () => void;

  // ============ ACTIONS PRODUCTION ============
  ajouterProduction: (production: Omit<ProductionRecord, "id">) => void;
  modifierProduction: (id: string, modifications: Partial<ProductionRecord>) => void;
  supprimerProduction: (id: string) => void;
  terminerProduction: (id: string) => void; // Termine et consomme le stock
  
  // ============ ACTIONS PLANIFICATION ============
  ajouterPlanification: (planification: Omit<PlanificationProduction, "id" | "ingredients_necessaires" | "temps_estime_minutes">) => void;
  modifierPlanification: (id: string, modifications: Partial<PlanificationProduction>) => void;
  supprimerPlanification: (id: string) => void;
  executerPlanification: (id: string) => void; // Crée une production à partir d'une planification

  // ============ UI ============
  changerPage: (page: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ============ ÉTAT INITIAL ============
      ingredients: [],
      recettes: [],
      cookies: [],
      emballages: [],
      charges: [],
      pertes: [],
      formatsVente: [],
      simulations: [],
      alertes: [],
      categoriesPersonnalisees: [],
      achats: [],
      productions: [],
      planifications: [],
      pageActive: "dashboard",

      // ============ ACTIONS CATÉGORIES ============
      ajouterCategoriePersonnalisee: (categorie: string) => {
        set((state: AppState) => {
          const categorieNormalisee = categorie.toLowerCase().trim();
          // Vérifier si la catégorie n'existe pas déjà
          if (state.categoriesPersonnalisees.includes(categorieNormalisee)) {
            return state;
          }
          return {
            categoriesPersonnalisees: [...state.categoriesPersonnalisees, categorieNormalisee],
          };
        });
      },

      supprimerCategoriePersonnalisee: (categorie: string) => {
        set((state: AppState) => ({
          categoriesPersonnalisees: state.categoriesPersonnalisees.filter(
            (cat: string) => cat !== categorie
          ),
        }));
      },

      // ============ ACTIONS INGRÉDIENTS ============
      ajouterIngredient: (ingredient: Omit<Ingredient, | "id" | "date_creation" | "derniere_modification" | "prix_par_unite" | "actif">) => {
        const nouvelIngredient: Ingredient = {
          ...ingredient,
          id: genererID(),
          prix_par_unite: 0, // Sera calculé depuis les achats
          prix_par_gramme: 0,
          actif: true,
          date_creation: new Date(),
          derniere_modification: new Date(),
        };

        set((state: AppState) => ({
          ingredients: [...state.ingredients, nouvelIngredient],
        }));

        // Recalculer toutes les recettes qui utilisent cet ingrédient
        get().recalculerTousFormatsVente();
      },

      modifierIngredient: (id: string, modifications: Partial<Ingredient>) => {
        set((state: AppState) => ({
          ingredients: state.ingredients.map((ing: Ingredient) => {
            if (ing.id !== id) return ing;

            return {
              ...ing,
              ...modifications,
              derniere_modification: new Date(),
            };
          }),
        }));

        get().recalculerTousFormatsVente();
      },

      supprimerIngredient: (id: string) => {
        set((state: AppState) => ({
          ingredients: state.ingredients.filter((ing: Ingredient) => ing.id !== id),
        }));
      },

      recalculerPrixIngredient: (id: string) => {
        const { achats } = get();
        
        set((state: AppState) => ({
          ingredients: state.ingredients.map((ing: Ingredient) => {
            if (ing.id !== id) return ing;

            const prixParUnite = calculerPrixParUniteDepuisAchats(id, achats);
            const prixParGramme = prixParUnite > 0 ? calculerPrixParGramme({
              ...ing,
              prix_par_unite: prixParUnite,
            }) : 0;

            return {
              ...ing,
              prix_par_unite: prixParUnite,
              prix_par_gramme: prixParGramme,
            };
          }),
        }));
      },

      recalculerTousPrixIngredients: () => {
        const { achats } = get();
        
        // Batch update all ingredient prices in a single state update
        set((state: AppState) => ({
          ingredients: state.ingredients.map((ing: Ingredient) => {
            const prixParUnite = calculerPrixParUniteDepuisAchats(ing.id, achats);
            const prixParGramme = prixParUnite > 0 ? calculerPrixParGramme({
              ...ing,
              prix_par_unite: prixParUnite,
            }) : 0;

            return {
              ...ing,
              prix_par_unite: prixParUnite,
              prix_par_gramme: prixParGramme,
            };
          }),
        }));
        
        get().recalculerTousFormatsVente();
      },

      // ============ ACTIONS RECETTES ============
      ajouterRecette: (recette: Omit<Recette, | "id" | "date_creation" | "derniere_modification" | "cout_total_ingredients" | "cout_par_cookie_ingredients" | "actif">) => {
        const ingredients = get().ingredients;
        const recetteComplete = calculerRecetteComplete(
          {
            ...recette,
            id: genererID(),
            cout_total_ingredients: 0,
            cout_par_cookie_ingredients: 0,
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          },
          ingredients
        );

        set((state: AppState) => ({
          recettes: [...state.recettes, recetteComplete],
        }));
      },

      modifierRecette: (id: string, modifications: Partial<Recette>) => {
        const ingredients = get().ingredients;

        set((state: AppState) => ({
          recettes: state.recettes.map((rec: Recette) => {
            if (rec.id !== id) return rec;

            const modifie = {
              ...rec,
              ...modifications,
              derniere_modification: new Date(),
            };
            return calculerRecetteComplete(modifie, ingredients);
          }),
        }));

        get().recalculerTousFormatsVente();
      },

      supprimerRecette: (id: string) => {
        set((state: AppState) => ({
          recettes: state.recettes.filter((rec: Recette) => rec.id !== id),
        }));
      },

      recalculerRecette: (id: string) => {
        const ingredients = get().ingredients;

        set((state: AppState) => ({
          recettes: state.recettes.map((rec: Recette) => {
            if (rec.id !== id) return rec;
            return calculerRecetteComplete(rec, ingredients);
          }),
        }));
      },

      // ============ ACTIONS EMBALLAGES ============
      ajouterEmballage: (emballage: Omit<Emballage, "id" | "date_creation" | "cout_par_cookie" | "actif">) => {
        const nouvelEmballage: Emballage = {
          ...emballage,
          id: genererID(),
          cout_par_cookie: calculerCoutEmballageParCookie({
            ...emballage,
            id: "",
            cout_par_cookie: 0,
            actif: true,
            date_creation: new Date(),
          }),
          actif: true,
          date_creation: new Date(),
        };

        set((state: AppState) => ({
          emballages: [...state.emballages, nouvelEmballage],
        }));
      },

      modifierEmballage: (id: string, modifications: Partial<Emballage>) => {
        set((state: AppState) => ({
          emballages: state.emballages.map((emb: Emballage) => {
            if (emb.id !== id) return emb;

            const modifie = { ...emb, ...modifications };
            return {
              ...modifie,
              cout_par_cookie: calculerCoutEmballageParCookie(modifie),
            };
          }),
        }));

        get().recalculerTousFormatsVente();
      },

      supprimerEmballage: (id: string) => {
        set((state: AppState) => ({
          emballages: state.emballages.filter((emb: Emballage) => emb.id !== id),
        }));
      },

      // ============ ACTIONS CHARGES ============
      ajouterCharges: (charges: Omit<ChargesGlobales, "id" | "date_creation" | "total_charges" | "charge_par_cookie" | "actif">) => {
        const nouvellesCharges: ChargesGlobales = {
          ...charges,
          id: genererID(),
          total_charges: calculerTotalCharges({
            ...charges,
            id: "",
            total_charges: 0,
            charge_par_cookie: 0,
            actif: true,
            date_creation: new Date(),
          }),
          charge_par_cookie: 0,
          actif: true,
          date_creation: new Date(),
        };

        set((state: AppState) => ({
          charges: [...state.charges, nouvellesCharges],
        }));

        get().recalculerTousFormatsVente();
      },

      modifierCharges: (id: string, modifications: Partial<ChargesGlobales>) => {
        set((state: AppState) => ({
          charges: state.charges.map((ch: ChargesGlobales) => {
            if (ch.id !== id) return ch;

            const modifie = { ...ch, ...modifications };
            return {
              ...modifie,
              total_charges: calculerTotalCharges(modifie),
            };
          }),
        }));

        get().recalculerTousFormatsVente();
      },

      supprimerCharges: (id: string) => {
        set((state: AppState) => ({
          charges: state.charges.filter((ch: ChargesGlobales) => ch.id !== id),
        }));
      },

      // ============ ACTIONS PERTES ============
      ajouterPerte: (perte: Omit<Perte, "id" | "date_creation" | "actif">) => {
        const nouvellePerte: Perte = {
          ...perte,
          id: genererID(),
          actif: true,
          date_creation: new Date(),
        };

        set((state: AppState) => ({
          pertes: [...state.pertes, nouvellePerte],
        }));

        get().recalculerTousFormatsVente();
      },

      modifierPerte: (id: string, modifications: Partial<Perte>) => {
        set((state: AppState) => ({
          pertes: state.pertes.map((p: Perte) =>
            p.id === id ? { ...p, ...modifications } : p
          ),
        }));

        get().recalculerTousFormatsVente();
      },

      supprimerPerte: (id: string) => {
        set((state: AppState) => ({
          pertes: state.pertes.filter((p: Perte) => p.id !== id),
        }));
      },

      // ============ ACTIONS FORMATS VENTE ============
      ajouterFormatVente: (format: Omit<FormatVente, | "id" | "date_creation" | "cout_cookies" | "cout_emballage" | "cout_emballage_extras" | "cout_charges" | "cout_pertes" | "cout_total_revient" | "prix_vente_recommande" | "profit_unitaire" | "marge_reelle_pourcentage" | "actif">) => {
        const { recettes, emballages, charges, pertes } = get();

        const recette = recettes.find((r: Recette) => r.id === format.type_cookie_id);
        const emballage = emballages.find((e: Emballage) => e.id === format.emballage_id);

        if (!recette || !emballage) {
          console.error("Recette ou emballage introuvable");
          return;
        }

        const formatComplet = calculerFormatVenteComplet(
          {
            ...format,
            id: genererID(),
            cout_cookies: 0,
            cout_emballage: 0,
            cout_emballage_extras: 0,
            cout_charges: 0,
            cout_pertes: 0,
            cout_total_revient: 0,
            prix_vente_recommande: 0,
            profit_unitaire: 0,
            marge_reelle_pourcentage: 0,
            actif: true,
            date_creation: new Date(),
          },
          recette.cout_par_cookie_ingredients,
          emballage,
          charges,
          pertes
        );

        set((state: AppState) => ({
          formatsVente: [...state.formatsVente, formatComplet],
        }));
      },

      modifierFormatVente: (id: string, modifications: Partial<FormatVente>) => {
        set((state: AppState) => ({
          formatsVente: state.formatsVente.map((f: FormatVente) =>
            f.id === id ? { ...f, ...modifications } : f
          ),
        }));

        get().recalculerFormatVente(id);
      },

      supprimerFormatVente: (id: string) => {
        set((state: AppState) => ({
          formatsVente: state.formatsVente.filter((f: FormatVente) => f.id !== id),
        }));
      },

      recalculerFormatVente: (id: string) => {
        const { recettes, emballages, charges, pertes, formatsVente } = get();

        const format = formatsVente.find((f: FormatVente) => f.id === id);
        if (!format) return;

        const recette = recettes.find((r: Recette) => r.id === format.type_cookie_id);
        const emballage = emballages.find((e: Emballage) => e.id === format.emballage_id);

        if (!recette || !emballage) return;

        const formatRecalcule = calculerFormatVenteComplet(
          format,
          recette.cout_par_cookie_ingredients,
          emballage,
          charges,
          pertes
        );

        set((state: AppState) => ({
          formatsVente: state.formatsVente.map((f: FormatVente) =>
            f.id === id ? formatRecalcule : f
          ),
        }));
      },

      recalculerTousFormatsVente: () => {
        const { formatsVente } = get();
        formatsVente.forEach((f: FormatVente) => get().recalculerFormatVente(f.id));
      },

      // ============ ACTIONS SIMULATIONS ============
      ajouterSimulation: (simulation: Omit<Simulation, "id">) => {
        set((state: AppState) => ({
          simulations: [
            ...state.simulations,
            { ...simulation, id: genererID() },
          ],
        }));
      },

      supprimerSimulation: (id: string) => {
        set((state: AppState) => ({
          simulations: state.simulations.filter((s: Simulation) => s.id !== id),
        }));
      },

      // ============ ACTIONS ACHATS ============
      ajouterAchat: (achat: Omit<AchatIngredient, "id" | "prix_unitaire">) => {
        const nouvelAchat: AchatIngredient = {
          ...achat,
          id: genererID(),
          prix_unitaire: achat.quantite > 0 ? achat.prix_total / achat.quantite : 0,
        };

        set((state: AppState) => ({
          achats: [...state.achats, nouvelAchat],
        }));

        // Recalculer le prix de l'ingrédient concerné
        get().recalculerPrixIngredient(achat.ingredient_id);
        get().recalculerTousFormatsVente();
      },

      supprimerAchat: (id: string) => {
        const achat = get().achats.find((a: AchatIngredient) => a.id === id);
        
        set((state: AppState) => ({
          achats: state.achats.filter((a: AchatIngredient) => a.id !== id),
        }));

        // Recalculer le prix de l'ingrédient concerné
        if (achat) {
          get().recalculerPrixIngredient(achat.ingredient_id);
          get().recalculerTousFormatsVente();
        }
      },

      getAchatsByFournisseur: (fournisseur: string) => {
        return get().achats.filter((a: AchatIngredient) => a.fournisseur === fournisseur);
      },

      getAchatsByIngredient: (ingredient_id: string) => {
        return get().achats.filter((a: AchatIngredient) => a.ingredient_id === ingredient_id);
      },

      // ============ ACTIONS ALERTES ============
      genererAlertes: () => {
        const { formatsVente } = get();
        const alertes: AlerteRentabilite[] = [];

        formatsVente.forEach((format: FormatVente) => {
          // Alerte marge faible
          if (format.marge_reelle_pourcentage < 30) {
            alertes.push({
              id: genererID(),
              type: "marge_faible",
              severite:
                format.marge_reelle_pourcentage < 20 ? "danger" : "warning",
              element_concerne: format.nom,
              message: `Marge de ${format.marge_reelle_pourcentage.toFixed(
                1
              )}% sur "${format.nom}"`,
              date: new Date(),
              resolu: false,
            });
          }

          // Alerte non rentable
          if (format.profit_unitaire <= 0) {
            alertes.push({
              id: genererID(),
              type: "marge_faible",
              severite: "danger",
              element_concerne: format.nom,
              message: `"${format.nom}" n'est pas rentable !`,
              date: new Date(),
              resolu: false,
            });
          }
        });

        set({ alertes });
      },

      // ============ ACTIONS PRODUCTION ============
      ajouterProduction: (production) => {
        set((state: AppState) => ({
          productions: [
            ...state.productions,
            {
              ...production,
              id: genererID(),
            },
          ],
        }));
      },

      modifierProduction: (id, modifications) => {
        set((state: AppState) => ({
          productions: state.productions.map((p) =>
            p.id === id ? { ...p, ...modifications } : p
          ),
        }));
      },

      supprimerProduction: (id) => {
        set((state: AppState) => ({
          productions: state.productions.filter((p) => p.id !== id),
        }));
      },

      terminerProduction: (id) => {
        set((state: AppState) => {
          const production = state.productions.find((p) => p.id === id);
          if (!production || production.statut === "termine") {
            return state;
          }

          // Consommer le stock automatiquement
          const ingredientsUpdated = state.ingredients.map((ing) => {
            const consommation = production.stock_consomme.find(
              (s) => s.ingredient_id === ing.id
            );
            if (consommation && ing.quantite_stock !== undefined) {
              return {
                ...ing,
                quantite_stock: Math.max(
                  0,
                  ing.quantite_stock - consommation.quantite_consommee
                ),
              };
            }
            return ing;
          });

          // Marquer la production comme terminée
          const productionsUpdated = state.productions.map((p) =>
            p.id === id ? { ...p, statut: "termine" as const } : p
          );

          return {
            ingredients: ingredientsUpdated,
            productions: productionsUpdated,
          };
        });
      },

      // ============ ACTIONS PLANIFICATION ============
      ajouterPlanification: (planification) => {
        set((state: AppState) => {
          const recette = state.recettes.find(
            (r) => r.id === planification.recette_id
          );
          if (!recette) return state;

          // Calculer les ingrédients nécessaires
          const quantiteRecettes = Math.ceil(
            planification.quantite_a_produire / recette.nombre_cookies_produits
          );
          
          const ingredientsNecessaires = recette.ingredients.map((ing) => {
            const ingredient = state.ingredients.find(
              (i) => i.id === ing.ingredient_id
            );
            const quantiteNecessaire = ing.quantite_necessaire * quantiteRecettes;
            const quantiteDisponible = ingredient?.quantite_stock || 0;

            return {
              ingredient_id: ing.ingredient_id,
              ingredient_nom: ing.ingredient_nom,
              quantite_necessaire: quantiteNecessaire,
              quantite_disponible: quantiteDisponible,
              manque: quantiteNecessaire > quantiteDisponible,
            };
          });

          // Estimer le temps (valeurs par défaut, à ajuster)
          const tempsPreparation = 30; // 30 min de préparation
          const tempsCuissonParBatch = 15; // 15 min par fournée
          const cookiesParBatch = 24; // 24 cookies par fournée
          const nombreBatches = Math.ceil(
            planification.quantite_a_produire / cookiesParBatch
          );
          const tempsRefroidissement = 20; // 20 min de refroidissement
          const tempsEstime =
            tempsPreparation +
            tempsCuissonParBatch * nombreBatches +
            tempsRefroidissement;

          return {
            planifications: [
              ...state.planifications,
              {
                ...planification,
                id: genererID(),
                ingredients_necessaires: ingredientsNecessaires,
                temps_estime_minutes: tempsEstime,
              },
            ],
          };
        });
      },

      modifierPlanification: (id, modifications) => {
        set((state: AppState) => ({
          planifications: state.planifications.map((p) =>
            p.id === id ? { ...p, ...modifications } : p
          ),
        }));
      },

      supprimerPlanification: (id) => {
        set((state: AppState) => ({
          planifications: state.planifications.filter((p) => p.id !== id),
        }));
      },

      executerPlanification: (id) => {
        set((state: AppState) => {
          const plan = state.planifications.find((p) => p.id === id);
          if (!plan) return state;

          const recette = state.recettes.find((r) => r.id === plan.recette_id);
          if (!recette) return state;

          // Créer une production à partir de la planification
          const stockConsomme = plan.ingredients_necessaires.map((ing) => ({
            ingredient_id: ing.ingredient_id,
            ingredient_nom: ing.ingredient_nom,
            quantite_consommee: ing.quantite_necessaire,
            unite: state.ingredients.find((i) => i.id === ing.ingredient_id)
              ?.unite_achat || "kg",
          }));

          const nouvelleProduction: ProductionRecord = {
            id: genererID(),
            recette_id: plan.recette_id,
            recette_nom: plan.recette_nom,
            format_vente_id: plan.format_vente_id,
            format_vente_nom: state.formatsVente.find(
              (f) => f.id === plan.format_vente_id
            )?.nom,
            date_production: new Date(),
            quantite_produite: plan.quantite_a_produire,
            temps_preparation_minutes: 30,
            temps_cuisson_minutes: Math.ceil(plan.quantite_a_produire / 24) * 15,
            temps_refroidissement_minutes: 20,
            temps_total_minutes: plan.temps_estime_minutes,
            stock_consomme: stockConsomme,
            statut: "en_cours",
            notes: `Production créée depuis planification #${plan.id.substring(0, 8)}`,
          };

          // Mettre à jour la planification
          const planificationsUpdated = state.planifications.map((p) =>
            p.id === id
              ? { ...p, statut: "en_cours" as const, production_id: nouvelleProduction.id }
              : p
          );

          return {
            productions: [...state.productions, nouvelleProduction],
            planifications: planificationsUpdated,
          };
        });
      },

      // ============ UI ============
      changerPage: (page: string) => {
        set({ pageActive: page });
      },

      // ============ DONNÉES DEMO ============
      chargerDonneesDemo: () => {
        // Ingrédients de démonstration
        const demoIngredients: Ingredient[] = [
          {
            id: "ing-1",
            nom: "Farine T55",
            categorie: "farine",
            unite_achat: "kg",
            prix_par_unite: 0.9,
            prix_par_gramme: 0.0009,
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          },
          {
            id: "ing-2",
            nom: "Sucre blanc",
            categorie: "sucre",
            unite_achat: "kg",
            prix_par_unite: 1.4,
            prix_par_gramme: 0.0014,
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          },
          {
            id: "ing-3",
            nom: "Beurre doux",
            categorie: "gras",
            unite_achat: "kg",
            prix_par_unite: 8.0,
            prix_par_gramme: 0.008,
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          },
          {
            id: "ing-4",
            nom: "Œufs",
            categorie: "œufs",
            unite_achat: "unité",
            prix_par_unite: 0.35,
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          },
          {
            id: "ing-5",
            nom: "Pépites chocolat noir",
            categorie: "chocolat",
            unite_achat: "kg",
            prix_par_unite: 12.0,
            prix_par_gramme: 0.012,
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          },
        ];

        // Achats de démonstration correspondants
        const demoAchats: AchatIngredient[] = [
          {
            id: "achat-1",
            ingredient_id: "ing-1",
            ingredient_nom: "Farine T55",
            fournisseur: "Metro",
            quantite: 5,
            unite: "kg",
            prix_total: 4.5,
            prix_unitaire: 0.9,
            date_achat: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
          },
          {
            id: "achat-2",
            ingredient_id: "ing-2",
            ingredient_nom: "Sucre blanc",
            fournisseur: "Metro",
            quantite: 2,
            unite: "kg",
            prix_total: 2.8,
            prix_unitaire: 1.4,
            date_achat: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
          },
          {
            id: "achat-3",
            ingredient_id: "ing-3",
            ingredient_nom: "Beurre doux",
            fournisseur: "Grossiste Bio",
            quantite: 1,
            unite: "kg",
            prix_total: 8.0,
            prix_unitaire: 8.0,
            date_achat: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
          },
          {
            id: "achat-4",
            ingredient_id: "ing-4",
            ingredient_nom: "Œufs",
            fournisseur: "Ferme locale",
            quantite: 12,
            unite: "unité",
            prix_total: 4.2,
            prix_unitaire: 0.35,
            date_achat: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
          },
          {
            id: "achat-5",
            ingredient_id: "ing-5",
            ingredient_nom: "Pépites chocolat noir",
            fournisseur: "Valrhona",
            quantite: 1,
            unite: "kg",
            prix_total: 12.0,
            prix_unitaire: 12.0,
            date_achat: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hier
          },
        ];

        set({ 
          ingredients: demoIngredients,
          achats: demoAchats,
        });

        // Le reste des données demo sera chargé après
        console.log("Données démo chargées");
      },
    }),
    {
      name: "cookie-pricing-storage", // Nom de la clé dans localStorage
      partialize: (state: AppState) => ({
        // On sauvegarde tout sauf la page active
        ingredients: state.ingredients,
        recettes: state.recettes,
        cookies: state.cookies,
        emballages: state.emballages,
        charges: state.charges,
        pertes: state.pertes,
        formatsVente: state.formatsVente,
        simulations: state.simulations,
        alertes: state.alertes,
        achats: state.achats,
        categoriesPersonnalisees: state.categoriesPersonnalisees,
        productions: state.productions,
        planifications: state.planifications,
      }),
    }
  )
);
