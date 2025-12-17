import { useState, useMemo } from "react";
import { useStore } from "@/store";
import {
  ShoppingBag,
  DollarSign,
  Package,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import {
  formaterEuro,
  calculerStatistiquesFournisseur,
  grouperAchatsParPeriode,
  genererRecommandationsReapprovisionnement,
} from "@/utils/calculs";
import type { PeriodeAnalyse, UniteAchat } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Achats() {
  const { achats, ingredients, ajouterAchat, supprimerAchat } = useStore();
  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [periodeSelectionnee, setPeriodeSelectionnee] =
    useState<PeriodeAnalyse>("mensuelle");
  const [fournisseurFiltre, setFournisseurFiltre] = useState<string>("tous");

  const [formData, setFormData] = useState({
    ingredient_id: "",
    fournisseur: "",
    quantite: 0,
    unite: "kg" as UniteAchat,
    prix_total: 0,
    date_achat: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Extraire tous les fournisseurs uniques
  const fournisseurs = useMemo(() => {
    const fournisseursSet = new Set(achats.map((a) => a.fournisseur));
    return Array.from(fournisseursSet).sort();
  }, [achats]);

  // Filtrer les achats par fournisseur
  const achatsFiltres = useMemo(() => {
    if (fournisseurFiltre === "tous") return achats;
    return achats.filter((a) => a.fournisseur === fournisseurFiltre);
  }, [achats, fournisseurFiltre]);

  // Statistiques globales
  const montantTotal = achatsFiltres.reduce((sum, a) => sum + a.prix_total, 0);
  const nombreAchats = achatsFiltres.length;

  // Statistiques par fournisseur
  const statsFournisseurs = useMemo(() => {
    return fournisseurs.map((f) =>
      calculerStatistiquesFournisseur(achats, f)
    );
  }, [achats, fournisseurs]);

  // Dépenses par période
  const depensesParPeriode = useMemo(() => {
    return grouperAchatsParPeriode(achatsFiltres, periodeSelectionnee);
  }, [achatsFiltres, periodeSelectionnee]);

  // Recommandations de réapprovisionnement
  const recommandations = useMemo(() => {
    return genererRecommandationsReapprovisionnement(ingredients, achats);
  }, [ingredients, achats]);

  const ouvrirDialog = () => {
    setFormData({
      ingredient_id: "",
      fournisseur: "",
      quantite: 0,
      unite: "kg",
      prix_total: 0,
      date_achat: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setDialogOuvert(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ingredient = ingredients.find((i) => i.id === formData.ingredient_id);
    if (!ingredient) {
      alert("Veuillez sélectionner un ingrédient");
      return;
    }

    ajouterAchat({
      ingredient_id: formData.ingredient_id,
      ingredient_nom: ingredient.nom,
      fournisseur: formData.fournisseur,
      quantite: formData.quantite,
      unite: formData.unite,
      prix_total: formData.prix_total,
      date_achat: new Date(formData.date_achat),
      notes: formData.notes || undefined,
    });

    setDialogOuvert(false);
  };

  const handleSupprimer = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet achat ?")) {
      supprimerAchat(id);
    }
  };

  const getUrgenceColor = (urgence: string) => {
    switch (urgence) {
      case "critique":
        return "text-red-400 bg-red-900/30";
      case "haute":
        return "text-orange-400 bg-orange-900/30";
      case "moyenne":
        return "text-yellow-400 bg-yellow-900/30";
      default:
        return "text-blue-400 bg-blue-900/30";
    }
  };

  const getUrgenceLabel = (urgence: string) => {
    switch (urgence) {
      case "critique":
        return "Critique";
      case "haute":
        return "Haute";
      case "moyenne":
        return "Moyenne";
      default:
        return "Faible";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              Achats & Fournisseurs
            </h1>
            <p className="text-slate-400">
              Suivez vos achats, dépenses et relations fournisseurs
            </p>
          </div>
          <button onClick={ouvrirDialog} className="btn-primary">
            <Plus className="w-5 h-5" />
            Nouvel achat
          </button>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">
                Total des achats
              </span>
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100">{nombreAchats}</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">
                Montant total dépensé
              </span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">
              {formaterEuro(montantTotal)}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">
                Fournisseurs actifs
              </span>
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100">
              {fournisseurs.length}
            </p>
          </div>
        </div>

        {/* Recommandations de réapprovisionnement */}
        {recommandations.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-slate-100">
                Recommandations de réapprovisionnement
              </h2>
            </div>
            <div className="space-y-3">
              {recommandations.slice(0, 5).map((rec) => (
                <div
                  key={rec.ingredient_id}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-100">
                      {rec.ingredient_nom}
                    </p>
                    <p className="text-sm text-slate-400">
                      Stock: {rec.stock_actuel} / Min: {rec.stock_minimum}
                      {rec.fournisseur_habituel && (
                        <span className="ml-2">
                          • Fournisseur: {rec.fournisseur_habituel}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                      Prix moyen: {formaterEuro(rec.prix_moyen)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgenceColor(
                        rec.urgence
                      )}`}
                    >
                      {getUrgenceLabel(rec.urgence)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques par fournisseur */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-slate-100 mb-4">
            Statistiques par fournisseur
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Fournisseur
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                    Nb achats
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                    Montant total
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                    Montant moyen
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                    Fréquence
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Ingrédients
                  </th>
                </tr>
              </thead>
              <tbody>
                {statsFournisseurs.map((stat) => (
                  <tr
                    key={stat.fournisseur}
                    className="border-b border-slate-700 hover:bg-slate-800"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-100">
                        {stat.fournisseur}
                      </p>
                      {stat.dernier_achat && (
                        <p className="text-xs text-slate-400">
                          Dernier achat:{" "}
                          {format(new Date(stat.dernier_achat), "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-100">
                      {stat.nombre_achats}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-100">
                      {formaterEuro(stat.montant_total)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {formaterEuro(stat.montant_moyen)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">
                      {stat.frequence_jours
                        ? `${stat.frequence_jours} jours`
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {stat.ingredients.slice(0, 3).join(", ")}
                      {stat.ingredients.length > 3 &&
                        ` +${stat.ingredients.length - 3}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dépenses par période */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-100">
              Dépenses par période
            </h2>
            <div className="flex gap-2">
              <select
                value={fournisseurFiltre}
                onChange={(e) => setFournisseurFiltre(e.target.value)}
                className="input py-1 px-2 text-sm"
              >
                <option value="tous">Tous les fournisseurs</option>
                {fournisseurs.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                value={periodeSelectionnee}
                onChange={(e) =>
                  setPeriodeSelectionnee(e.target.value as PeriodeAnalyse)
                }
                className="input py-1 px-2 text-sm"
              >
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="mensuelle">Mensuelle</option>
                <option value="trimestrielle">Trimestrielle</option>
                <option value="annuelle">Annuelle</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Période
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                    Nb achats
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                    Montant
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Fournisseurs
                  </th>
                </tr>
              </thead>
              <tbody>
                {depensesParPeriode.map((dep) => (
                  <tr
                    key={dep.periode}
                    className="border-b border-slate-700 hover:bg-slate-800"
                  >
                    <td className="py-3 px-4 font-medium text-slate-100">
                      {dep.periode}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-100">
                      {dep.nombre_achats}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-100">
                      {formaterEuro(dep.montant)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {dep.fournisseurs.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historique des achats */}
        <div className="card">
          <h2 className="text-xl font-bold text-slate-100 mb-4">
            Historique des achats
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Ingrédient
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Fournisseur
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                    Quantité
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                    Prix total
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                    Prix unitaire
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...achatsFiltres]
                  .sort(
                    (a, b) =>
                      new Date(b.date_achat).getTime() -
                      new Date(a.date_achat).getTime()
                  )
                  .map((achat) => (
                    <tr
                      key={achat.id}
                      className="border-b border-slate-700 hover:bg-slate-800"
                    >
                      <td className="py-3 px-4 text-slate-100">
                        {format(new Date(achat.date_achat), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-100">
                          {achat.ingredient_nom}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-100">
                        {achat.fournisseur}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-100">
                        {achat.quantite} {achat.unite}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-100">
                        {formaterEuro(achat.prix_total)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {formaterEuro(achat.prix_unitaire)}/{achat.unite}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleSupprimer(achat.id)}
                          className="p-1.5 text-red-400 hover:bg-red-900/30 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {achatsFiltres.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                Aucun achat enregistré pour le moment
              </div>
            )}
          </div>
        </div>

        {/* Dialog Nouvel achat */}
        {dialogOuvert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">
                  Nouvel achat
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="label">Ingrédient *</label>
                    <select
                      className="input"
                      value={formData.ingredient_id}
                      onChange={(e) =>
                        setFormData({ ...formData, ingredient_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Sélectionner un ingrédient</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Fournisseur *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.fournisseur}
                      onChange={(e) =>
                        setFormData({ ...formData, fournisseur: e.target.value })
                      }
                      required
                      list="fournisseurs-list"
                    />
                    <datalist id="fournisseurs-list">
                      {fournisseurs.map((f) => (
                        <option key={f} value={f} />
                      ))}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Quantité *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={formData.quantite}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantite: parseFloat(e.target.value) || 0,
                          })
                        }
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Unité *</label>
                      <select
                        className="input"
                        value={formData.unite}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unite: e.target.value as UniteAchat,
                          })
                        }
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="mL">mL</option>
                        <option value="unité">unité</option>
                        <option value="paquet">paquet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Prix total (G) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.prix_total}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prix_total: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Date d'achat *</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.date_achat}
                      onChange={(e) =>
                        setFormData({ ...formData, date_achat: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>

                  {formData.quantite > 0 && formData.prix_total > 0 && (
                    <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                      <p className="text-sm text-blue-200">Prix unitaire calculé</p>
                      <p className="text-xl font-bold text-blue-100">
                        {formaterEuro(formData.prix_total / formData.quantite)} /{" "}
                        {formData.unite}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDialogOuvert(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Enregistrer
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
