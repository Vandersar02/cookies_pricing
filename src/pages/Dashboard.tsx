import { useStore } from "@/store";
import { formaterEuro, formaterPourcentage } from "@/utils/calculs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
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
    emballages,
    charges,
    pertes,
    alertes,
    genererAlertes,
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
    (f) => f.profit_unitaire > 0
  ).length;
  const margeMoyenne =
    formatsVente.length > 0
      ? formatsVente.reduce((acc, f) => acc + f.marge_reelle_pourcentage, 0) /
        formatsVente.length
      : 0;

  // Format le plus rentable
  const formatPlusRentable =
    formatsVente.length > 0
      ? formatsVente.reduce(
          (max, f) => (f.profit_unitaire > max.profit_unitaire ? f : max),
          formatsVente[0]
        )
      : null;

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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="nom"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Bar
                    dataKey="marge_reelle_pourcentage"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Répartition des recettes */}
            <div className="card">
              <h3 className="font-semibold text-slate-100 mb-4">
                Recettes par catégorie
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={recettes.slice(0, 6).map((r) => ({
                      name: r.nom,
                      value: r.cout_par_cookie_ingredients,
                      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {recettes.slice(0, 6).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${(index * 360) / 6}, 70%, 60%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formaterEuro(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
