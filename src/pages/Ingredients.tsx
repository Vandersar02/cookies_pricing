import { useState } from "react";
import { useStore } from "@/store";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import { formaterEuro } from "@/utils/calculs";
import type { Ingredient, UniteAchat } from "@/types";

export default function Ingredients() {
  const {
    ingredients,
    ajouterIngredient,
    modifierIngredient,
    supprimerIngredient,
    categoriesPersonnalisees,
    ajouterCategoriePersonnalisee,
  } = useStore();
  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [ingredientEnEdition, setIngredientEnEdition] =
    useState<Ingredient | null>(null);
  const [nouvelleCategorie, setNouvelleCategorie] = useState("");
  const [afficherAjoutCategorie, setAfficherAjoutCategorie] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    categorie: "autre",
    unite_achat: "kg" as UniteAchat,
    notes: "",
  });

  const ouvrirDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setIngredientEnEdition(ingredient);
      setFormData({
        nom: ingredient.nom,
        categorie: ingredient.categorie,
        unite_achat: ingredient.unite_achat,
        notes: ingredient.notes || "",
      });
    } else {
      setIngredientEnEdition(null);
      setFormData({
        nom: "",
        categorie: "autre",
        unite_achat: "kg",
        notes: "",
      });
    }
    setDialogOuvert(true);
  };

  const fermerDialog = () => {
    setDialogOuvert(false);
    setIngredientEnEdition(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (ingredientEnEdition) {
      // Modification d'un ingrédient existant
      modifierIngredient(ingredientEnEdition.id, {
        nom: formData.nom,
        categorie: formData.categorie,
        unite_achat: formData.unite_achat,
        notes: formData.notes,
      });
    } else {
      // Ajout d'un nouvel ingrédient
      ajouterIngredient({
        nom: formData.nom,
        categorie: formData.categorie,
        unite_achat: formData.unite_achat,
        notes: formData.notes,
      });
    }

    fermerDialog();
  };

  const handleSupprimer = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet ingrédient ?")) {
      supprimerIngredient(id);
    }
  };

  const categoriesDeBase = [
    "farine",
    "sucre",
    "gras",
    "œufs",
    "additif",
    "chocolat",
    "autre",
  ];

  // Combiner les catégories de base avec les catégories personnalisées
  const toutesCategories = [...categoriesDeBase, ...categoriesPersonnalisees];

  const unitesOptions: UniteAchat[] = ["kg", "g", "L", "mL", "unité", "paquet"];

  const handleAjouterCategorie = () => {
    if (nouvelleCategorie.trim()) {
      ajouterCategoriePersonnalisee(nouvelleCategorie.trim());
      setFormData({ ...formData, categorie: nouvelleCategorie.trim().toLowerCase() });
      setNouvelleCategorie("");
      setAfficherAjoutCategorie(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              Ingrédients
            </h1>
            <p className="text-slate-400">
              Gérez la liste de vos ingrédients (les prix viennent des achats)
            </p>
          </div>
          <button
            onClick={() => ouvrirDialog()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvel ingrédient
          </button>
        </div>

        {/* Liste des ingrédients */}
        {ingredients.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Aucun ingrédient
            </h3>
            <p className="text-slate-400 mb-6">
              Commencez par ajouter vos premiers ingrédients.
            </p>
            <button onClick={() => ouvrirDialog()} className="btn-primary">
              Ajouter un ingrédient
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                      Nom
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                      Catégorie
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                      Unité
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Prix/unité
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Stock actuel
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient) => (
                    <tr
                      key={ingredient.id}
                      className="border-b border-slate-700 hover:bg-slate-800"
                    >
                      <td className="py-3 px-4 font-medium text-slate-100">
                        {ingredient.nom}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-200">
                          {ingredient.categorie}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {ingredient.unite_achat}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-400">
                        {ingredient.prix_par_unite > 0 
                          ? `${formaterEuro(ingredient.prix_par_unite)}/${ingredient.unite_achat}`
                          : "Aucun achat"}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {ingredient.quantite_stock !== undefined 
                          ? `${ingredient.quantite_stock} ${ingredient.unite_achat}`
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => ouvrirDialog(ingredient)}
                            className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSupprimer(ingredient.id)}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">
                  {ingredientEnEdition ? "Modifier" : "Nouvel"} ingrédient
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Nom de l'ingrédient *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      required
                      placeholder="Ex: Farine T55"
                    />
                  </div>

                  <div>
                    <label className="label">Catégorie</label>
                    <div className="flex gap-2">
                      <select
                        className="input flex-1"
                        value={formData.categorie}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categorie: e.target.value,
                          })
                        }
                      >
                        {toutesCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setAfficherAjoutCategorie(!afficherAjoutCategorie)}
                        className="btn-secondary px-3"
                        title="Ajouter une catégorie"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    {afficherAjoutCategorie && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          className="input flex-1"
                          placeholder="Nouvelle catégorie"
                          value={nouvelleCategorie}
                          onChange={(e) => setNouvelleCategorie(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAjouterCategorie();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAjouterCategorie}
                          className="btn-primary px-4"
                        >
                          Ajouter
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAfficherAjoutCategorie(false);
                            setNouvelleCategorie("");
                          }}
                          className="btn-secondary px-4"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Unité d'achat</label>
                    <select
                      className="input"
                      value={formData.unite_achat}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unite_achat: e.target.value as UniteAchat,
                        })
                      }
                    >
                      {unitesOptions.map((unite) => (
                        <option key={unite} value={unite}>
                          {unite}
                        </option>
                      ))}
                    </select>
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
                    {ingredientEnEdition ? "Modifier" : "Ajouter"}
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
