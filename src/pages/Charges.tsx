import { useState } from "react";
import { useStore } from "@/store";
import { Plus, Edit2, Trash2, DollarSign, AlertTriangle } from "lucide-react";
import { formaterEuro } from "@/utils/calculs";
import type {
  ChargesGlobales,
  PeriodeCharge,
  MethodeRepartition,
  Perte,
  TypePerte,
  ApplicationPerte,
} from "@/types";

export default function Charges() {
  const {
    charges,
    pertes,
    ajouterCharges,
    modifierCharges,
    supprimerCharges,
    ajouterPerte,
    modifierPerte,
    supprimerPerte,
  } = useStore();

  const [ongletActif, setOngletActif] = useState<"charges" | "pertes">(
    "charges"
  );
  const [dialogChargesOuvert, setDialogChargesOuvert] = useState(false);
  const [dialogPertesOuvert, setDialogPertesOuvert] = useState(false);
  const [chargesEnEdition, setChargesEnEdition] =
    useState<ChargesGlobales | null>(null);
  const [perteEnEdition, setPerteEnEdition] = useState<Perte | null>(null);

  const [formDataCharges, setFormDataCharges] = useState({
    nom: "",
    periode: "mensuel" as PeriodeCharge,
    electricite_gaz: 0,
    transport: 0,
    loyer_atelier: 0,
    eau: 0,
    entretien_materiel: 0,
    assurance: 0,
    main_oeuvre: 0,
    methode_repartition: "par_cookie" as MethodeRepartition,
    nombre_cookies_produits_periode: 0,
    pourcentage_charges: 0,
    notes: "",
  });

  const [formDataPerte, setFormDataPerte] = useState({
    nom: "",
    type_perte: "cuisson" as TypePerte,
    taux_perte_pourcentage: 0,
    applique_sur: "production" as ApplicationPerte,
    notes: "",
  });

  // === CHARGES ===
  const ouvrirDialogCharges = (charges?: ChargesGlobales) => {
    if (charges) {
      setChargesEnEdition(charges);
      setFormDataCharges({
        nom: charges.nom,
        periode: charges.periode,
        electricite_gaz: charges.charges.electricite_gaz,
        transport: charges.charges.transport,
        loyer_atelier: charges.charges.loyer_atelier || 0,
        eau: charges.charges.eau || 0,
        entretien_materiel: charges.charges.entretien_materiel || 0,
        assurance: charges.charges.assurance || 0,
        main_oeuvre: charges.charges.main_oeuvre || 0,
        methode_repartition: charges.methode_repartition,
        nombre_cookies_produits_periode:
          charges.nombre_cookies_produits_periode || 0,
        pourcentage_charges: charges.pourcentage_charges || 0,
        notes: charges.notes || "",
      });
    } else {
      setChargesEnEdition(null);
      setFormDataCharges({
        nom: "",
        periode: "mensuel",
        electricite_gaz: 0,
        transport: 0,
        loyer_atelier: 0,
        eau: 0,
        entretien_materiel: 0,
        assurance: 0,
        main_oeuvre: 0,
        methode_repartition: "par_cookie",
        nombre_cookies_produits_periode: 0,
        pourcentage_charges: 0,
        notes: "",
      });
    }
    setDialogChargesOuvert(true);
  };

  const fermerDialogCharges = () => {
    setDialogChargesOuvert(false);
    setChargesEnEdition(null);
  };

  const handleSubmitCharges = (e: React.FormEvent) => {
    e.preventDefault();

    const chargesData = {
      nom: formDataCharges.nom,
      periode: formDataCharges.periode,
      charges: {
        electricite_gaz: formDataCharges.electricite_gaz,
        transport: formDataCharges.transport,
        loyer_atelier: formDataCharges.loyer_atelier,
        eau: formDataCharges.eau,
        entretien_materiel: formDataCharges.entretien_materiel,
        assurance: formDataCharges.assurance,
        main_oeuvre: formDataCharges.main_oeuvre,
      },
      methode_repartition: formDataCharges.methode_repartition,
      nombre_cookies_produits_periode:
        formDataCharges.nombre_cookies_produits_periode,
      pourcentage_charges: formDataCharges.pourcentage_charges,
      notes: formDataCharges.notes,
    };

    if (chargesEnEdition) {
      modifierCharges(chargesEnEdition.id, chargesData);
    } else {
      ajouterCharges(chargesData);
    }

    fermerDialogCharges();
  };

  const handleSupprimerCharges = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ces charges ?")) {
      supprimerCharges(id);
    }
  };

  // === PERTES ===
  const ouvrirDialogPertes = (perte?: Perte) => {
    if (perte) {
      setPerteEnEdition(perte);
      setFormDataPerte({
        nom: perte.nom,
        type_perte: perte.type_perte,
        taux_perte_pourcentage: perte.taux_perte_pourcentage,
        applique_sur: perte.applique_sur,
        notes: perte.notes || "",
      });
    } else {
      setPerteEnEdition(null);
      setFormDataPerte({
        nom: "",
        type_perte: "cuisson",
        taux_perte_pourcentage: 0,
        applique_sur: "production",
        notes: "",
      });
    }
    setDialogPertesOuvert(true);
  };

  const fermerDialogPertes = () => {
    setDialogPertesOuvert(false);
    setPerteEnEdition(null);
  };

  const handleSubmitPerte = (e: React.FormEvent) => {
    e.preventDefault();

    if (perteEnEdition) {
      modifierPerte(perteEnEdition.id, formDataPerte);
    } else {
      ajouterPerte(formDataPerte);
    }

    fermerDialogPertes();
  };

  const handleSupprimerPerte = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette perte ?")) {
      supprimerPerte(id);
    }
  };

  const totalCharges = charges
    .filter((c) => c.actif)
    .reduce((acc, c) => acc + c.total_charges, 0);

  const totalPertes = pertes
    .filter((p) => p.actif)
    .reduce((acc, p) => acc + p.taux_perte_pourcentage, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              Charges & Pertes
            </h1>
            <p className="text-slate-400">
              Configurez vos charges indirectes et taux de pertes
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card bg-blue-900/30 border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200 mb-1">
                  Total charges mensuelles
                </p>
                <p className="text-2xl font-bold text-blue-100">
                  {formaterEuro(totalCharges)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="card bg-orange-900/30 border-orange-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-200 mb-1">
                  Total taux de pertes
                </p>
                <p className="text-2xl font-bold text-orange-100">
                  {totalPertes.toFixed(1)}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setOngletActif("charges")}
              className={`px-4 py-2 font-medium transition-colors ${
                ongletActif === "charges"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              Charges ({charges.length})
            </button>
            <button
              onClick={() => setOngletActif("pertes")}
              className={`px-4 py-2 font-medium transition-colors ${
                ongletActif === "pertes"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Pertes ({pertes.length})
            </button>
          </div>
        </div>

        {/* Contenu Charges */}
        {ongletActif === "charges" && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => ouvrirDialogCharges()}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouvelles charges
              </button>
            </div>

            {charges.length === 0 ? (
              <div className="card text-center py-12">
                <DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Aucune charge configurée
                </h3>
                <p className="text-slate-400 mb-6">
                  Ajoutez vos charges indirectes pour un calcul de coût précis.
                </p>
                <button
                  onClick={() => ouvrirDialogCharges()}
                  className="btn-primary"
                >
                  Ajouter des charges
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {charges.map((charge) => (
                  <div
                    key={charge.id}
                    className="card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-100 mb-1">
                          {charge.nom}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-200">
                            {charge.periode}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-200">
                            {charge.methode_repartition}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => ouvrirDialogCharges(charge)}
                          className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSupprimerCharges(charge.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {charge.charges.electricite_gaz > 0 && (
                        <div>
                          <p className="text-xs text-slate-500">
                            Électricité/Gaz
                          </p>
                          <p className="font-semibold text-slate-100">
                            {formaterEuro(charge.charges.electricite_gaz)}
                          </p>
                        </div>
                      )}
                      {charge.charges.transport > 0 && (
                        <div>
                          <p className="text-xs text-slate-500">Transport</p>
                          <p className="font-semibold text-slate-100">
                            {formaterEuro(charge.charges.transport)}
                          </p>
                        </div>
                      )}
                      {charge.charges.loyer_atelier &&
                        charge.charges.loyer_atelier > 0 && (
                          <div>
                            <p className="text-xs text-slate-500">Loyer</p>
                            <p className="font-semibold text-slate-100">
                              {formaterEuro(charge.charges.loyer_atelier)}
                            </p>
                          </div>
                        )}
                      {charge.charges.main_oeuvre &&
                        charge.charges.main_oeuvre > 0 && (
                          <div>
                            <p className="text-xs text-slate-500">
                              Main-d'œuvre
                            </p>
                            <p className="font-semibold text-slate-100">
                              {formaterEuro(charge.charges.main_oeuvre)}
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Total</span>
                        <span className="text-xl font-bold text-primary-400">
                          {formaterEuro(charge.total_charges)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contenu Pertes */}
        {ongletActif === "pertes" && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => ouvrirDialogPertes()}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouvelle perte
              </button>
            </div>

            {pertes.length === 0 ? (
              <div className="card text-center py-12">
                <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Aucune perte configurée
                </h3>
                <p className="text-slate-400 mb-6">
                  Définissez vos taux de pertes pour un coût réaliste.
                </p>
                <button
                  onClick={() => ouvrirDialogPertes()}
                  className="btn-primary"
                >
                  Ajouter une perte
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
                          Taux
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                          Appliqué sur
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pertes.map((perte) => (
                        <tr
                          key={perte.id}
                          className="border-b border-slate-700 hover:bg-slate-800"
                        >
                          <td className="py-3 px-4 font-medium text-slate-100">
                            {perte.nom}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/30 text-orange-200">
                              {perte.type_perte}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-orange-400">
                            {perte.taux_perte_pourcentage}%
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {perte.applique_sur}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => ouvrirDialogPertes(perte)}
                                className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSupprimerPerte(perte.id)}
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
          </div>
        )}

        {/* Dialog Charges */}
        {dialogChargesOuvert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">
                  {chargesEnEdition ? "Modifier" : "Nouvelles"} charges
                </h2>
              </div>

              <form onSubmit={handleSubmitCharges} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Nom *</label>
                    <input
                      type="text"
                      className="input"
                      value={formDataCharges.nom}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          nom: e.target.value,
                        })
                      }
                      required
                      placeholder="Ex: Charges mensuelles atelier"
                    />
                  </div>

                  <div>
                    <label className="label">Période</label>
                    <select
                      className="input"
                      value={formDataCharges.periode}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          periode: e.target.value as PeriodeCharge,
                        })
                      }
                    >
                      <option value="mensuel">Mensuel</option>
                      <option value="annuel">Annuel</option>
                      <option value="par_batch">Par batch</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Méthode de répartition</label>
                    <select
                      className="input"
                      value={formDataCharges.methode_repartition}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          methode_repartition: e.target
                            .value as MethodeRepartition,
                        })
                      }
                    >
                      <option value="par_cookie">Par cookie</option>
                      <option value="pourcentage">Pourcentage</option>
                      <option value="par_batch">Par batch</option>
                    </select>
                  </div>

                  {formDataCharges.methode_repartition === "par_cookie" && (
                    <div className="md:col-span-2">
                      <label className="label">
                        Nombre de cookies produits (période)
                      </label>
                      <input
                        type="number"
                        className="input"
                        value={formDataCharges.nombre_cookies_produits_periode}
                        onChange={(e) =>
                          setFormDataCharges({
                            ...formDataCharges,
                            nombre_cookies_produits_periode:
                              parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                      />
                    </div>
                  )}

                  {formDataCharges.methode_repartition === "pourcentage" && (
                    <div className="md:col-span-2">
                      <label className="label">
                        Pourcentage des charges (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="input"
                        value={formDataCharges.pourcentage_charges}
                        onChange={(e) =>
                          setFormDataCharges({
                            ...formDataCharges,
                            pourcentage_charges:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        min="0"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 border-t border-slate-700 pt-4 mt-2">
                    <h3 className="font-semibold text-slate-100 mb-3">
                      Détail des charges
                    </h3>
                  </div>

                  <div>
                    <label className="label">Électricité / Gaz (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formDataCharges.electricite_gaz}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          electricite_gaz: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Transport (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formDataCharges.transport}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          transport: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Loyer atelier (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formDataCharges.loyer_atelier}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          loyer_atelier: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Eau (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formDataCharges.eau}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          eau: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Entretien matériel (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formDataCharges.entretien_materiel}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          entretien_materiel: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Assurance (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formDataCharges.assurance}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          assurance: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="label">Main-d'œuvre (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formDataCharges.main_oeuvre}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          main_oeuvre: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={formDataCharges.notes}
                      onChange={(e) =>
                        setFormDataCharges({
                          ...formDataCharges,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Notes supplémentaires..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={fermerDialogCharges}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {chargesEnEdition ? "Modifier" : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog Pertes */}
        {dialogPertesOuvert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100">
                  {perteEnEdition ? "Modifier" : "Nouvelle"} perte
                </h2>
              </div>

              <form onSubmit={handleSubmitPerte} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Nom *</label>
                    <input
                      type="text"
                      className="input"
                      value={formDataPerte.nom}
                      onChange={(e) =>
                        setFormDataPerte({
                          ...formDataPerte,
                          nom: e.target.value,
                        })
                      }
                      required
                      placeholder="Ex: Pertes cuisson"
                    />
                  </div>

                  <div>
                    <label className="label">Type de perte</label>
                    <select
                      className="input"
                      value={formDataPerte.type_perte}
                      onChange={(e) =>
                        setFormDataPerte({
                          ...formDataPerte,
                          type_perte: e.target.value as TypePerte,
                        })
                      }
                    >
                      <option value="cuisson">Cuisson</option>
                      <option value="cassure">Cassure</option>
                      <option value="erreur">Erreur</option>
                      <option value="invendus">Invendus</option>
                      <option value="peremption">Péremption</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Taux de perte (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      value={formDataPerte.taux_perte_pourcentage}
                      onChange={(e) =>
                        setFormDataPerte({
                          ...formDataPerte,
                          taux_perte_pourcentage:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Appliqué sur</label>
                    <select
                      className="input"
                      value={formDataPerte.applique_sur}
                      onChange={(e) =>
                        setFormDataPerte({
                          ...formDataPerte,
                          applique_sur: e.target.value as ApplicationPerte,
                        })
                      }
                    >
                      <option value="ingredients">Ingrédients</option>
                      <option value="production">Production</option>
                      <option value="vente">Vente</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Notes</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formDataPerte.notes}
                      onChange={(e) =>
                        setFormDataPerte({
                          ...formDataPerte,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Notes supplémentaires..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={fermerDialogPertes}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {perteEnEdition ? "Modifier" : "Ajouter"}
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
