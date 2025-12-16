import { useState } from "react";
import { useStore } from "@/store";
import { Plus, Edit2, Trash2, Cookie } from "lucide-react";
import { formaterEuro } from "@/utils/calculs";
import type { Recette, IngredientRecette, NiveauRecette } from "@/types";

export default function Recettes() {
  const {
    recettes,
    ingredients,
    ajouterRecette,
    modifierRecette,
    supprimerRecette,
  } = useStore();
  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [recetteEnEdition, setRecetteEnEdition] = useState<Recette | null>(
    null
  );

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    niveau: "standard" as NiveauRecette,
    nombre_cookies_produits: 0,
    temps_preparation_minutes: 0,
    temperature_cuisson: 180,
    ingredients: [] as IngredientRecette[],
    cout_energie_four: 0,
    notes: "",
  });

  const ouvrirDialog = (recette?: Recette) => {
    if (recette) {
      setRecetteEnEdition(recette);
      setFormData({
        nom: recette.nom,
        description: recette.description || "",
        niveau: recette.niveau,
        nombre_cookies_produits: recette.nombre_cookies_produits,
        temps_preparation_minutes: recette.temps_preparation_minutes || 0,
        temperature_cuisson: recette.temperature_cuisson || 180,
        ingredients: recette.ingredients,
        cout_energie_four: recette.cout_energie_four || 0,
        notes: recette.notes || "",
      });
    } else {
      setRecetteEnEdition(null);
      setFormData({
        nom: "",
        description: "",
        niveau: "standard",
        nombre_cookies_produits: 0,
        temps_preparation_minutes: 0,
        temperature_cuisson: 180,
        ingredients: [],
        cout_energie_four: 0,
        notes: "",
      });
    }
    setDialogOuvert(true);
  };

  const fermerDialog = () => {
    setDialogOuvert(false);
    setRecetteEnEdition(null);
  };

  const ajouterIngredientRecette = () => {
    if (ingredients.length === 0) {
      alert("Ajoutez d'abord des ingrédients dans la section Ingrédients");
      return;
    }

    const premierIngredient = ingredients[0];
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        {
          ingredient_id: premierIngredient.id,
          ingredient_nom: premierIngredient.nom,
          quantite_necessaire: 0,
          unite: premierIngredient.unite_achat,
          cout_calcule: 0,
        },
      ],
    });
  };

  const modifierIngredientRecette = (
    index: number,
    champ: string,
    valeur: any
  ) => {
    const nouveauxIngredients = [...formData.ingredients];

    if (champ === "ingredient_id") {
      const ingredient = ingredients.find((i) => i.id === valeur);
      if (ingredient) {
        nouveauxIngredients[index] = {
          ...nouveauxIngredients[index],
          ingredient_id: valeur,
          ingredient_nom: ingredient.nom,
          unite: ingredient.unite_achat,
        };
      }
    } else {
      nouveauxIngredients[index] = {
        ...nouveauxIngredients[index],
        [champ]: valeur,
      };
    }

    setFormData({ ...formData, ingredients: nouveauxIngredients });
  };

  const supprimerIngredientRecette = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.ingredients.length === 0) {
      alert("Ajoutez au moins un ingrédient à la recette");
      return;
    }

    if (recetteEnEdition) {
      modifierRecette(recetteEnEdition.id, formData);
    } else {
      ajouterRecette(formData);
    }

    fermerDialog();
  };

  const handleSupprimer = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      supprimerRecette(id);
    }
  };

  const niveauxOptions: NiveauRecette[] = ["standard", "premium", "luxe"];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              Recettes
            </h1>
            <p className="text-slate-400">
              Créez vos recettes et calculez leurs coûts
            </p>
          </div>
          <button
            onClick={() => ouvrirDialog()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle recette
          </button>
        </div>

        {/* Liste des recettes */}
        {recettes.length === 0 ? (
          <div className="card text-center py-12">
            <Cookie className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Aucune recette
            </h3>
            <p className="text-slate-400 mb-6">
              Créez votre première recette de cookies.
            </p>
            <button onClick={() => ouvrirDialog()} className="btn-primary">
              Créer une recette
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recettes.map((recette) => (
              <div
                key={recette.id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-100 mb-1">
                      {recette.nom}
                    </h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-200">
                      {recette.niveau}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => ouvrirDialog(recette)}
                      className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSupprimer(recette.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {recette.description && (
                  <p className="text-sm text-slate-400 mb-3">
                    {recette.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Cookies produits</span>
                    <span className="font-medium text-slate-100">
                      {recette.nombre_cookies_produits}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Ingrédients</span>
                    <span className="font-medium text-slate-100">
                      {recette.ingredients.length}
                    </span>
                  </div>
                  {recette.temps_preparation_minutes &&
                    recette.temps_preparation_minutes > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Temps</span>
                        <span className="font-medium text-slate-100">
                          {recette.temps_preparation_minutes} min
                        </span>
                      </div>
                    )}
                </div>

                <div className="pt-3 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Coût total</span>
                    <span className="text-lg font-bold text-primary-400">
                      {formaterEuro(recette.cout_total_ingredients)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-500">Par cookie</span>
                    <span className="text-sm font-semibold text-green-400">
                      {formaterEuro(recette.cout_par_cookie_ingredients)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog Ajout/Édition */}
        {dialogOuvert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">
                  {recetteEnEdition ? "Modifier" : "Nouvelle"} recette
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="label">Nom de la recette *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      required
                      placeholder="Ex: Cookie Chocolat Noir"
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
                      placeholder="Description de la recette..."
                    />
                  </div>

                  <div>
                    <label className="label">Niveau</label>
                    <select
                      className="input"
                      value={formData.niveau}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          niveau: e.target.value as NiveauRecette,
                        })
                      }
                    >
                      {niveauxOptions.map((niveau) => (
                        <option key={niveau} value={niveau}>
                          {niveau.charAt(0).toUpperCase() + niveau.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Nombre de cookies produits *
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={formData.nombre_cookies_produits}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombre_cookies_produits:
                            parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="label">Temps de préparation (min)</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.temps_preparation_minutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          temps_preparation_minutes:
                            parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Température de cuisson (°C)</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.temperature_cuisson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          temperature_cuisson: parseInt(e.target.value) || 180,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Coût énergie four (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.cout_energie_four}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cout_energie_four: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                </div>

                {/* Ingrédients */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0">Ingrédients *</label>
                    <button
                      type="button"
                      onClick={ajouterIngredientRecette}
                      className="text-sm btn-primary"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Ajouter
                    </button>
                  </div>

                  {formData.ingredients.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
                      <p className="text-sm text-slate-400">
                        Aucun ingrédient ajouté
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.ingredients.map((ing, index) => (
                        <div
                          key={index}
                          className="bg-slate-900 border border-slate-700 rounded-lg p-3"
                        >
                          <div className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-5">
                              <label className="label text-xs">
                                Ingrédient
                              </label>
                              <select
                                className="input text-sm"
                                value={ing.ingredient_id}
                                onChange={(e) =>
                                  modifierIngredientRecette(
                                    index,
                                    "ingredient_id",
                                    e.target.value
                                  )
                                }
                              >
                                {ingredients.map((ingredient) => (
                                  <option
                                    key={ingredient.id}
                                    value={ingredient.id}
                                  >
                                    {ingredient.nom}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-3">
                              <label className="label text-xs">Quantité</label>
                              <input
                                type="number"
                                step="0.001"
                                className="input text-sm"
                                value={ing.quantite_necessaire}
                                onChange={(e) =>
                                  modifierIngredientRecette(
                                    index,
                                    "quantite_necessaire",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                min="0"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="label text-xs">Unité</label>
                              <select
                                className="input text-sm"
                                value={ing.unite}
                                onChange={(e) =>
                                  modifierIngredientRecette(
                                    index,
                                    "unite",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="L">L</option>
                                <option value="mL">mL</option>
                                <option value="unité">unité</option>
                              </select>
                            </div>
                            <div className="col-span-1">
                              <button
                                type="button"
                                onClick={() =>
                                  supprimerIngredientRecette(index)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={fermerDialog}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {recetteEnEdition ? "Modifier" : "Créer"}
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
