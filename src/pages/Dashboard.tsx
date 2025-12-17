import { useStore } from "@/store";
import { formaterEuro, formaterPourcentage } from "@/utils/calculs";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Cookie,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const {
    ingredients,
    recettes,
    formatsVente,
    charges,
    pertes,
    alertes,
    genererAlertes,
    emballages,
  } = useStore();

  useEffect(() => {
    genererAlertes();
  }, [formatsVente, genererAlertes]);

  // Statistiques globales
  const totalIngredients = ingredients.filter((i) => i.actif).length;
  const totalRecettes = recettes.filter((r) => r.actif).length;
  const totalFormats = formatsVente.filter((f) => f.actif).length;

  // Calculs de rentabilité
  const formatsRentables = formatsVente.filter(
    (f) => f.profit_unitaire != null && f.profit_unitaire > 0
  ).length;
  const tauxRentabilite = formatsVente.length > 0 
    ? (formatsRentables / formatsVente.length) * 100 
    : 0;

  const margeMoyenne =
    formatsVente.length > 0
      ? formatsVente.reduce((acc, f) => acc + f.marge_reelle_pourcentage, 0) /
        formatsVente.length
      : 0;

  // Calculs financiers
  const coutTotalIngredients = ingredients
    .filter((i) => i.actif)
    .reduce((acc, i) => acc + i.prix_achat_total, 0);

  const revenuPotentiel = formatsVente
    .filter((f) => f.actif)
    .reduce((acc, f) => acc + (f.prix_vente_pratique || f.prix_vente_recommande), 0);

  const profitTotal = formatsVente
    .filter((f) => f.actif)
    .reduce((acc, f) => acc + f.profit_unitaire, 0);

  const coutMoyenParCookie = recettes.length > 0
    ? recettes.reduce((acc, r) => acc + r.cout_par_cookie_ingredients, 0) / recettes.length
    : 0;

  // Alertes de stock
  const ingredientsStockFaible = ingredients.filter(
    (i) => i.actif && 
    i.quantite_stock != null && 
    i.stock_minimum != null && 
    i.quantite_stock <= i.stock_minimum
  );

  // Format le plus rentable
  const formatPlusRentable =
    formatsVente.length > 0
      ? formatsVente.reduce(
          (max, f) => (f.profit_unitaire > max.profit_unitaire ? f : max),
          formatsVente[0]
        )
      : null;

  // Top formats par profit
  const topFormatsParProfit = [...formatsVente]
    .filter((f) => f.actif)
    .sort((a, b) => b.profit_unitaire - a.profit_unitaire)
    .slice(0, 5);

  // Répartition des coûts (moyenne)
  const coutsMoyens = formatsVente.length > 0 ? {
    ingredients: formatsVente.reduce((acc, f) => acc + f.cout_cookies, 0) / formatsVente.length,
    emballage: formatsVente.reduce((acc, f) => acc + f.cout_emballage, 0) / formatsVente.length,
    charges: formatsVente.reduce((acc, f) => acc + f.cout_charges, 0) / formatsVente.length,
    pertes: formatsVente.reduce((acc, f) => acc + f.cout_pertes, 0) / formatsVente.length,
  } : { ingredients: 0, emballage: 0, charges: 0, pertes: 0 };

  // Alertes non résolues
  const alertesNonResolues = alertes.filter((a) => !a.resolu);

  const stats = [
    {
      label: "Ingrédients",
      valeur: totalIngredients,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Recettes",
      valeur: totalRecettes,
      icon: Cookie,
      color: "bg-amber-500",
    },
    {
      label: "Formats de vente",
      valeur: totalFormats,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      label: "Marge moyenne",
      valeur: formaterPourcentage(margeMoyenne),
      icon: margeMoyenne >= 40 ? TrendingUp : TrendingDown,
      color: margeMoyenne >= 40 ? "bg-green-500" : "bg-red-500",
    },
  ];

  const statsFinancieres = [
    {
      label: "Coût total ingrédients",
      valeur: formaterEuro(coutTotalIngredients),
      icon: Package,
      color: "bg-purple-500",
    },
    {
      label: "Revenu potentiel",
      valeur: formaterEuro(revenuPotentiel),
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      label: "Profit total",
      valeur: formaterEuro(profitTotal),
      icon: TrendingUp,
      color: profitTotal > 0 ? "bg-green-500" : "bg-red-500",
    },
    {
      label: "Taux rentabilité",
      valeur: formaterPourcentage(tauxRentabilite),
      icon: tauxRentabilite >= 75 ? TrendingUp : TrendingDown,
      color: tauxRentabilite >= 75 ? "bg-green-500" : "bg-yellow-500",
    },
  ];

  // Données pour le graphique de répartition des coûts
  const dataCouts = [
    { name: "Ingrédients", value: coutsMoyens.ingredients, color: "#3b82f6" },
    { name: "Emballage", value: coutsMoyens.emballage, color: "#f59e0b" },
    { name: "Charges", value: coutsMoyens.charges, color: "#ef4444" },
    { name: "Pertes", value: coutsMoyens.pertes, color: "#8b5cf6" },
  ].filter((item) => item.value > 0);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
            Tableau de bord
          </h1>
          <p className="text-slate-400">Vue d'ensemble de votre activité</p>
        </div>

        {/* Alertes */}
        {alertesNonResolues.length > 0 && (
          <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-100 mb-2">
                  {alertesNonResolues.length} alerte
                  {alertesNonResolues.length > 1 ? "s" : ""} nécessit
                  {alertesNonResolues.length > 1 ? "ent" : "e"} votre attention
                </h3>
                <ul className="space-y-1">
                  {alertesNonResolues.slice(0, 3).map((alerte) => (
                    <li key={alerte.id} className="text-sm text-red-200">
                      • {alerte.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-100">
                      {stat.valeur}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Métriques financières */}
        {formatsVente.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4">
                Vue financière
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsFinancieres.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-slate-100">
                          {stat.valeur}
                        </p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Alertes de stock */}
        {ingredientsStockFaible.length > 0 && (
          <div className="mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-100 mb-2">
                  {ingredientsStockFaible.length} ingrédient
                  {ingredientsStockFaible.length > 1 ? "s" : ""} à stock faible
                </h3>
                <ul className="space-y-1">
                  {ingredientsStockFaible.slice(0, 3).map((ingredient) => (
                    <li key={ingredient.id} className="text-sm text-yellow-200">
                      • {ingredient.nom} : {ingredient.quantite_stock} {ingredient.unite_achat} 
                      (min: {ingredient.stock_minimum})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Données vides - Chargement démo */}
        {ingredients.length === 0 && (
          <div className="card text-center py-12">
            <Cookie className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Bienvenue dans Cookie Pricing !
            </h3>
            <p className="text-slate-400 mb-6">
              Commencez par créer vos ingrédients et recettes pour calculer vos
              coûts.
            </p>
          </div>
        )}

        {/* Tableau des formats de vente */}
        {formatsVente.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Formats de vente
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                      Nom
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                      Quantité
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Coût
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Prix vente
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Profit
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                      Marge
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formatsVente.map((format) => (
                    <tr
                      key={format.id}
                      className="border-b border-slate-700 hover:bg-slate-800"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-100">
                            {format.nom}
                          </p>
                          <p className="text-sm text-slate-400">
                            {format.type_cookie_nom}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {format.quantite_cookies} cookies
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-100">
                        {formaterEuro(format.cout_total_revient)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-100">
                        {formaterEuro(
                          format.prix_vente_pratique ||
                            format.prix_vente_recommande
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          format.profit_unitaire > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formaterEuro(format.profit_unitaire)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                            format.marge_reelle_pourcentage >= 40
                              ? "bg-green-900/30 text-green-200"
                              : format.marge_reelle_pourcentage >= 25
                              ? "bg-yellow-900/30 text-yellow-200"
                              : "bg-red-900/30 text-red-200"
                          }`}
                        >
                          {formaterPourcentage(format.marge_reelle_pourcentage)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Format le plus rentable */}
        {formatPlusRentable && (
          <div className="mt-6 bg-green-900/30 border border-green-700 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-green-400 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-100 mb-2">
                  Format le plus rentable
                </h3>
                <p className="text-green-200">
                  <strong>{formatPlusRentable.nom}</strong> génère un profit de{" "}
                  <strong>
                    {formaterEuro(formatPlusRentable.profit_unitaire)}
                  </strong>{" "}
                  avec une marge de{" "}
                  <strong>
                    {formaterPourcentage(
                      formatPlusRentable.marge_reelle_pourcentage
                    )}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Graphiques */}
        {formatsVente.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Top 5 formats par marge */}
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-4">
                  Top 5 formats par marge
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={formatsVente
                      .sort(
                        (a, b) =>
                          b.marge_reelle_pourcentage - a.marge_reelle_pourcentage
                      )
                      .slice(0, 5)}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="nom"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis tick={{ fill: "#94a3b8" }} />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value ? `${value.toFixed(1)}%` : ""
                      }
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                      }}
                    />
                    <Bar
                      dataKey="marge_reelle_pourcentage"
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top 5 formats par profit */}
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-4">
                  Top 5 formats par profit
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topFormatsParProfit}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="nom"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis tick={{ fill: "#94a3b8" }} />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value ? formaterEuro(value) : ""
                      }
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                      }}
                    />
                    <Bar
                      dataKey="profit_unitaire"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graphiques supplémentaires */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Répartition des coûts */}
              {dataCouts.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-100 mb-4">
                    Répartition moyenne des coûts
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={dataCouts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${percent ? (percent * 100).toFixed(1) : 0}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dataCouts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          value ? formaterEuro(value) : ""
                        }
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Coût des recettes */}
              {recettes.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-100 mb-4">
                    Coût par cookie des recettes
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={recettes.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="nom"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                      />
                      <YAxis tick={{ fill: "#94a3b8" }} />
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          value ? formaterEuro(value) : ""
                        }
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                        }}
                      />
                      <Bar
                        dataKey="cout_par_cookie_ingredients"
                        fill="#f59e0b"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}

        {/* Métriques de production */}
        {(recettes.length > 0 || emballages.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Coût moyen par cookie */}
            {recettes.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-3">
                  Métriques de production
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Coût moyen/cookie
                    </span>
                    <span className="font-medium text-slate-100">
                      {formaterEuro(coutMoyenParCookie)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Recettes actives
                    </span>
                    <span className="font-medium text-slate-100">
                      {totalRecettes}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Formats rentables
                    </span>
                    <span className="font-medium text-green-400">
                      {formatsRentables} / {totalFormats}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Inventaire */}
            <div className="card">
              <h3 className="font-semibold text-slate-100 mb-3">Inventaire</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">
                    Ingrédients actifs
                  </span>
                  <span className="font-medium text-slate-100">
                    {totalIngredients}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">
                    Emballages configurés
                  </span>
                  <span className="font-medium text-slate-100">
                    {emballages.filter((e) => e.actif).length}
                  </span>
                </div>
                {ingredientsStockFaible.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-400">
                      Stock faible
                    </span>
                    <span className="font-medium text-yellow-400">
                      {ingredientsStockFaible.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Analyse de rentabilité */}
            {formatsVente.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-3">
                  Analyse rentabilité
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Marge moyenne</span>
                    <span
                      className={`font-medium ${
                        margeMoyenne >= 40
                          ? "text-green-400"
                          : margeMoyenne >= 25
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {formaterPourcentage(margeMoyenne)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Taux rentabilité
                    </span>
                    <span
                      className={`font-medium ${
                        tauxRentabilite >= 75
                          ? "text-green-400"
                          : tauxRentabilite >= 50
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {formaterPourcentage(tauxRentabilite)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                      Profit total estimé
                    </span>
                    <span
                      className={`font-medium ${
                        profitTotal > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formaterEuro(profitTotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Résumé des charges et pertes */}
        {(charges.length > 0 || pertes.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {charges.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-3">
                  Charges configurées
                </h3>
                <ul className="space-y-2">
                  {charges
                    .filter((c) => c.actif)
                    .map((charge) => (
                      <li
                        key={charge.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-slate-400">{charge.nom}</span>
                        <span className="font-medium text-slate-100">
                          {formaterEuro(charge.total_charges)} /{" "}
                          {charge.periode}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {pertes.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-slate-100 mb-3">
                  Pertes configurées
                </h3>
                <ul className="space-y-2">
                  {pertes
                    .filter((p) => p.actif)
                    .map((perte) => (
                      <li
                        key={perte.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-slate-400">{perte.nom}</span>
                        <span className="font-medium text-slate-100">
                          {perte.taux_perte_pourcentage}%
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
