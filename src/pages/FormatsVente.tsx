import { useState, useEffect } from "react";
import { useStore } from "@/store";
import {
  Plus,
  Edit2,
  Trash2,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { formaterEuro, formaterPourcentage } from "@/utils/calculs";
import type { FormatVente, CanalVente } from "@/types";

export default function FormatsVente() {
  const {
    formatsVente,
    recettes,
    emballages,
    ajouterFormatVente,
    modifierFormatVente,
    supprimerFormatVente,
    recalculerFormatVente,
  } = useStore();

  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [formatEnEdition, setFormatEnEdition] = useState<FormatVente | null>(
    null
  );
  const [voirDetails, setVoirDetails] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    type_cookie_id: "",
    type_cookie_nom: "",
    quantite_cookies: 1,
    emballage_id: "",
    emballage_nom: "",
    marge_cible_pourcentage: 40,
    prix_vente_pratique: undefined as number | undefined,
    canal_vente: "boutique" as CanalVente,
    notes: "",
  });

  const ouvrirDialog = (format?: FormatVente) => {
    if (format) {
      setFormatEnEdition(format);
      setFormData({
        nom: format.nom,
        description: format.description || "",
        type_cookie_id: format.type_cookie_id,
        type_cookie_nom: format.type_cookie_nom,
        quantite_cookies: format.quantite_cookies,
        emballage_id: format.emballage_id,
        emballage_nom: format.emballage_nom,
        marge_cible_pourcentage: format.marge_cible_pourcentage,
        prix_vente_pratique: format.prix_vente_pratique,
        canal_vente: format.canal_vente,
        notes: format.notes || "",
      });
    } else {
      setFormatEnEdition(null);
      setFormData({
        nom: "",
        description: "",
        type_cookie_id: recettes.length > 0 ? recettes[0].id : "",
        type_cookie_nom: recettes.length > 0 ? recettes[0].nom : "",
        quantite_cookies: 1,
        emballage_id: emballages.length > 0 ? emballages[0].id : "",
        emballage_nom: emballages.length > 0 ? emballages[0].nom : "",
        marge_cible_pourcentage: 40,
        prix_vente_pratique: undefined,
        canal_vente: "boutique",
        notes: "",
      });
    }
    setDialogOuvert(true);
  };

  const fermerDialog = () => {
    setDialogOuvert(false);
    setFormatEnEdition(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type_cookie_id || !formData.emballage_id) {
      alert("Veuillez sélectionner une recette et un emballage");
      return;
    }

    if (formatEnEdition) {
      modifierFormatVente(formatEnEdition.id, formData);
    } else {
      ajouterFormatVente(formData);
    }

    fermerDialog();
  };

  const handleSupprimer = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce format de vente ?")) {
      supprimerFormatVente(id);
    }
  };

  const handleChangerRecette = (recetteId: string) => {
    const recette = recettes.find((r) => r.id === recetteId);
    if (recette) {
      setFormData({
        ...formData,
        type_cookie_id: recetteId,
        type_cookie_nom: recette.nom,
      });
    }
  };

  const handleChangerEmballage = (emballageId: string) => {
    const emballage = emballages.find((e) => e.id === emballageId);
    if (emballage) {
      setFormData({
        ...formData,
        emballage_id: emballageId,
        emballage_nom: emballage.nom,
        quantite_cookies: emballage.capacite_cookies,
      });
    }
  };

  const canauxOptions: CanalVente[] = [
    "boutique",
    "evenement",
    "gros",
    "online",
  ];

  // Recalculer au montage
  useEffect(() => {
    formatsVente.forEach((f) => recalculerFormatVente(f.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              Formats de Vente
            </h1>
            <p className="text-slate-400">
              Créez vos produits finaux et définissez vos prix
            </p>
          </div>
          <button
            onClick={() => ouvrirDialog()}
            className="btn-primary flex items-center gap-2"
            disabled={recettes.length === 0 || emballages.length === 0}
          >
            <Plus className="w-5 h-5" />
            Nouveau format
          </button>
        </div>

        {/* Alertes */}
        {recettes.length === 0 && (
          <div className="mb-6 bg-orange-900/30 border border-orange-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="font-medium text-orange-100">
                  Aucune recette disponible
                </p>
                <p className="text-sm text-orange-200">
                  Créez d'abord des recettes dans la section "Recettes"
                </p>
              </div>
            </div>
          </div>
        )}

        {emballages.length === 0 && (
          <div className="mb-6 bg-orange-900/30 border border-orange-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="font-medium text-orange-100">
                  Aucun emballage disponible
                </p>
                <p className="text-sm text-orange-200">
                  Créez d'abord des emballages dans la section "Emballages"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des formats */}
        {formatsVente.length === 0 ? (
          <div className="card text-center py-12">
            <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Aucun format de vente
            </h3>
            <p className="text-slate-400 mb-6">
              Créez vos premiers formats de vente pour calculer vos prix.
            </p>
            {recettes.length > 0 && emballages.length > 0 && (
              <button onClick={() => ouvrirDialog()} className="btn-primary">
                Créer un format
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formatsVente.map((format) => (
              <div
                key={format.id}
                className="card hover:shadow-lg transition-shadow"
              >
                {/* En-tête */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-100 mb-1">
                      {format.nom}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {format.type_cookie_nom}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-200">
                        {format.canal_vente}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format.quantite_cookies} cookies
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setVoirDetails(
                          voirDetails === format.id ? null : format.id
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded"
                      title="Détails"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => ouvrirDialog(format)}
                      className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSupprimer(format.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Détails dépliables */}
                {voirDetails === format.id && (
                  <div className="mb-4 p-3 bg-slate-900 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cookies</span>
                      <span className="font-medium">
                        {formaterEuro(format.cout_cookies)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emballage</span>
                      <span className="font-medium">
                        {formaterEuro(format.cout_emballage)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Charges</span>
                      <span className="font-medium">
                        {formaterEuro(format.cout_charges)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pertes</span>
                      <span className="font-medium">
                        {formaterEuro(format.cout_pertes)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-700 flex justify-between font-semibold">
                      <span className="text-slate-100">Coût total</span>
                      <span className="text-slate-100">
                        {formaterEuro(format.cout_total_revient)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Prix et marges */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Coût de revient
                    </span>
                    <span className="font-bold text-slate-100">
                      {formaterEuro(format.cout_total_revient)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Prix de vente
                    </span>
                    <span className="text-xl font-bold text-primary-400">
                      {formaterEuro(
                        format.prix_vente_pratique ||
                          format.prix_vente_recommande
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Profit</span>
                      <span
                        className={`font-bold ${
                          format.profit_unitaire > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {format.profit_unitaire > 0 ? "+" : ""}
                        {formaterEuro(format.profit_unitaire)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Marge</span>
                      <div className="flex items-center gap-2">
                        {format.marge_reelle_pourcentage >=
                        format.marge_cible_pourcentage ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={`font-bold ${
                            format.marge_reelle_pourcentage >= 40
                              ? "text-green-600"
                              : format.marge_reelle_pourcentage >= 25
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formaterPourcentage(format.marge_reelle_pourcentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alertes */}
                {format.profit_unitaire <= 0 && (
                  <div className="mt-3 p-2 bg-red-900/30 border border-red-700 rounded">
                    <p className="text-xs text-red-200 font-medium">
                      ⚠️ Non rentable
                    </p>
                  </div>
                )}
                {format.marge_reelle_pourcentage <
                  format.marge_cible_pourcentage &&
                  format.profit_unitaire > 0 && (
                    <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded">
                      <p className="text-xs text-yellow-200 font-medium">
                        ⚠️ Marge cible non atteinte
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Dialog Ajout/Édition */}
        {dialogOuvert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">
                  {formatEnEdition ? "Modifier" : "Nouveau"} format de vente
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Nom du format *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      required
                      placeholder="Ex: Pack de 6 Cookies Chocolat"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Description</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description du produit..."
                    />
                  </div>

                  <div>
                    <label className="label">Type de cookie *</label>
                    <select
                      className="input"
                      value={formData.type_cookie_id}
                      onChange={(e) => handleChangerRecette(e.target.value)}
                      required
                    >
                      {recettes.length === 0 ? (
                        <option value="">Aucune recette disponible</option>
                      ) : (
                        recettes.map((recette) => (
                          <option key={recette.id} value={recette.id}>
                            {recette.nom} (
                            {formaterEuro(recette.cout_par_cookie_ingredients)}
                            /cookie)
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="label">Emballage *</label>
                    <select
                      className="input"
                      value={formData.emballage_id}
                      onChange={(e) => handleChangerEmballage(e.target.value)}
                      required
                    >
                      {emballages.length === 0 ? (
                        <option value="">Aucun emballage disponible</option>
                      ) : (
                        emballages.map((emballage) => (
                          <option key={emballage.id} value={emballage.id}>
                            {emballage.nom} ({emballage.capacite_cookies}{" "}
                            cookies - {formaterEuro(emballage.cout_unitaire)})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="label">Quantité de cookies *</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.quantite_cookies}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantite_cookies: parseInt(e.target.value) || 1,
                        })
                      }
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="label">Canal de vente</label>
                    <select
                      className="input"
                      value={formData.canal_vente}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          canal_vente: e.target.value as CanalVente,
                        })
                      }
                    >
                      {canauxOptions.map((canal) => (
                        <option key={canal} value={canal}>
                          {canal.charAt(0).toUpperCase() + canal.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 border-t border-slate-700 pt-4 mt-2">
                    <h3 className="font-semibold text-slate-100 mb-3">
                      Pricing
                    </h3>
                  </div>

                  <div>
                    <label className="label">Marge cible (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      value={formData.marge_cible_pourcentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marge_cible_pourcentage:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="label">
                      Prix de vente personnalisé (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.prix_vente_pratique || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prix_vente_pratique: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Optionnel"
                      min="0"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Laissez vide pour utiliser le prix recommandé
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Notes supplémentaires..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={fermerDialog}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {formatEnEdition ? "Modifier" : "Créer"}
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
