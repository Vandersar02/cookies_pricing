import { useState } from "react";
import { useStore } from "@/store";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  Edit2,
} from "lucide-react";
import { formaterEuro } from "@/utils/calculs";
import type { Ingredient } from "@/types";

export default function Stocks() {
  const { ingredients, modifierIngredient } = useStore();
  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [ingredientEnEdition, setIngredientEnEdition] =
    useState<Ingredient | null>(null);
  const [mouvementDialog, setMouvementDialog] = useState(false);
  const [typeMouvement, setTypeMouvement] = useState<"entree" | "sortie">(
    "entree"
  );
  const [quantiteMouvement, setQuantiteMouvement] = useState<string>("");

  const [formData, setFormData] = useState({
    quantite_stock: 0,
    stock_minimum: 0,
    stock_maximum: 0,
  });

  // Statistiques
  const ingredientsAvecStock = ingredients.filter(
    (i) => i.quantite_stock !== undefined
  );
  const ingredientsEnRupture = ingredients.filter(
    (i) => i.quantite_stock !== undefined && i.quantite_stock === 0
  );
  const ingredientsAlerte = ingredients.filter(
    (i) =>
      i.quantite_stock !== undefined &&
      i.stock_minimum !== undefined &&
      i.quantite_stock > 0 &&
      i.quantite_stock <= i.stock_minimum
  );

  const valeurStockTotal = ingredients.reduce((total, ing) => {
    if (ing.quantite_stock !== undefined) {
      return total + ing.quantite_stock * ing.prix_par_unite;
    }
    return total;
  }, 0);

  const ouvrirDialogConfig = (ingredient: Ingredient) => {
    setIngredientEnEdition(ingredient);
    setFormData({
      quantite_stock: ingredient.quantite_stock || 0,
      stock_minimum: ingredient.stock_minimum || 0,
      stock_maximum: ingredient.stock_maximum || 0,
    });
    setDialogOuvert(true);
  };

  const ouvrirMouvementDialog = (
    ingredient: Ingredient,
    type: "entree" | "sortie"
  ) => {
    setIngredientEnEdition(ingredient);
    setTypeMouvement(type);
    setQuantiteMouvement("");
    setMouvementDialog(true);
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientEnEdition) return;

    modifierIngredient(ingredientEnEdition.id, {
      quantite_stock: formData.quantite_stock,
      stock_minimum: formData.stock_minimum,
      stock_maximum: formData.stock_maximum,
    });

    setDialogOuvert(false);
  };

  const handleMouvementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientEnEdition) return;

    const quantite = parseFloat(quantiteMouvement);
    if (isNaN(quantite) || quantite <= 0) {
      alert("Quantité invalide");
      return;
    }

    const stockActuel = ingredientEnEdition.quantite_stock || 0;
    let nouveauStock: number;

    if (typeMouvement === "entree") {
      nouveauStock = stockActuel + quantite;
    } else {
      nouveauStock = Math.max(0, stockActuel - quantite);
    }

    modifierIngredient(ingredientEnEdition.id, {
      quantite_stock: nouveauStock,
    });

    setMouvementDialog(false);
  };

  const getNiveauStock = (
    ingredient: Ingredient
  ): "danger" | "warning" | "ok" => {
    if (ingredient.quantite_stock === undefined) return "ok";
    if (ingredient.quantite_stock === 0) return "danger";
    if (
      ingredient.stock_minimum !== undefined &&
      ingredient.quantite_stock <= ingredient.stock_minimum
    ) {
      return "warning";
    }
    return "ok";
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              Gestion des Stocks
            </h1>
            <p className="text-slate-400">
              Suivez vos inventaires et réapprovisionnements
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">
                Ingrédients en stock
              </span>
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100">
              {ingredientsAvecStock.length}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">
                Valeur totale
              </span>
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">
              {formaterEuro(valeurStockTotal)}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">
                Alertes
              </span>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {ingredientsAlerte.length}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">
                Ruptures
              </span>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">
              {ingredientsEnRupture.length}
            </p>
          </div>
        </div>

        {/* Alertes */}
        {ingredientsEnRupture.length > 0 && (
          <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-100 mb-2">
                  Ingrédients en rupture de stock
                </p>
                <ul className="text-sm text-red-200 space-y-1">
                  {ingredientsEnRupture.map((ing) => (
                    <li key={ing.id}>• {ing.nom}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {ingredientsAlerte.length > 0 && (
          <div className="mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-100 mb-2">
                  Stock faible - Réapprovisionnement recommandé
                </p>
                <ul className="text-sm text-yellow-200 space-y-1">
                  {ingredientsAlerte.map((ing) => (
                    <li key={ing.id}>
                      • {ing.nom} - Stock: {ing.quantite_stock}{" "}
                      {ing.unite_achat} (Min: {ing.stock_minimum})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Table des stocks */}
        <div className="card">
          <h2 className="text-xl font-bold text-slate-100 mb-4">
            Inventaire des ingrédients
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Ingrédient
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                    Stock actuel
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                    Min / Max
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                    Valeur
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => {
                  const niveau = getNiveauStock(ingredient);
                  const valeur =
                    (ingredient.quantite_stock || 0) *
                    ingredient.prix_par_unite;

                  return (
                    <tr
                      key={ingredient.id}
                      className="border-b border-slate-700 hover:bg-slate-800"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-100">
                            {ingredient.nom}
                          </p>
                          <p className="text-sm text-slate-400">
                            {ingredient.categorie}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold ${
                            niveau === "danger"
                              ? "text-red-600"
                              : niveau === "warning"
                              ? "text-yellow-600"
                              : "text-slate-900"
                          }`}
                        >
                          {ingredient.quantite_stock !== undefined
                            ? ingredient.quantite_stock
                            : "-"}
                        </span>
                        <span className="text-sm text-slate-400 ml-1">
                          {ingredient.unite_achat}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-400">
                        {ingredient.stock_minimum !== undefined ||
                        ingredient.stock_maximum !== undefined ? (
                          <>
                            {ingredient.stock_minimum || "-"} /{" "}
                            {ingredient.stock_maximum || "-"}
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-100">
                        {formaterEuro(valeur)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {niveau === "danger" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-200">
                            Rupture
                          </span>
                        )}
                        {niveau === "warning" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-200">
                            Faible
                          </span>
                        )}
                        {niveau === "ok" &&
                          ingredient.quantite_stock !== undefined && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-200">
                              OK
                            </span>
                          )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              ouvrirMouvementDialog(ingredient, "entree")
                            }
                            className="p-1.5 text-green-400 hover:bg-green-900/30 rounded"
                            title="Entrée de stock"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              ouvrirMouvementDialog(ingredient, "sortie")
                            }
                            className="p-1.5 text-red-400 hover:bg-red-900/30 rounded"
                            title="Sortie de stock"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => ouvrirDialogConfig(ingredient)}
                            className="p-1.5 text-slate-400 hover:bg-slate-700 rounded"
                            title="Configurer les seuils"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dialog Configuration */}
        {dialogOuvert && ingredientEnEdition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">
                  Configuration stock - {ingredientEnEdition.nom}
                </h2>
              </div>

              <form onSubmit={handleConfigSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      Quantité en stock ({ingredientEnEdition.unite_achat})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.quantite_stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantite_stock: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">
                      Stock minimum (seuil d'alerte)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.stock_minimum}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_minimum: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Stock maximum recommandé</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.stock_maximum}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_maximum: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
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

        {/* Dialog Mouvement */}
        {mouvementDialog && ingredientEnEdition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">
                  {typeMouvement === "entree" ? "Entrée" : "Sortie"} de stock
                </h2>
                <p className="text-slate-400 mt-1">{ingredientEnEdition.nom}</p>
              </div>

              <form onSubmit={handleMouvementSubmit} className="p-6">
                <div className="mb-4 p-4 bg-slate-900 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Stock actuel</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {ingredientEnEdition.quantite_stock || 0}{" "}
                    {ingredientEnEdition.unite_achat}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="label">
                    Quantité{" "}
                    {typeMouvement === "entree" ? "ajoutée" : "retirée"} (
                    {ingredientEnEdition.unite_achat})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={quantiteMouvement}
                    onChange={(e) => setQuantiteMouvement(e.target.value)}
                    min="0"
                    required
                    autoFocus
                  />
                </div>

                {quantiteMouvement && !isNaN(parseFloat(quantiteMouvement)) && (
                  <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                    <p className="text-sm text-blue-200 mb-1">Nouveau stock</p>
                    <p className="text-xl font-bold text-blue-100">
                      {typeMouvement === "entree"
                        ? (ingredientEnEdition.quantite_stock || 0) +
                          parseFloat(quantiteMouvement)
                        : Math.max(
                            0,
                            (ingredientEnEdition.quantite_stock || 0) -
                              parseFloat(quantiteMouvement)
                          )}{" "}
                      {ingredientEnEdition.unite_achat}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setMouvementDialog(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={
                      typeMouvement === "entree" ? "btn-primary" : "btn-danger"
                    }
                  >
                    {typeMouvement === "entree" ? "Ajouter" : "Retirer"}
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
