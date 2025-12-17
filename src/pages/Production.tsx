import { useStore } from "@/store";
import { useState } from "react";
import {
  Factory,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  AlertTriangle,
  Package,
} from "lucide-react";
import { formaterEuro } from "@/utils/calculs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ProductionRecord, PlanificationProduction } from "@/types";

export default function Production() {
  const {
    productions,
    planifications,
    recettes,
    formatsVente,
    ingredients,
    ajouterProduction,
    modifierProduction,
    terminerProduction,
    ajouterPlanification,
    modifierPlanification,
    executerPlanification,
    supprimerPlanification,
  } = useStore();

  const [onglet, setOnglet] = useState<"productions" | "planifications">("productions");
  const [dialogProduction, setDialogProduction] = useState(false);
  const [dialogPlanification, setDialogPlanification] = useState(false);

  const [formProduction, setFormProduction] = useState({
    recette_id: "",
    quantite_produite: 0,
    temps_preparation_minutes: 30,
    temps_cuisson_minutes: 15,
    temps_refroidissement_minutes: 20,
    operateur: "",
    notes: "",
  });

  const [formPlanification, setFormPlanification] = useState({
    recette_id: "",
    quantite_a_produire: 0,
    date_prevue: new Date().toISOString().split("T")[0],
    priorite: "normale" as const,
    notes: "",
  });

  const getStatutCouleur = (statut: ProductionRecord["statut"] | PlanificationProduction["statut"]) => {
    switch (statut) {
      case "termine":
        return "text-green-400";
      case "en_cours":
        return "text-blue-400";
      case "planifie":
      case "pret":
        return "text-yellow-400";
      case "annule":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatutIcon = (statut: ProductionRecord["statut"] | PlanificationProduction["statut"]) => {
    switch (statut) {
      case "termine":
        return <CheckCircle className="w-4 h-4" />;
      case "en_cours":
        return <PlayCircle className="w-4 h-4" />;
      case "planifie":
      case "pret":
        return <Calendar className="w-4 h-4" />;
      case "annule":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleAjouterProduction = (e: React.FormEvent) => {
    e.preventDefault();

    const recette = recettes.find((r) => r.id === formProduction.recette_id);
    if (!recette) {
      alert("Veuillez sélectionner une recette");
      return;
    }

    // Calculer le stock à consommer
    const quantiteRecettes = Math.ceil(
      formProduction.quantite_produite / recette.nombre_cookies_produits
    );

    const stockConsomme = recette.ingredients.map((ing) => {
      const ingredient = ingredients.find((i) => i.id === ing.ingredient_id);
      return {
        ingredient_id: ing.ingredient_id,
        ingredient_nom: ing.ingredient_nom,
        quantite_consommee: ing.quantite_necessaire * quantiteRecettes,
        unite: ingredient?.unite_achat || "kg",
      };
    });

    const tempsTotal =
      formProduction.temps_preparation_minutes +
      formProduction.temps_cuisson_minutes +
      formProduction.temps_refroidissement_minutes;

    ajouterProduction({
      recette_id: formProduction.recette_id,
      recette_nom: recette.nom,
      date_production: new Date(),
      quantite_produite: formProduction.quantite_produite,
      temps_preparation_minutes: formProduction.temps_preparation_minutes,
      temps_cuisson_minutes: formProduction.temps_cuisson_minutes,
      temps_refroidissement_minutes: formProduction.temps_refroidissement_minutes,
      temps_total_minutes: tempsTotal,
      operateur: formProduction.operateur,
      notes: formProduction.notes,
      stock_consomme: stockConsomme,
      statut: "en_cours",
    });

    setDialogProduction(false);
    setFormProduction({
      recette_id: "",
      quantite_produite: 0,
      temps_preparation_minutes: 30,
      temps_cuisson_minutes: 15,
      temps_refroidissement_minutes: 20,
      operateur: "",
      notes: "",
    });
  };

  const handleAjouterPlanification = (e: React.FormEvent) => {
    e.preventDefault();

    const recette = recettes.find((r) => r.id === formPlanification.recette_id);
    if (!recette) {
      alert("Veuillez sélectionner une recette");
      return;
    }

    ajouterPlanification({
      recette_id: formPlanification.recette_id,
      recette_nom: recette.nom,
      quantite_a_produire: formPlanification.quantite_a_produire,
      date_prevue: new Date(formPlanification.date_prevue),
      priorite: formPlanification.priorite,
      statut: "planifie",
      notes: formPlanification.notes,
    });

    setDialogPlanification(false);
    setFormPlanification({
      recette_id: "",
      quantite_a_produire: 0,
      date_prevue: new Date().toISOString().split("T")[0],
      priorite: "normale",
      notes: "",
    });
  };

  const handleTerminerProduction = (id: string) => {
    if (
      confirm(
        "Terminer cette production ? Le stock des ingrédients sera automatiquement déduit."
      )
    ) {
      terminerProduction(id);
    }
  };

  const handleExecuterPlanification = (id: string) => {
    const plan = planifications.find((p) => p.id === id);
    if (!plan) return;

    const manqueIngredients = plan.ingredients_necessaires.some((ing) => ing.manque);
    if (manqueIngredients) {
      const message =
        "⚠️ Attention : Certains ingrédients sont en quantité insuffisante.\n\nVoulez-vous continuer quand même ?";
      if (!confirm(message)) return;
    }

    executerPlanification(id);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Factory className="w-8 h-8 text-primary-400" />
              Gestion de Production
            </h1>
            <p className="text-slate-400">
              Planifiez et suivez vos productions avec consommation automatique de stock
            </p>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setOnglet("productions")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              onglet === "productions"
                ? "bg-primary-700 text-primary-100"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4" />
              <span>Productions ({productions.length})</span>
            </div>
          </button>
          <button
            onClick={() => setOnglet("planifications")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              onglet === "planifications"
                ? "bg-primary-700 text-primary-100"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Planifications ({planifications.length})</span>
            </div>
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-slate-400 mb-1">Productions actives</p>
            <p className="text-2xl font-bold text-blue-400">
              {productions.filter((p) => p.statut === "en_cours").length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400 mb-1">Total produites</p>
            <p className="text-2xl font-bold text-green-400">
              {productions.reduce((sum, p) => sum + p.quantite_produite, 0)} cookies
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400 mb-1">Planifications à venir</p>
            <p className="text-2xl font-bold text-yellow-400">
              {planifications.filter((p) => p.statut === "planifie").length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400 mb-1">Temps total (mois)</p>
            <p className="text-2xl font-bold text-purple-400">
              {Math.round(productions.reduce((sum, p) => sum + p.temps_total_minutes, 0) / 60)}h
            </p>
          </div>
        </div>

        {/* Contenu selon onglet */}
        {onglet === "productions" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setDialogProduction(true)} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Production
              </button>
            </div>

            {productions.length === 0 ? (
              <div className="card text-center py-12">
                <Factory className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Aucune production enregistrée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {productions
                  .sort((a, b) => new Date(b.date_production).getTime() - new Date(a.date_production).getTime())
                  .map((prod) => (
                    <div key={prod.id} className="card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-100">
                              {prod.recette_nom}
                            </h3>
                            <span className={`flex items-center gap-1 text-sm ${getStatutCouleur(prod.statut)}`}>
                              {getStatutIcon(prod.statut)}
                              {prod.statut}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">
                            {format(new Date(prod.date_production), "PPP à HH:mm", { locale: fr })}
                          </p>
                        </div>
                        {prod.statut === "en_cours" && (
                          <button
                            onClick={() => handleTerminerProduction(prod.id)}
                            className="btn-primary text-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Terminer
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Quantité</p>
                          <p className="text-lg font-semibold text-slate-100">
                            {prod.quantite_produite} cookies
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Temps total</p>
                          <p className="text-lg font-semibold text-slate-100">
                            {prod.temps_total_minutes} min
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Préparation</p>
                          <p className="text-sm text-slate-300">{prod.temps_preparation_minutes} min</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Cuisson</p>
                          <p className="text-sm text-slate-300">{prod.temps_cuisson_minutes} min</p>
                        </div>
                      </div>

                      {prod.stock_consomme.length > 0 && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm text-primary-400 hover:text-primary-300">
                            Stock consommé ({prod.stock_consomme.length} ingrédients)
                          </summary>
                          <div className="mt-2 space-y-1">
                            {prod.stock_consomme.map((stock, idx) => (
                              <div key={idx} className="text-sm text-slate-400 flex justify-between">
                                <span>{stock.ingredient_nom}</span>
                                <span>
                                  {stock.quantite_consommee.toFixed(3)} {stock.unite}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {prod.notes && (
                        <p className="text-sm text-slate-500 mt-2 italic">{prod.notes}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {onglet === "planifications" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setDialogPlanification(true)} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Planification
              </button>
            </div>

            {planifications.length === 0 ? (
              <div className="card text-center py-12">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Aucune planification</p>
              </div>
            ) : (
              <div className="space-y-4">
                {planifications
                  .sort((a, b) => new Date(a.date_prevue).getTime() - new Date(b.date_prevue).getTime())
                  .map((plan) => {
                    const manqueIngredients = plan.ingredients_necessaires.some((ing) => ing.manque);
                    
                    return (
                      <div key={plan.id} className={`card ${manqueIngredients ? "border-l-4 border-orange-500" : ""}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-100">
                                {plan.recette_nom}
                              </h3>
                              <span className={`flex items-center gap-1 text-sm ${getStatutCouleur(plan.statut)}`}>
                                {getStatutIcon(plan.statut)}
                                {plan.statut}
                              </span>
                              {plan.priorite === "urgente" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-900/30 text-red-200">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400">
                              Prévu le {format(new Date(plan.date_prevue), "PPP", { locale: fr })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {plan.statut === "planifie" && (
                              <button
                                onClick={() => handleExecuterPlanification(plan.id)}
                                className="btn-primary text-sm"
                              >
                                <PlayCircle className="w-4 h-4 mr-1" />
                                Exécuter
                              </button>
                            )}
                            <button
                              onClick={() => supprimerPlanification(plan.id)}
                              className="btn-secondary text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-500">Quantité prévue</p>
                            <p className="text-lg font-semibold text-slate-100">
                              {plan.quantite_a_produire} cookies
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Temps estimé</p>
                            <p className="text-lg font-semibold text-slate-100">
                              {plan.temps_estime_minutes} min
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Priorité</p>
                            <p className="text-sm text-slate-300 capitalize">{plan.priorite}</p>
                          </div>
                        </div>

                        {/* Ingrédients nécessaires */}
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Ingrédients nécessaires
                          </h4>
                          <div className="space-y-2">
                            {plan.ingredients_necessaires.map((ing, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center justify-between text-sm p-2 rounded ${
                                  ing.manque ? "bg-orange-900/20 border border-orange-700" : "bg-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {ing.manque && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                                  <span className={ing.manque ? "text-orange-200" : "text-slate-300"}>
                                    {ing.ingredient_nom}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className={ing.manque ? "text-orange-200" : "text-slate-400"}>
                                    Besoin: {ing.quantite_necessaire.toFixed(3)}
                                  </span>
                                  <span className="mx-2">/</span>
                                  <span className={ing.manque ? "text-red-400 font-semibold" : "text-green-400"}>
                                    Dispo: {ing.quantite_disponible.toFixed(3)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {plan.notes && (
                          <p className="text-sm text-slate-500 mt-4 italic">{plan.notes}</p>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Dialog Nouvelle Production */}
        {dialogProduction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">Nouvelle Production</h2>
              </div>

              <form onSubmit={handleAjouterProduction} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Recette *</label>
                    <select
                      className="input"
                      value={formProduction.recette_id}
                      onChange={(e) =>
                        setFormProduction({ ...formProduction, recette_id: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Choisir une recette --</option>
                      {recettes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nom} ({r.nombre_cookies_produits} cookies)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Quantité à produire (cookies) *</label>
                    <input
                      type="number"
                      className="input"
                      value={formProduction.quantite_produite}
                      onChange={(e) =>
                        setFormProduction({
                          ...formProduction,
                          quantite_produite: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="label">Temps préparation (min)</label>
                    <input
                      type="number"
                      className="input"
                      value={formProduction.temps_preparation_minutes}
                      onChange={(e) =>
                        setFormProduction({
                          ...formProduction,
                          temps_preparation_minutes: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Temps cuisson (min)</label>
                    <input
                      type="number"
                      className="input"
                      value={formProduction.temps_cuisson_minutes}
                      onChange={(e) =>
                        setFormProduction({
                          ...formProduction,
                          temps_cuisson_minutes: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Temps refroidissement (min)</label>
                    <input
                      type="number"
                      className="input"
                      value={formProduction.temps_refroidissement_minutes}
                      onChange={(e) =>
                        setFormProduction({
                          ...formProduction,
                          temps_refroidissement_minutes: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Opérateur</label>
                    <input
                      type="text"
                      className="input"
                      value={formProduction.operateur}
                      onChange={(e) =>
                        setFormProduction({ ...formProduction, operateur: e.target.value })
                      }
                      placeholder="Nom de l'opérateur"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formProduction.notes}
                      onChange={(e) =>
                        setFormProduction({ ...formProduction, notes: e.target.value })
                      }
                      placeholder="Notes sur cette production..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDialogProduction(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Créer Production
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog Nouvelle Planification */}
        {dialogPlanification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">Nouvelle Planification</h2>
              </div>

              <form onSubmit={handleAjouterPlanification} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Recette *</label>
                    <select
                      className="input"
                      value={formPlanification.recette_id}
                      onChange={(e) =>
                        setFormPlanification({ ...formPlanification, recette_id: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Choisir une recette --</option>
                      {recettes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nom} ({r.nombre_cookies_produits} cookies)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Quantité à produire (cookies) *</label>
                    <input
                      type="number"
                      className="input"
                      value={formPlanification.quantite_a_produire}
                      onChange={(e) =>
                        setFormPlanification({
                          ...formPlanification,
                          quantite_a_produire: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="label">Date prévue *</label>
                    <input
                      type="date"
                      className="input"
                      value={formPlanification.date_prevue}
                      onChange={(e) =>
                        setFormPlanification({ ...formPlanification, date_prevue: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Priorité</label>
                    <select
                      className="input"
                      value={formPlanification.priorite}
                      onChange={(e) =>
                        setFormPlanification({
                          ...formPlanification,
                          priorite: e.target.value as any,
                        })
                      }
                    >
                      <option value="basse">Basse</option>
                      <option value="normale">Normale</option>
                      <option value="haute">Haute</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formPlanification.notes}
                      onChange={(e) =>
                        setFormPlanification({ ...formPlanification, notes: e.target.value })
                      }
                      placeholder="Notes sur cette planification..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDialogPlanification(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Créer Planification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
