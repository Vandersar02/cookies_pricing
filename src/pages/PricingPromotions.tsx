import { useStore } from "@/store";
import { useState } from "react";
import {
  DollarSign,
  Plus,
  Tag,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  BarChart3,
} from "lucide-react";
import { calculerAnalyseSensibilite } from "@/utils/calculs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Promotion, TypeCanal } from "@/types";

export default function PricingPromotions() {
  const {
    formatsVente,
    promotions,
    ajouterPromotion,
    supprimerPromotion,
    activerPromotion,
    desactiverPromotion,
  } = useStore();

  const [onglet, setOnglet] = useState<"pricing" | "promotions" | "sensibilite">("promotions");
  const [dialogPromotion, setDialogPromotion] = useState(false);
  const [formatSelectionneSensibilite, setFormatSelectionneSensibilite] = useState("");

  const [formPromotion, setFormPromotion] = useState<{
    nom: string;
    description: string;
    type: "pourcentage" | "montant_fixe" | "volume";
    valeur_remise: number;
    quantite_minimum: number;
    date_debut: string;
    date_fin: string;
    application_automatique: boolean;
    code_promo: string;
    notes: string;
  }>({
    nom: "",
    description: "",
    type: "pourcentage",
    valeur_remise: 0,
    quantite_minimum: 0,
    date_debut: new Date().toISOString().split("T")[0],
    date_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    application_automatique: true,
    code_promo: "",
    notes: "",
  });

  const canaux: { id: TypeCanal; nom: string; icon: string }[] = [
    { id: "boutique", nom: "Boutique", icon: "🏪" },
    { id: "evenement", nom: "Événement", icon: "🎪" },
    { id: "en_ligne", nom: "En ligne", icon: "💻" },
    { id: "livraison", nom: "Livraison", icon: "🚚" },
  ];

  const handleAjouterPromotion = (e: React.FormEvent) => {
    e.preventDefault();

    ajouterPromotion({
      nom: formPromotion.nom,
      description: formPromotion.description,
      type: formPromotion.type,
      valeur_remise: formPromotion.valeur_remise,
      quantite_minimum: formPromotion.type === "volume" ? formPromotion.quantite_minimum : undefined,
      date_debut: new Date(formPromotion.date_debut),
      date_fin: new Date(formPromotion.date_fin),
      actif: true,
      application_automatique: formPromotion.application_automatique,
      code_promo: !formPromotion.application_automatique ? formPromotion.code_promo : undefined,
      notes: formPromotion.notes,
    });

    setDialogPromotion(false);
    setFormPromotion({
      nom: "",
      description: "",
      type: "pourcentage",
      valeur_remise: 0,
      quantite_minimum: 0,
      date_debut: new Date().toISOString().split("T")[0],
      date_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      application_automatique: true,
      code_promo: "",
      notes: "",
    });
  };

  const handleSupprimerPromotion = (id: string) => {
    if (confirm("Supprimer cette promotion ?")) {
      supprimerPromotion(id);
    }
  };

  const estPromotionActive = (promo: Promotion): boolean => {
    if (!promo.actif) return false;
    const maintenant = new Date();
    return (
      new Date(promo.date_debut) <= maintenant && new Date(promo.date_fin) >= maintenant
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2 flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-primary-400" />
              Pricing & Promotions
            </h1>
            <p className="text-slate-400">
              Gérez vos prix par canal, promotions et analysez la sensibilité des prix
            </p>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setOnglet("promotions")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              onglet === "promotions"
                ? "bg-primary-700 text-primary-100"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>Promotions ({promotions.length})</span>
            </div>
          </button>
          <button
            onClick={() => setOnglet("pricing")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              onglet === "pricing"
                ? "bg-primary-700 text-primary-100"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Prix par Canal</span>
            </div>
          </button>
          <button
            onClick={() => setOnglet("sensibilite")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              onglet === "sensibilite"
                ? "bg-primary-700 text-primary-100"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analyse de Sensibilité</span>
            </div>
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-slate-400 mb-1">Promotions actives</p>
            <p className="text-2xl font-bold text-green-400">
              {promotions.filter((p) => estPromotionActive(p)).length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400 mb-1">Total promotions</p>
            <p className="text-2xl font-bold text-blue-400">{promotions.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400 mb-1">Formats en promo</p>
            <p className="text-2xl font-bold text-purple-400">
              {formatsVente.filter((f) => f.promotions_actives && f.promotions_actives.length > 0).length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400 mb-1">Canaux actifs</p>
            <p className="text-2xl font-bold text-yellow-400">{canaux.length}</p>
          </div>
        </div>

        {/* Contenu selon onglet */}
        {onglet === "promotions" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setDialogPromotion(true)} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Promotion
              </button>
            </div>

            {promotions.length === 0 ? (
              <div className="card text-center py-12">
                <Tag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Aucune promotion enregistrée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {promotions.map((promo) => {
                  const actif = estPromotionActive(promo);
                  
                  return (
                    <div
                      key={promo.id}
                      className={`card ${actif ? "border-l-4 border-green-500" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-100">{promo.nom}</h3>
                            {actif ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </div>
                          {promo.description && (
                            <p className="text-sm text-slate-400 mb-2">{promo.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {promo.actif ? (
                            <button
                              onClick={() => desactiverPromotion(promo.id)}
                              className="text-slate-400 hover:text-orange-400"
                              title="Désactiver"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => activerPromotion(promo.id)}
                              className="text-slate-400 hover:text-green-400"
                              title="Activer"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleSupprimerPromotion(promo.id)}
                            className="text-slate-400 hover:text-red-400"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Type</p>
                          <p className="text-sm font-semibold text-slate-100 capitalize">
                            {promo.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Remise</p>
                          <p className="text-sm font-semibold text-slate-100">
                            {promo.type === "pourcentage" || promo.type === "volume"
                              ? `${promo.valeur_remise}%`
                              : `${promo.valeur_remise} G`}
                          </p>
                        </div>
                        {promo.type === "volume" && promo.quantite_minimum && (
                          <div>
                            <p className="text-xs text-slate-500">Quantité min.</p>
                            <p className="text-sm font-semibold text-slate-100">
                              {promo.quantite_minimum}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-slate-500">Application</p>
                          <p className="text-sm font-semibold text-slate-100">
                            {promo.application_automatique ? "Automatique" : "Code promo"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Du {format(new Date(promo.date_debut), "dd/MM/yyyy", { locale: fr })}
                          </span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Au {format(new Date(promo.date_fin), "dd/MM/yyyy", { locale: fr })}
                          </span>
                        </div>
                      </div>

                      {!promo.application_automatique && promo.code_promo && (
                        <div className="mt-3 p-2 bg-slate-700 rounded border border-slate-600">
                          <p className="text-xs text-slate-400">Code promo:</p>
                          <p className="text-lg font-mono font-bold text-primary-300">
                            {promo.code_promo}
                          </p>
                        </div>
                      )}

                      {promo.notes && (
                        <p className="text-sm text-slate-500 mt-3 italic">{promo.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {onglet === "pricing" && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-xl font-bold text-slate-100 mb-4">Prix par Canal de Vente</h2>
              <p className="text-slate-400 mb-6">
                Définissez des prix différents selon le canal de vente (boutique, événement, en ligne,
                livraison)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {canaux.map((canal) => (
                  <div key={canal.id} className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{canal.icon}</span>
                      <h3 className="text-lg font-semibold text-slate-100">{canal.nom}</h3>
                    </div>
                    <p className="text-sm text-slate-400">
                      {formatsVente.filter((f) => f.canal_vente === canal.id).length} format(s)
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-1">Fonctionnalité disponible</p>
                    <p>
                      Les prix par canal sont gérés dans la page "Formats de Vente". Vous pouvez
                      définir un prix différent pour chaque format selon le canal de distribution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {onglet === "sensibilite" && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-400" />
                Analyse de Sensibilité des Prix
              </h2>
              <p className="text-slate-400 mb-6">
                Analysez l'impact de variations de prix sur vos profits. Utilisez cette analyse pour
                trouver le prix optimal.
              </p>

              <div className="mb-6">
                <label className="label">Sélectionnez un format de vente</label>
                <select
                  className="input"
                  value={formatSelectionneSensibilite}
                  onChange={(e) => setFormatSelectionneSensibilite(e.target.value)}
                >
                  <option value="">-- Choisir un format --</option>
                  {formatsVente.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom} ({f.quantite_cookies} cookies)
                    </option>
                  ))}
                </select>
              </div>

              {formatSelectionneSensibilite && (() => {
                const format = formatsVente.find((f) => f.id === formatSelectionneSensibilite);
                if (!format) return null;

                const analyse = calculerAnalyseSensibilite(format, 100, -1.5);

                return (
                  <div className="space-y-6">
                    {/* Résumé actuel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="card bg-slate-700">
                        <p className="text-sm text-slate-400 mb-1">Prix actuel</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {analyse.prix_actuel.toFixed(2)} G
                        </p>
                      </div>
                      <div className="card bg-slate-700">
                        <p className="text-sm text-slate-400 mb-1">Coût de revient</p>
                        <p className="text-2xl font-bold text-orange-400">
                          {analyse.cout_actuel.toFixed(2)} G
                        </p>
                      </div>
                      <div className="card bg-slate-700">
                        <p className="text-sm text-slate-400 mb-1">Marge actuelle</p>
                        <p className="text-2xl font-bold text-green-400">
                          {analyse.marge_actuelle.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Recommandation */}
                    {analyse.recommandation && (
                      <div className="card bg-primary-900/20 border border-primary-700">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-lg font-semibold text-primary-100 mb-2">
                              Recommandation
                            </h3>
                            <p className="text-primary-200">{analyse.recommandation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tableau des scénarios */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-slate-100 mb-4">
                        Scénarios de Prix (Élasticité: {analyse.elasticite_prix})
                      </h3>
                      <div className="table-container">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                                Variation
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                                Prix
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                                Volume estimé
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                                CA
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                                Profit
                              </th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                                vs Actuel
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyse.scenarios.map((scenario, idx) => {
                              const estOptimal = scenario.profit_total === Math.max(...analyse.scenarios.map(s => s.profit_total));
                              const estActuel = scenario.variation_pourcentage === 0;
                              
                              return (
                                <tr
                                  key={idx}
                                  className={`border-b border-slate-800 ${
                                    estOptimal ? "bg-green-900/20" : ""
                                  } ${estActuel ? "bg-blue-900/20" : ""}`}
                                >
                                  <td className="py-3 px-4">
                                    <span
                                      className={`text-sm font-semibold ${
                                        scenario.variation_pourcentage > 0
                                          ? "text-red-400"
                                          : scenario.variation_pourcentage < 0
                                          ? "text-green-400"
                                          : "text-blue-400"
                                      }`}
                                    >
                                      {scenario.variation_pourcentage > 0 ? "+" : ""}
                                      {scenario.variation_pourcentage}%
                                    </span>
                                    {estActuel && (
                                      <span className="ml-2 text-xs text-blue-400">(actuel)</span>
                                    )}
                                    {estOptimal && (
                                      <span className="ml-2 text-xs text-green-400">
                                        (optimal)
                                      </span>
                                    )}
                                  </td>
                                  <td className="text-right py-3 px-4 text-sm text-slate-100">
                                    {scenario.nouveau_prix.toFixed(2)} G
                                  </td>
                                  <td className="text-right py-3 px-4 text-sm text-slate-300">
                                    {scenario.estimation_volume}
                                  </td>
                                  <td className="text-right py-3 px-4 text-sm text-slate-300">
                                    {scenario.chiffre_affaires.toFixed(2)} G
                                  </td>
                                  <td className="text-right py-3 px-4 text-sm text-slate-100 font-semibold">
                                    {scenario.profit_total.toFixed(2)} G
                                  </td>
                                  <td
                                    className={`text-right py-3 px-4 text-sm font-semibold ${
                                      scenario.variation_profit > 0
                                        ? "text-green-400"
                                        : scenario.variation_profit < 0
                                        ? "text-red-400"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {scenario.variation_profit > 0 ? "+" : ""}
                                    {scenario.variation_profit.toFixed(2)} G
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="card bg-slate-700">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">
                        Note sur l'élasticité-prix
                      </h4>
                      <p className="text-sm text-slate-400">
                        L'élasticité de -1.5 signifie que si le prix augmente de 10%, les ventes
                        diminuent de 15%. Cette valeur est une estimation et peut varier selon votre
                        marché. Un produit de luxe aura une élasticité proche de 0 (peu sensible au
                        prix), tandis qu'un produit de masse aura une élasticité élevée (très
                        sensible au prix).
                      </p>
                    </div>
                  </div>
                );
              })()}

              {!formatSelectionneSensibilite && (
                <div className="card text-center py-12">
                  <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Sélectionnez un format de vente pour analyser la sensibilité des prix
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dialog Nouvelle Promotion */}
        {dialogPromotion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">Nouvelle Promotion</h2>
              </div>

              <form onSubmit={handleAjouterPromotion} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Nom de la promotion *</label>
                    <input
                      type="text"
                      className="input"
                      value={formPromotion.nom}
                      onChange={(e) => setFormPromotion({ ...formPromotion, nom: e.target.value })}
                      required
                      placeholder="Ex: Réduction Été 2024"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Description</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={formPromotion.description}
                      onChange={(e) =>
                        setFormPromotion({ ...formPromotion, description: e.target.value })
                      }
                      placeholder="Description de la promotion..."
                    />
                  </div>

                  <div>
                    <label className="label">Type de remise *</label>
                    <select
                      className="input"
                      value={formPromotion.type}
                      onChange={(e) =>
                        setFormPromotion({
                          ...formPromotion,
                          type: e.target.value as "pourcentage" | "montant_fixe" | "volume",
                        })
                      }
                    >
                      <option value="pourcentage">Pourcentage</option>
                      <option value="montant_fixe">Montant fixe</option>
                      <option value="volume">Volume (quantité)</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Valeur de la remise *{" "}
                      {formPromotion.type === "montant_fixe" ? "(G)" : "(%)"}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={formPromotion.valeur_remise}
                      onChange={(e) =>
                        setFormPromotion({
                          ...formPromotion,
                          valeur_remise: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {formPromotion.type === "volume" && (
                    <div className="md:col-span-2">
                      <label className="label">Quantité minimum</label>
                      <input
                        type="number"
                        className="input"
                        value={formPromotion.quantite_minimum}
                        onChange={(e) =>
                          setFormPromotion({
                            ...formPromotion,
                            quantite_minimum: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        placeholder="Ex: 50 cookies minimum"
                      />
                    </div>
                  )}

                  <div>
                    <label className="label">Date de début *</label>
                    <input
                      type="date"
                      className="input"
                      value={formPromotion.date_debut}
                      onChange={(e) =>
                        setFormPromotion({ ...formPromotion, date_debut: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Date de fin *</label>
                    <input
                      type="date"
                      className="input"
                      value={formPromotion.date_fin}
                      onChange={(e) =>
                        setFormPromotion({ ...formPromotion, date_fin: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formPromotion.application_automatique}
                        onChange={(e) =>
                          setFormPromotion({
                            ...formPromotion,
                            application_automatique: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-300">Application automatique</span>
                    </label>
                    <p className="text-xs text-slate-500 ml-6 mt-1">
                      Si décoché, un code promo sera nécessaire
                    </p>
                  </div>

                  {!formPromotion.application_automatique && (
                    <div className="md:col-span-2">
                      <label className="label">Code promo</label>
                      <input
                        type="text"
                        className="input"
                        value={formPromotion.code_promo}
                        onChange={(e) =>
                          setFormPromotion({
                            ...formPromotion,
                            code_promo: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="Ex: ETE2024"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={formPromotion.notes}
                      onChange={(e) =>
                        setFormPromotion({ ...formPromotion, notes: e.target.value })
                      }
                      placeholder="Notes internes..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDialogPromotion(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Créer Promotion
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
