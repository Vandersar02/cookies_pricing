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
} from "@/types";

import {
  genererID,
  calculerPrixParUnite,
  calculerPrixParGramme,
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

  // ============ UI ============
  pageActive: string;

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

  // ============ ACTIONS ALERTES ============
  genererAlertes: () => void;

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
      pageActive: "dashboard",

      // ============ ACTIONS INGRÉDIENTS ============
      ajouterIngredient: (ingredient) => {
        const nouvelIngredient: Ingredient = {
          ...ingredient,
          id: genererID(),
          prix_par_unite: calculerPrixParUnite({
            ...ingredient,
            id: "",
            prix_par_unite: 0,
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          }),
          prix_par_gramme: calculerPrixParGramme({
            ...ingredient,
            id: "",
            prix_par_unite: 0,
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          }),
          actif: true,
          date_creation: new Date(),
          derniere_modification: new Date(),
        };

        set((state) => ({
          ingredients: [...state.ingredients, nouvelIngredient],
        }));

        // Recalculer toutes les recettes qui utilisent cet ingrédient
        get().recalculerTousFormatsVente();
      },

      modifierIngredient: (id, modifications) => {
        set((state) => ({
          ingredients: state.ingredients.map((ing) => {
            if (ing.id !== id) return ing;

            const modifie = {
              ...ing,
              ...modifications,
              derniere_modification: new Date(),
            };
            return {
              ...modifie,
              prix_par_unite: calculerPrixParUnite(modifie),
              prix_par_gramme: calculerPrixParGramme(modifie),
            };
          }),
        }));

        get().recalculerTousFormatsVente();
      },

      supprimerIngredient: (id) => {
        set((state) => ({
          ingredients: state.ingredients.filter((ing) => ing.id !== id),
        }));
      },

      // ============ ACTIONS RECETTES ============
      ajouterRecette: (recette) => {
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

        set((state) => ({
          recettes: [...state.recettes, recetteComplete],
        }));
      },

      modifierRecette: (id, modifications) => {
        const ingredients = get().ingredients;

        set((state) => ({
          recettes: state.recettes.map((rec) => {
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

      supprimerRecette: (id) => {
        set((state) => ({
          recettes: state.recettes.filter((rec) => rec.id !== id),
        }));
      },

      recalculerRecette: (id) => {
        const ingredients = get().ingredients;

        set((state) => ({
          recettes: state.recettes.map((rec) => {
            if (rec.id !== id) return rec;
            return calculerRecetteComplete(rec, ingredients);
          }),
        }));
      },

      // ============ ACTIONS EMBALLAGES ============
      ajouterEmballage: (emballage) => {
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

        set((state) => ({
          emballages: [...state.emballages, nouvelEmballage],
        }));
      },

      modifierEmballage: (id, modifications) => {
        set((state) => ({
          emballages: state.emballages.map((emb) => {
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

      supprimerEmballage: (id) => {
        set((state) => ({
          emballages: state.emballages.filter((emb) => emb.id !== id),
        }));
      },

      // ============ ACTIONS CHARGES ============
      ajouterCharges: (charges) => {
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

        set((state) => ({
          charges: [...state.charges, nouvellesCharges],
        }));

        get().recalculerTousFormatsVente();
      },

      modifierCharges: (id, modifications) => {
        set((state) => ({
          charges: state.charges.map((ch) => {
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

      supprimerCharges: (id) => {
        set((state) => ({
          charges: state.charges.filter((ch) => ch.id !== id),
        }));
      },

      // ============ ACTIONS PERTES ============
      ajouterPerte: (perte) => {
        const nouvellePerte: Perte = {
          ...perte,
          id: genererID(),
          actif: true,
          date_creation: new Date(),
        };

        set((state) => ({
          pertes: [...state.pertes, nouvellePerte],
        }));

        get().recalculerTousFormatsVente();
      },

      modifierPerte: (id, modifications) => {
        set((state) => ({
          pertes: state.pertes.map((p) =>
            p.id === id ? { ...p, ...modifications } : p
          ),
        }));

        get().recalculerTousFormatsVente();
      },

      supprimerPerte: (id) => {
        set((state) => ({
          pertes: state.pertes.filter((p) => p.id !== id),
        }));
      },

      // ============ ACTIONS FORMATS VENTE ============
      ajouterFormatVente: (format) => {
        const { recettes, emballages, charges, pertes } = get();

        const recette = recettes.find((r) => r.id === format.type_cookie_id);
        const emballage = emballages.find((e) => e.id === format.emballage_id);

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

        set((state) => ({
          formatsVente: [...state.formatsVente, formatComplet],
        }));
      },

      modifierFormatVente: (id, modifications) => {
        set((state) => ({
          formatsVente: state.formatsVente.map((f) =>
            f.id === id ? { ...f, ...modifications } : f
          ),
        }));

        get().recalculerFormatVente(id);
      },

      supprimerFormatVente: (id) => {
        set((state) => ({
          formatsVente: state.formatsVente.filter((f) => f.id !== id),
        }));
      },

      recalculerFormatVente: (id) => {
        const { recettes, emballages, charges, pertes, formatsVente } = get();

        const format = formatsVente.find((f) => f.id === id);
        if (!format) return;

        const recette = recettes.find((r) => r.id === format.type_cookie_id);
        const emballage = emballages.find((e) => e.id === format.emballage_id);

        if (!recette || !emballage) return;

        const formatRecalcule = calculerFormatVenteComplet(
          format,
          recette.cout_par_cookie_ingredients,
          emballage,
          charges,
          pertes
        );

        set((state) => ({
          formatsVente: state.formatsVente.map((f) =>
            f.id === id ? formatRecalcule : f
          ),
        }));
      },

      recalculerTousFormatsVente: () => {
        const { formatsVente } = get();
        formatsVente.forEach((f) => get().recalculerFormatVente(f.id));
      },

      // ============ ACTIONS SIMULATIONS ============
      ajouterSimulation: (simulation) => {
        set((state) => ({
          simulations: [
            ...state.simulations,
            { ...simulation, id: genererID() },
          ],
        }));
      },

      supprimerSimulation: (id) => {
        set((state) => ({
          simulations: state.simulations.filter((s) => s.id !== id),
        }));
      },

      // ============ ACTIONS ALERTES ============
      genererAlertes: () => {
        const { formatsVente } = get();
        const alertes: AlerteRentabilite[] = [];

        formatsVente.forEach((format) => {
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

      // ============ UI ============
      changerPage: (page) => {
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
            quantite_achetee: 5,
            prix_achat_total: 4.5,
            prix_par_unite: 0.9,
            prix_par_gramme: 0.0009,
            fournisseur: "Metro",
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          },
          {
            id: "ing-2",
            nom: "Sucre blanc",
            categorie: "sucre",
            unite_achat: "kg",
            quantite_achetee: 2,
            prix_achat_total: 2.8,
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
            quantite_achetee: 1,
            prix_achat_total: 8.0,
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
            quantite_achetee: 12,
            prix_achat_total: 4.2,
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
            quantite_achetee: 1,
            prix_achat_total: 12.0,
            prix_par_unite: 12.0,
            prix_par_gramme: 0.012,
            actif: true,
            date_creation: new Date(),
            derniere_modification: new Date(),
          },
        ];

        set({ ingredients: demoIngredients });

        // Le reste des données demo sera chargé après
        console.log("Données démo chargées");
      },
    }),
    {
      name: "cookie-pricing-storage", // Nom de la clé dans localStorage
      partialize: (state) => ({
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
      }),
    }
  )
);
