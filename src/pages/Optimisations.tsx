import { useStore } from "@/store";
import { useState, useMemo } from "react";
import {
  TrendingUp,
  Target,
  Award,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import {
  formaterEuro,
  formaterPourcentage,
  analyseABCProduits,
  calculerSeuilRentabilite,
  calculerKPIDashboard,
  comparerFournisseursPourIngredients,
} from "@/utils/calculs";
import type { ClasseABC } from "@/types";

export default function Optimisations() {
  const { formatsVente, ingredients, achats, charges } = useStore();
  const [ongletActif, setOngletActif] = useState<"abc" | "seuil" | "kpi" | "fournisseurs">("kpi");

  // Calcul des KPIs
  const kpis = useMemo(() => {
    return calculerKPIDashboard(formatsVente, ingredients, achats);
  }, [formatsVente, ingredients, achats]);

  // Analyse ABC
  const analyseABC = useMemo(() => {
    return analyseABCProduits(formatsVente);
  }, [formatsVente]);

  // Seuil de rentabilité
  const chargesFixesMensuelles = charges.reduce((sum, c) => sum + c.total_charges, 0);
  const seuilRentabilite = useMemo(() => {
    return calculerSeuilRentabilite(chargesFixesMensuelles, formatsVente);
  }, [chargesFixesMensuelles, formatsVente]);

  // Comparaison fournisseurs
  const comparaisonFournisseurs = useMemo(() => {
    return comparerFournisseursPourIngredients(ingredients, achats);
  }, [ingredients, achats]);

  const getCouleurClasse = (classe: ClasseABC) => {
    switch (classe) {
      case "A":
        return "bg-green-900/30 text-green-200 border-green-700";
      case "B":
        return "bg-yellow-900/30 text-yellow-200 border-yellow-700";
      case "C":
        return "bg-red-900/30 text-red-200 border-red-700";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
            Optimisations & Analytics Avancées
          </h1>
          <p className="text-slate-400">
            Analyses pour améliorer la rentabilité et réduire les coûts
          </p>
        </div>

        {/* Onglets */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setOngletActif("kpi")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              ongletActif === "kpi"
                ? "bg-primary-700 text-primary-100"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>KPIs Globaux</span>
            </div>
          </button>
          <button
            onClick={() => setOngletActif("abc")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              ongletActif === "abc"
                ? "bg-primary-700 text-primary-100"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Analyse ABC</span>
            </div>
          </button>
          <button
            onClick={() => setOngletActif("seuil")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              ongletActif === "seuil"
                ? "bg-primary-700 text-primary-100"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Seuil de Rentabilité</span>
            </div>
          </button>
          <button
            onClick={() => setOngletActif("fournisseurs")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              ongletActif === "fournisseurs"
                ? "bg-primary-700 text-primary-100"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Optimisation Fournisseurs</span>
            </div>
          </button>
        </div>

        {/* Contenu selon l'onglet */}
        {ongletActif === "kpi" && (
          <div className="space-y-6">
            {/* KPIs Rentabilité */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Rentabilité
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                  <p className="text-sm text-slate-400 mb-1">Marge brute moyenne</p>
                  <p className="text-3xl font-bold text-green-400">
                    {formaterPourcentage(kpis.marge_brute_moyenne)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sur prix de vente
                  </p>
                </div>
                <div className="card">
                  <p className="text-sm text-slate-400 mb-1">ROI</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {formaterPourcentage(kpis.roi)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Retour sur investissement
                  </p>
                </div>
                <div className="card">
                  <p className="text-sm text-slate-400 mb-1">Coût moyen/cookie</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {formaterEuro(kpis.cout_moyen_par_cookie)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Moyenne tous produits
                  </p>
                </div>
              </div>
            </div>

            {/* KPIs Stocks */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Inventaire
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                  <p className="text-sm text-slate-400 mb-1">Valeur stock total</p>
                  <p className="text-3xl font-bold text-slate-100">
                    {formaterEuro(kpis.valeur_stock_total)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Inventaire actuel
                  </p>
                </div>
                <div className="card">
                  <p className="text-sm text-slate-400 mb-1">Ingrédients en alerte</p>
                  <p className={`text-3xl font-bold ${
                    kpis.ingredients_en_alerte > 0 ? "text-orange-400" : "text-green-400"
                  }`}>
                    {kpis.ingredients_en_alerte}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Stock faible/épuisé
                  </p>
                </div>
                <div className="card">
                  <p className="text-sm text-slate-400 mb-1">Rotation stock</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {kpis.rotation_stock_jours}j
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Durée moyenne de rotation
                  </p>
                </div>
              </div>
            </div>

            {/* KPIs Fournisseurs */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Fournisseurs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                  <p className="text-sm text-slate-400 mb-1">Nombre de fournisseurs</p>
                  <p className="text-3xl font-bold text-slate-100">
                    {kpis.nombre_fournisseurs}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Fournisseurs actifs
                  </p>
                </div>
                <div className="card">
                  <p className="text-sm text-slate-400 mb-1">Fournisseur principal</p>
                  <p className="text-xl font-bold text-blue-400 truncate">
                    {kpis.fournisseur_principal}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Volume le plus élevé
                  </p>
                </div>
                <div className="card">
                  <p className="text-sm text-slate-400 mb-1">Format le plus rentable</p>
                  <p className="text-lg font-bold text-green-400 truncate">
                    {kpis.format_plus_rentable}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Meilleur profit unitaire
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyse ABC */}
        {ongletActif === "abc" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                Classification ABC des Produits
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Analyse Pareto : <strong className="text-green-400">Classe A</strong> = 80% du profit (produits stars),{" "}
                <strong className="text-yellow-400">Classe B</strong> = 15% du profit (produits standards),{" "}
                <strong className="text-red-400">Classe C</strong> = 5% du profit (produits à revoir)
              </p>

              {analyseABC.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Aucun produit rentable à analyser
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                          Rang
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                          Produit
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                          Profit Unitaire
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                          Contribution
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                          Cumulé
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                          Classe
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyseABC.map((item) => (
                        <tr key={item.format_id} className="border-b border-slate-700 hover:bg-slate-800">
                          <td className="py-3 px-4 text-slate-300">
                            #{item.rang}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-100">
                            {item.format_nom}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-green-400">
                            {formaterEuro(item.profit_unitaire)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300">
                            {formaterPourcentage(item.contribution_profit)}
                          </td>
                          <td className="py-3 px-4 text-right text-blue-400">
                            {formaterPourcentage(item.contribution_cumulative)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getCouleurClasse(item.classe)}`}>
                              {item.classe}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {item.classe === "A" && (
                              <span className="text-green-400 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Maximiser production
                              </span>
                            )}
                            {item.classe === "B" && (
                              <span className="text-yellow-400 flex items-center gap-1">
                                <ArrowUpCircle className="w-4 h-4" />
                                Optimiser marge
                              </span>
                            )}
                            {item.classe === "C" && (
                              <span className="text-red-400 flex items-center gap-1">
                                <ArrowDownCircle className="w-4 h-4" />
                                Revoir ou arrêter
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Statistiques ABC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-slate-400">Produits Classe A</p>
                    <p className="text-2xl font-bold text-green-400">
                      {analyseABC.filter(a => a.classe === "A").length}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  80% du profit - À promouvoir activement
                </p>
              </div>
              <div className="card border-l-4 border-yellow-500">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-sm text-slate-400">Produits Classe B</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {analyseABC.filter(a => a.classe === "B").length}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  15% du profit - Potentiel d'amélioration
                </p>
              </div>
              <div className="card border-l-4 border-red-500">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-sm text-slate-400">Produits Classe C</p>
                    <p className="text-2xl font-bold text-red-400">
                      {analyseABC.filter(a => a.classe === "C").length}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  5% du profit - Revoir stratégie
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seuil de Rentabilité */}
        {ongletActif === "seuil" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                Seuil de Rentabilité (Break-Even)
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Calculez combien d'unités vendre pour couvrir vos charges fixes mensuelles
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Charges fixes mensuelles</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {formaterEuro(seuilRentabilite.charges_fixes_mensuelles)}
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Marge moyenne/unité</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formaterEuro(seuilRentabilite.marge_contribution_moyenne)}
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Unités à vendre</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {seuilRentabilite.unites_a_vendre}
                  </p>
                </div>
              </div>

              <div className="bg-primary-900/20 border border-primary-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-primary-200">
                  <strong>Chiffre d'affaires minimum requis :</strong>{" "}
                  <span className="text-2xl font-bold">
                    {formaterEuro(seuilRentabilite.chiffre_affaires_minimum)}
                  </span>
                </p>
              </div>

              {seuilRentabilite.formats_analyse.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">
                    Objectifs par format
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                            Format
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                            Unités nécessaires
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                            CA généré
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {seuilRentabilite.formats_analyse.map((format) => (
                          <tr key={format.format_id} className="border-b border-slate-700">
                            <td className="py-3 px-4 text-slate-100">
                              {format.format_nom}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-blue-400">
                              {format.unites_necessaires}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-green-400">
                              {formaterEuro(format.ca_genere)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Optimisation Fournisseurs */}
        {ongletActif === "fournisseurs" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Comparaison des Fournisseurs
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Identifiez les meilleurs fournisseurs et les économies potentielles
              </p>

              {comparaisonFournisseurs.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Pas assez d'achats pour comparer les fournisseurs
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comparaisonFournisseurs.slice(0, 10).map((comp) => (
                    <div key={comp.ingredient_id} className="bg-slate-900 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">
                            {comp.ingredient_nom}
                          </h3>
                          <p className="text-sm text-slate-400">
                            Meilleur fournisseur : <strong className="text-green-400">{comp.meilleur_fournisseur}</strong>
                          </p>
                        </div>
                        {comp.economie_annuelle_estimee > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Économie estimée/an</p>
                            <p className="text-xl font-bold text-green-400">
                              {formaterEuro(comp.economie_annuelle_estimee)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {comp.fournisseurs.map((f) => (
                          <div
                            key={f.nom}
                            className={`p-3 rounded border ${
                              f.nom === comp.meilleur_fournisseur
                                ? "bg-green-900/20 border-green-700"
                                : "bg-slate-800 border-slate-700"
                            }`}
                          >
                            <p className="font-medium text-slate-100 mb-1">{f.nom}</p>
                            <p className="text-sm text-slate-300 mb-2">
                              {formaterEuro(f.prix_unitaire_moyen)}/unité
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{f.nombre_achats} achats</span>
                              <span className="text-blue-400">Score: {f.fiabilite_score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Résumé économies totales */}
              {comparaisonFournisseurs.length > 0 && (
                <div className="mt-6 bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <p className="text-sm text-green-200">
                    <strong>Économie annuelle totale estimée :</strong>{" "}
                    <span className="text-2xl font-bold">
                      {formaterEuro(
                        comparaisonFournisseurs.reduce(
                          (sum, c) => sum + c.economie_annuelle_estimee,
                          0
                        )
                      )}
                    </span>
                  </p>
                  <p className="text-xs text-green-300 mt-1">
                    En optimisant vos fournisseurs selon ces recommandations
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
