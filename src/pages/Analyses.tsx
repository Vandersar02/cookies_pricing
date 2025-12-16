import { useState } from "react";
import { useStore } from "@/store";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calculator,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import {
  formaterEuro,
  formaterPourcentage,
  calculerPrixVenteAvecMarge,
  calculerMargeReelle,
} from "@/utils/calculs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function Analyses() {
  const { formatsVente } = useStore();
  const [formatSelectionne, setFormatSelectionne] = useState<string>("");
  const [nouveauPrixSimule, setNouveauPrixSimule] = useState<string>("");
  const [nouvelleMarge, setNouvelleMarge] = useState<string>("");

  // Tri des formats par marge
  const formatsParMarge = [...formatsVente].sort(
    (a, b) => b.marge_reelle_pourcentage - a.marge_reelle_pourcentage
  );
  const formatsProfitables = formatsVente.filter((f) => f.profit_unitaire > 0);
  const formatsNonRentables = formatsVente.filter(
    (f) => f.profit_unitaire <= 0
  );

  // Stats globales
  const margeMinimale =
    formatsVente.length > 0
      ? Math.min(...formatsVente.map((f) => f.marge_reelle_pourcentage))
      : 0;
  const margeMaximale =
    formatsVente.length > 0
      ? Math.max(...formatsVente.map((f) => f.marge_reelle_pourcentage))
      : 0;
  const margeMoyenne =
    formatsVente.length > 0
      ? formatsVente.reduce((acc, f) => acc + f.marge_reelle_pourcentage, 0) /
        formatsVente.length
      : 0;

  // Format sélectionné pour simulation
  const format = formatsVente.find((f) => f.id === formatSelectionne);

  // Calcul de la simulation
  const calculerSimulation = () => {
    if (!format) return null;

    if (nouveauPrixSimule) {
      const prix = parseFloat(nouveauPrixSimule);
      if (isNaN(prix)) return null;

      const profit = prix - format.cout_total_revient;
      const marge = calculerMargeReelle(format.cout_total_revient, prix);
      const evolution =
        prix - (format.prix_vente_pratique || format.prix_vente_recommande);
      const evolutionMarge = marge - format.marge_reelle_pourcentage;

      return {
        prix,
        profit,
        marge,
        evolution,
        evolutionMarge,
        type: "prix" as const,
      };
    }

    if (nouvelleMarge) {
      const marge = parseFloat(nouvelleMarge);
      if (isNaN(marge)) return null;

      const prix = calculerPrixVenteAvecMarge(format.cout_total_revient, marge);
      const profit = prix - format.cout_total_revient;
      const evolution =
        prix - (format.prix_vente_pratique || format.prix_vente_recommande);
      const evolutionMarge = marge - format.marge_reelle_pourcentage;

      return {
        prix,
        profit,
        marge,
        evolution,
        evolutionMarge,
        type: "marge" as const,
      };
    }

    return null;
  };

  const simulation = calculerSimulation();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
          Analyses & Simulations
        </h1>
        <p className="text-slate-400 mb-8">
          Analysez votre rentabilité et simulez des scénarios de pricing
        </p>

        {formatsVente.length === 0 ? (
          <div className="card text-center py-12">
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Aucune donnée à analyser
            </h3>
            <p className="text-slate-400">
              Créez des formats de vente pour commencer les analyses.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats globales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-400">
                    Total formats
                  </span>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-slate-100">
                  {formatsVente.length}
                </p>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-400">
                    Marge moyenne
                  </span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p
                  className={`text-2xl font-bold ${
                    margeMoyenne >= 40
                      ? "text-green-600"
                      : margeMoyenne >= 25
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {formaterPourcentage(margeMoyenne)}
                </p>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-400">
                    Rentables
                  </span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {formatsProfitables.length}
                </p>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-400">
                    Non rentables
                  </span>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {formatsNonRentables.length}
                </p>
              </div>
            </div>

            {/* Comparaison des formats */}
            <div className="card">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary-400" />
                Comparaison des formats
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-3 text-sm font-semibold text-slate-300">
                        Format
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-300">
                        Coût
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-300">
                        Prix
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-300">
                        Profit
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-300">
                        Marge
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-300">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatsParMarge.map((format) => (
                      <tr
                        key={format.id}
                        className="border-b border-slate-700 hover:bg-slate-800"
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-slate-100">
                              {format.nom}
                            </p>
                            <p className="text-sm text-slate-400">
                              {format.type_cookie_nom}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-300">
                          {formaterEuro(format.cout_total_revient)}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-slate-100">
                          {formaterEuro(
                            format.prix_vente_pratique ||
                              format.prix_vente_recommande
                          )}
                        </td>
                        <td
                          className={`p-3 text-right font-mono font-semibold ${
                            format.profit_unitaire > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {format.profit_unitaire > 0 ? "+" : ""}
                          {formaterEuro(format.profit_unitaire)}
                        </td>
                        <td
                          className={`p-3 text-right font-mono font-bold ${
                            format.marge_reelle_pourcentage >= 40
                              ? "text-green-600"
                              : format.marge_reelle_pourcentage >= 25
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {formaterPourcentage(format.marge_reelle_pourcentage)}
                        </td>
                        <td className="p-3 text-right">
                          {format.profit_unitaire > 0 ? (
                            format.marge_reelle_pourcentage >=
                            format.marge_cible_pourcentage ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-200">
                                Excellent
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-200">
                                Viable
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-200">
                              Non rentable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Insights */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-700">
                <div className="p-4 bg-green-900/30 rounded-lg">
                  <p className="text-sm font-medium text-green-100 mb-1">
                    Meilleures marges
                  </p>
                  <p className="text-xs text-green-200">
                    Entre {formaterPourcentage(margeMaximale)} (meilleur)
                  </p>
                </div>
                <div className="p-4 bg-blue-900/30 rounded-lg">
                  <p className="text-sm font-medium text-blue-100 mb-1">
                    Marge moyenne
                  </p>
                  <p className="text-xs text-blue-200">
                    {formaterPourcentage(margeMoyenne)} sur l'ensemble
                  </p>
                </div>
                <div className="p-4 bg-red-900/30 rounded-lg">
                  <p className="text-sm font-medium text-red-100 mb-1">
                    Plus faibles marges
                  </p>
                  <p className="text-xs text-red-200">
                    Jusqu'à {formaterPourcentage(margeMinimale)} (moins bon)
                  </p>
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique des marges */}
              <div className="card">
                <h2 className="text-xl font-bold text-slate-100 mb-4">
                  Marges par format
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatsParMarge.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nom"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      label={{
                        value: "Marge (%)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value ? `${value.toFixed(1)}%` : ""
                      }
                      labelStyle={{ color: "#000" }}
                    />
                    <Bar
                      dataKey="marge_reelle_pourcentage"
                      fill="#3b82f6"
                      name="Marge"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique des coûts vs prix */}
              <div className="card">
                <h2 className="text-xl font-bold text-slate-100 mb-4">
                  Coûts vs Prix de vente
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatsParMarge.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nom"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      label={{
                        value: "Prix (€)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value ? formaterEuro(value) : ""
                      }
                      labelStyle={{ color: "#000" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="cout_total_revient"
                      fill="#ef4444"
                      name="Coût"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey={(item) =>
                        item.prix_vente_pratique || item.prix_vente_recommande
                      }
                      fill="#10b981"
                      name="Prix"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Répartition des coûts (si un format est sélectionné) */}
              {format && (
                <div className="card">
                  <h2 className="text-xl font-bold text-slate-100 mb-4">
                    Répartition des coûts - {format.nom}
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Cookies",
                            value: format.cout_cookies,
                            color: "#3b82f6",
                          },
                          {
                            name: "Emballage",
                            value: format.cout_emballage,
                            color: "#8b5cf6",
                          },
                          {
                            name: "Charges",
                            value: format.cout_charges,
                            color: "#f59e0b",
                          },
                          {
                            name: "Pertes",
                            value: format.cout_pertes,
                            color: "#ef4444",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          {
                            name: "Cookies",
                            value: format.cout_cookies,
                            color: "#3b82f6",
                          },
                          {
                            name: "Emballage",
                            value: format.cout_emballage,
                            color: "#8b5cf6",
                          },
                          {
                            name: "Charges",
                            value: format.cout_charges,
                            color: "#f59e0b",
                          },
                          {
                            name: "Pertes",
                            value: format.cout_pertes,
                            color: "#ef4444",
                          },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          value ? formaterEuro(value) : ""
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Graphique profit par format */}
              <div className="card">
                <h2 className="text-xl font-bold text-slate-100 mb-4">
                  Profit unitaire
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formatsParMarge.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nom"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      label={{
                        value: "Profit (€)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value ? formaterEuro(value) : ""
                      }
                      labelStyle={{ color: "#000" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit_unitaire"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Profit"
                      dot={{ fill: "#10b981", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Simulateur de prix */}
            <div className="card">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary-400" />
                Simulateur de pricing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Sélectionner un format</label>
                  <select
                    className="input"
                    value={formatSelectionne}
                    onChange={(e) => {
                      setFormatSelectionne(e.target.value);
                      setNouveauPrixSimule("");
                      setNouvelleMarge("");
                    }}
                  >
                    <option value="">-- Choisir un format --</option>
                    {formatsVente.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {format && (
                  <>
                    <div className="md:col-span-2 p-4 bg-slate-900 rounded-lg">
                      <h3 className="font-semibold text-slate-100 mb-3">
                        Situation actuelle
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 mb-1">Coût de revient</p>
                          <p className="font-bold text-slate-100">
                            {formaterEuro(format.cout_total_revient)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Prix actuel</p>
                          <p className="font-bold text-slate-100">
                            {formaterEuro(
                              format.prix_vente_pratique ||
                                format.prix_vente_recommande
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Profit</p>
                          <p
                            className={`font-bold ${
                              format.profit_unitaire > 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {formaterEuro(format.profit_unitaire)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Marge</p>
                          <p className="font-bold text-slate-100">
                            {formaterPourcentage(
                              format.marge_reelle_pourcentage
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="label">
                        Simuler un nouveau prix (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={nouveauPrixSimule}
                        onChange={(e) => {
                          setNouveauPrixSimule(e.target.value);
                          setNouvelleMarge("");
                        }}
                        placeholder="Ex: 12.50"
                      />
                    </div>

                    <div>
                      <label className="label">Ou une nouvelle marge (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        value={nouvelleMarge}
                        onChange={(e) => {
                          setNouvelleMarge(e.target.value);
                          setNouveauPrixSimule("");
                        }}
                        placeholder="Ex: 45"
                      />
                    </div>
                  </>
                )}
              </div>

              {simulation && format && (
                <div className="mt-6 p-6 bg-gradient-to-br from-primary-900/30 to-blue-900/30 rounded-lg border border-primary-700">
                  <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary-400" />
                    Résultats de la simulation
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Nouveau prix
                      </p>
                      <p className="text-xl font-bold text-primary-400">
                        {formaterEuro(simulation.prix)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Nouveau profit
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          simulation.profit > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {formaterEuro(simulation.profit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">
                        Nouvelle marge
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          simulation.marge >= 40
                            ? "text-green-400"
                            : simulation.marge >= 25
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {formaterPourcentage(simulation.marge)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Évolution</p>
                      <div className="flex items-center gap-1">
                        {simulation.evolution > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : simulation.evolution < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : null}
                        <p
                          className={`text-xl font-bold ${
                            simulation.evolution > 0
                              ? "text-green-600"
                              : simulation.evolution < 0
                              ? "text-red-600"
                              : "text-slate-600"
                          }`}
                        >
                          {simulation.evolution > 0 ? "+" : ""}
                          {formaterEuro(simulation.evolution)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-primary-700">
                    <p className="text-sm text-slate-200">
                      {simulation.evolution > 0 ? (
                        <>
                          <span className="font-semibold text-green-700">
                            Augmentation de{" "}
                            {formaterEuro(Math.abs(simulation.evolution))}
                          </span>{" "}
                          du prix de vente
                          {simulation.evolutionMarge > 0 && (
                            <>
                              {" "}
                              (marge +
                              {formaterPourcentage(simulation.evolutionMarge)})
                            </>
                          )}
                        </>
                      ) : simulation.evolution < 0 ? (
                        <>
                          <span className="font-semibold text-red-700">
                            Réduction de{" "}
                            {formaterEuro(Math.abs(simulation.evolution))}
                          </span>{" "}
                          du prix de vente
                          {simulation.evolutionMarge < 0 && (
                            <>
                              {" "}
                              (marge{" "}
                              {formaterPourcentage(simulation.evolutionMarge)})
                            </>
                          )}
                        </>
                      ) : (
                        <span className="font-semibold text-slate-700">
                          Prix inchangé
                        </span>
                      )}
                    </p>

                    {simulation.profit <= 0 && (
                      <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                        <p className="text-sm font-semibold text-red-100 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          ⚠️ Ce prix rend le produit non rentable
                        </p>
                      </div>
                    )}

                    {simulation.profit > 0 && simulation.marge < 25 && (
                      <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-100 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          ⚠️ Marge faible (inférieure à 25%)
                        </p>
                      </div>
                    )}

                    {simulation.profit > 0 && simulation.marge >= 40 && (
                      <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                        <p className="text-sm font-semibold text-green-100">
                          ✅ Excellent ! Marge confortable
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
