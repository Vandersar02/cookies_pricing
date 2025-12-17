import { useState } from "react";
import { useStore } from "@/store";
import { TrendingUp, Calculator, DollarSign } from "lucide-react";
import { formaterEuro, formaterPourcentage, calculerPrixVenteAvecMarge } from "@/utils/calculs";

export default function ComparateurMarges() {
  const { formatsVente, recettes } = useStore();
  const [formatSelectionne, setFormatSelectionne] = useState<string>("");
  
  // Marges prédéfinies à comparer
  const margesAComparer = [25, 30, 35, 40, 45, 50, 55, 60];

  const format = formatsVente.find((f) => f.id === formatSelectionne);
  const recette = format 
    ? recettes.find((r) => r.id === format.type_cookie_id)
    : null;

  // Calculs pour le coût sans emballage
  const coutSansEmballage = format && recette
    ? (recette.cout_par_cookie_ingredients * format.quantite_cookies) + 
      (format.cout_charges || 0) +
      (format.cout_pertes || 0)
    : 0;

  const coutParCookieSansEmballage = format && format.quantite_cookies > 0
    ? coutSansEmballage / format.quantite_cookies
    : 0;

  const coutParCookieAvecEmballage = format && format.quantite_cookies > 0
    ? format.cout_total_revient / format.quantite_cookies
    : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
            Comparateur de Marges
          </h1>
          <p className="text-slate-400">
            Comparez les prix de vente et bénéfices selon différentes marges
          </p>
        </div>

        {/* Sélection du format */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            Sélectionnez un format de vente
          </h2>
          <select
            className="input max-w-md"
            value={formatSelectionne}
            onChange={(e) => setFormatSelectionne(e.target.value)}
          >
            <option value="">-- Choisir un format --</option>
            {formatsVente.map((format) => (
              <option key={format.id} value={format.id}>
                {format.nom} - {format.quantite_cookies} cookies
              </option>
            ))}
          </select>
        </div>

        {format && (
          <>
            {/* Informations du format */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-900/30 rounded-lg">
                    <Calculator className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-100">
                    Coût sans emballage
                  </h3>
                </div>
                <p className="text-2xl font-bold text-blue-400 mb-1">
                  {formaterEuro(coutSansEmballage)}
                </p>
                <p className="text-sm text-slate-400">
                  {formaterEuro(coutParCookieSansEmballage)}/cookie
                </p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-slate-100">
                    Coût avec emballage
                  </h3>
                </div>
                <p className="text-2xl font-bold text-purple-400 mb-1">
                  {formaterEuro(format.cout_total_revient)}
                </p>
                <p className="text-sm text-slate-400">
                  {formaterEuro(coutParCookieAvecEmballage)}/cookie
                </p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-100">
                    Marge actuelle
                  </h3>
                </div>
                <p className="text-2xl font-bold text-green-400 mb-1">
                  {formaterPourcentage(format.marge_reelle_pourcentage)}
                </p>
                <p className="text-sm text-slate-400">
                  Prix: {formaterEuro(format.prix_vente_pratique || format.prix_vente_recommande)}
                </p>
              </div>
            </div>

            {/* Détail des coûts */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                Détail des coûts pour {format.quantite_cookies} cookies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-300 mb-2">
                    Coûts individuels
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Cookies</span>
                    <span className="font-medium">{formaterEuro(format.cout_cookies)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Emballage</span>
                    <span className="font-medium">{formaterEuro(format.cout_emballage)}</span>
                  </div>
                  {format.cout_emballage_extras > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Extras emballage</span>
                      <span className="font-medium">{formaterEuro(format.cout_emballage_extras)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Charges</span>
                    <span className="font-medium">{formaterEuro(format.cout_charges)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Pertes</span>
                    <span className="font-medium">{formaterEuro(format.cout_pertes)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-slate-300 mb-2">
                    Coûts par cookie
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Sans emballage</span>
                    <span className="font-medium text-blue-400">
                      {formaterEuro(coutParCookieSansEmballage)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Avec emballage</span>
                    <span className="font-medium text-purple-400">
                      {formaterEuro(coutParCookieAvecEmballage)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                    <span className="text-slate-400">Impact emballage</span>
                    <span className="font-medium text-orange-400">
                      +{formaterEuro(coutParCookieAvecEmballage - coutParCookieSansEmballage)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau de comparaison des marges */}
            <div className="card">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                Comparaison des marges bénéficiaires
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Coût de revient total : <span className="font-medium text-slate-100">{formaterEuro(format.cout_total_revient)}</span>
              </p>
              
              <div className="table-container">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                        Marge
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                        Prix de vente
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                        Bénéfice
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                        Prix/cookie
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                        Recommandation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {margesAComparer.map((marge) => {
                      const prixVente = calculerPrixVenteAvecMarge(format.cout_total_revient, marge);
                      const benefice = prixVente - format.cout_total_revient;
                      const prixParCookie = format.quantite_cookies > 0 ? prixVente / format.quantite_cookies : 0;
                      const estMargeActuelle = Math.abs(format.marge_reelle_pourcentage - marge) < 1;

                      let recommandation = "";
                      let couleurRecommandation = "";
                      
                      if (marge < 30) {
                        recommandation = "Compétitif";
                        couleurRecommandation = "text-blue-400";
                      } else if (marge < 45) {
                        recommandation = "Standard";
                        couleurRecommandation = "text-green-400";
                      } else if (marge < 55) {
                        recommandation = "Premium";
                        couleurRecommandation = "text-yellow-400";
                      } else {
                        recommandation = "Luxe";
                        couleurRecommandation = "text-purple-400";
                      }

                      return (
                        <tr
                          key={marge}
                          className={`border-b border-slate-700 hover:bg-slate-800 ${
                            estMargeActuelle ? "bg-primary-900/20" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100">
                                {marge}%
                              </span>
                              {estMargeActuelle && (
                                <span className="text-xs px-2 py-0.5 bg-primary-900/50 text-primary-200 rounded-full">
                                  Actuel
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-100">
                            {formaterEuro(prixVente)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-green-400">
                            +{formaterEuro(benefice)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300">
                            {formaterEuro(prixParCookie)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-sm font-medium ${couleurRecommandation}`}>
                              {recommandation}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Légende */}
              <div className="mt-4 p-4 bg-slate-900 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">
                  Guide de sélection de marge
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-400">Compétitif (25-30%)</span>
                    <p className="text-slate-400">Vente en volume, grande distribution</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-400">Standard (30-45%)</span>
                    <p className="text-slate-400">Boutique, vente directe, événements</p>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-400">Premium (45-55%)</span>
                    <p className="text-slate-400">Produits de qualité supérieure</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-400">Luxe (55%+)</span>
                    <p className="text-slate-400">Haut de gamme, commandes spéciales</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!formatSelectionne && (
          <div className="card text-center py-12">
            <Calculator className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              Sélectionnez un format
            </h3>
            <p className="text-slate-400">
              Choisissez un format de vente pour voir la comparaison des marges
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
