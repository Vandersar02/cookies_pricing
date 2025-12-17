import { useState } from "react";
import { useStore } from "@/store";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import { formaterEuro } from "@/utils/calculs";
import type { Emballage, TypeEmballage } from "@/types";

export default function Emballages() {
  const {
    emballages,
    ajouterEmballage,
    modifierEmballage,
    supprimerEmballage,
  } = useStore();
  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [emballageEnEdition, setEmballageEnEdition] =
    useState<Emballage | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    type: "sachet" as TypeEmballage,
    capacite_cookies: 0,
    cout_unitaire: 0,
    cout_extras: 0,
    description_extras: "",
    fournisseur: "",
    materiau: "",
    quantite_stock: 0,
    notes: "",
  });

  const ouvrirDialog = (emballage?: Emballage) => {
    if (emballage) {
      setEmballageEnEdition(emballage);
      setFormData({
        nom: emballage.nom,
        type: emballage.type,
        capacite_cookies: emballage.capacite_cookies,
        cout_unitaire: emballage.cout_unitaire,
        cout_extras: emballage.cout_extras || 0,
        description_extras: emballage.description_extras || "",
        fournisseur: emballage.fournisseur || "",
        materiau: emballage.materiau || "",
        quantite_stock: emballage.quantite_stock || 0,
        notes: emballage.notes || "",
      });
    } else {
      setEmballageEnEdition(null);
      setFormData({
        nom: "",
        type: "sachet",
        capacite_cookies: 0,
        cout_unitaire: 0,
        cout_extras: 0,
        description_extras: "",
        fournisseur: "",
        materiau: "",
        quantite_stock: 0,
        notes: "",
      });
    }
    setDialogOuvert(true);
  };

  const fermerDialog = () => {
    setDialogOuvert(false);
    setEmballageEnEdition(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (emballageEnEdition) {
      modifierEmballage(emballageEnEdition.id, formData);
    } else {
      ajouterEmballage(formData);
    }

    fermerDialog();
  };

  const handleSupprimer = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet emballage ?")) {
      supprimerEmballage(id);
    }
  };

  const typesOptions: TypeEmballage[] = [
    "sachet",
    "boite",
    "carton",
    "luxe",
    "vrac",
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              Emballages
            </h1>
            <p className="text-slate-400">
              Gérez vos emballages et leurs coûts
            </p>
          </div>
          <button
            onClick={() => ouvrirDialog()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvel emballage
          </button>
        </div>

        {/* Liste des emballages */}
        {emballages.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Aucun emballage
            </h3>
            <p className="text-slate-400 mb-6">
              Commencez par ajouter vos types d'emballages.
            </p>
            <button onClick={() => ouvrirDialog()} className="btn-primary">
              Ajouter un emballage
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                      Nom
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                      Type
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Capacité
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Coût unitaire
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Extras
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Coût/cookie
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                      Matériau
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Stock
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emballages.map((emballage) => (
                    <tr
                      key={emballage.id}
                      className="border-b border-slate-700 hover:bg-slate-800"
                    >
                      <td className="py-3 px-4 font-medium text-slate-100">
                        {emballage.nom}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-200">
                          {emballage.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {emballage.capacite_cookies} cookies
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-100">
                        {formaterEuro(emballage.cout_unitaire)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {emballage.cout_extras 
                          ? formaterEuro(emballage.cout_extras)
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-400">
                        {formaterEuro(emballage.cout_par_cookie)}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {emballage.materiau || "-"}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {emballage.quantite_stock || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => ouvrirDialog(emballage)}
                            className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSupprimer(emballage.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dialog Ajout/Édition */}
        {dialogOuvert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">
                  {emballageEnEdition ? "Modifier" : "Nouvel"} emballage
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Nom de l'emballage *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      required
                      placeholder="Ex: Sachet kraft 6 cookies"
                    />
                  </div>

                  <div>
                    <label className="label">Type</label>
                    <select
                      className="input"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as TypeEmballage,
                        })
                      }
                    >
                      {typesOptions.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Capacité (nombre de cookies) *
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={formData.capacite_cookies}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacite_cookies: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="label">Coût unitaire (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.cout_unitaire}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cout_unitaire: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2 border-t border-slate-700 pt-4 mt-2">
                    <h3 className="font-semibold text-slate-100 mb-3">
                      Produits additionnels (optionnel)
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Ajoutez le coût des éléments supplémentaires : étiquettes, rubans, décorations, etc.
                    </p>
                  </div>

                  <div>
                    <label className="label">Coût extras (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.cout_extras}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cout_extras: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="label">Description des extras</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.description_extras}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description_extras: e.target.value,
                        })
                      }
                      placeholder="Ex: Étiquette + ruban"
                    />
                  </div>

                  <div className="md:col-span-2 border-t border-slate-700 pt-4 mt-2">
                    <h3 className="font-semibold text-slate-100 mb-3">
                      Autres informations
                    </h3>
                  </div>

                  <div>
                    <label className="label">Matériau</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.materiau}
                      onChange={(e) =>
                        setFormData({ ...formData, materiau: e.target.value })
                      }
                      placeholder="Ex: Kraft recyclé"
                    />
                  </div>

                  <div>
                    <label className="label">Fournisseur</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.fournisseur}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fournisseur: e.target.value,
                        })
                      }
                      placeholder="Ex: PackagingPro"
                    />
                  </div>

                  <div>
                    <label className="label">Quantité en stock</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.quantite_stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantite_stock: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows={3}
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
                    {emballageEnEdition ? "Modifier" : "Ajouter"}
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
