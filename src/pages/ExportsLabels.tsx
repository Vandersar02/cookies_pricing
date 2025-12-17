import { useState, useEffect } from 'react';
import {
  FileText,
  QrCode,
  Barcode,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Printer,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../store';
import type {
  ConfigurationEtiquette,
  DonneesEtiquette,
  TypeEtiquette,
  FormatCodeBarre,
  SyncStatus,
} from '../types';
import {
  genererEtiquettePDF,
  genererLotEtiquettes,
  genererEAN13,
  calculerDatePeremption,
  genererQRCode,
  genererCodeBarre,
} from '../utils/labels';
import {
  getSyncStatus,
  synchroniserModifications,
  exporterDonneesLocales,
  importerDonneesLocales,
} from '../utils/offline';

type TabType = 'etiquettes' | 'exports' | 'offline';

export default function ExportsLabels() {
  const [activeTab, setActiveTab] = useState<TabType>('etiquettes');
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [generating, setGenerating] = useState(false);

  const formats = useStore((state) => state.formatsVente);
  const recettes = useStore((state) => state.recettes);

  // État pour la configuration des étiquettes
  const [configEtiquette, setConfigEtiquette] =
    useState<ConfigurationEtiquette>({
      largeur_mm: 70,
      hauteur_mm: 40,
      type: 'prix',
      inclure_logo: false,
      inclure_code_barre: true,
      format_code_barre: 'EAN13',
      inclure_qr_code: false,
      afficher_prix: true,
      afficher_ingredients: true,
      afficher_allergenes: true,
      afficher_valeurs_nutritionnelles: false,
      afficher_date_production: true,
      afficher_date_peremption: true,
      jours_avant_peremption: 7,
      taille_police: 10,
      langue: 'fr',
    });

  const [formatSelectionne, setFormatSelectionne] = useState<string>('');
  const [quantiteLot, setQuantiteLot] = useState<number>(10);
  const [qrPreview, setQrPreview] = useState<string>('');
  const [barcodePreview, setBarcodePreview] = useState<string>('');

  // Charger le statut de sync
  useEffect(() => {
    chargerSyncStatus();
    const interval = setInterval(chargerSyncStatus, 5000); // Rafraîchir toutes les 5s
    return () => clearInterval(interval);
  }, []);

  const chargerSyncStatus = async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Erreur chargement sync status:', error);
    }
  };

  // Générer aperçu QR code
  useEffect(() => {
    if (formatSelectionne) {
      const format = formats.find((f) => f.id === formatSelectionne);
      if (format) {
        const qrData = JSON.stringify({
          id: format.id,
          nom: format.nom,
          prix: (format.prix_vente_pratique ?? format.prix_vente_recommande),
        });
        genererQRCode(qrData)
          .then(setQrPreview)
          .catch(console.error);

        // Générer aperçu code-barres
        const ean13 = genererEAN13();
        genererCodeBarre(ean13, configEtiquette.format_code_barre)
          .then(setBarcodePreview)
          .catch(console.error);
      }
    }
  }, [formatSelectionne, configEtiquette.format_code_barre, formats]);

  const genererEtiquette = async () => {
    if (!formatSelectionne) {
      alert('Veuillez sélectionner un format de vente');
      return;
    }

    setGenerating(true);
    try {
      const format = formats.find((f) => f.id === formatSelectionne);
      if (!format) return;

      const recette = recettes.find((r) => r.id === format.type_cookie_id);
      if (!recette) return;

      const dateProduction = new Date();
      const datePeremption = calculerDatePeremption(
        dateProduction,
        configEtiquette.jours_avant_peremption || 7
      );

      const donneesEtiquette: DonneesEtiquette = {
        format_id: format.id,
        nom_produit: format.nom,
        recette_nom: recette.nom,
        quantite: format.quantite_cookies,
        prix_vente: configEtiquette.afficher_prix
          ? (format.prix_vente_pratique ?? format.prix_vente_recommande)
          : undefined,
        liste_ingredients: configEtiquette.afficher_ingredients
          ? recette.ingredients.map((i) => i.ingredient_nom)
          : undefined,
        allergenes: configEtiquette.afficher_allergenes
          ? ['Peut contenir des traces de fruits à coque']
          : undefined,
        date_production: configEtiquette.afficher_date_production
          ? dateProduction
          : undefined,
        date_peremption: configEtiquette.afficher_date_peremption
          ? datePeremption
          : undefined,
        numero_lot: `LOT${Date.now().toString().slice(-6)}`,
        code_barre: configEtiquette.inclure_code_barre
          ? genererEAN13()
          : undefined,
        qr_code_data: configEtiquette.inclure_qr_code
          ? JSON.stringify({
              id: format.id,
              nom: format.nom,
              prix: (format.prix_vente_pratique ?? format.prix_vente_recommande),
            })
          : undefined,
        poids_net: format.quantite_cookies * 30, // 30g par cookie estimé
        nom_fabricant: 'Tamy Cookies',
      };

      await genererEtiquettePDF(donneesEtiquette, configEtiquette);
      alert('Étiquette générée avec succès !');
    } catch (error) {
      console.error('Erreur génération étiquette:', error);
      alert('Erreur lors de la génération de l\'étiquette');
    } finally {
      setGenerating(false);
    }
  };

  const genererLot = async () => {
    if (!formatSelectionne || quantiteLot <= 0) {
      alert('Veuillez sélectionner un format et une quantité valide');
      return;
    }

    setGenerating(true);
    try {
      const format = formats.find((f) => f.id === formatSelectionne);
      if (!format) return;

      const recette = recettes.find((r) => r.id === format.type_cookie_id);
      if (!recette) return;

      const listeEtiquettes: DonneesEtiquette[] = [];

      for (let i = 0; i < quantiteLot; i++) {
        const dateProduction = new Date();
        const datePeremption = calculerDatePeremption(
          dateProduction,
          configEtiquette.jours_avant_peremption || 7
        );

        listeEtiquettes.push({
          format_id: format.id,
          nom_produit: format.nom,
          recette_nom: recette.nom,
          quantite: format.quantite_cookies,
          prix_vente: (format.prix_vente_pratique ?? format.prix_vente_recommande),
          code_barre: configEtiquette.inclure_code_barre
            ? genererEAN13()
            : undefined,
          date_production: dateProduction,
          date_peremption: datePeremption,
          numero_lot: `LOT${Date.now().toString().slice(-6)}-${i + 1}`,
        });
      }

      await genererLotEtiquettes(listeEtiquettes, configEtiquette);
      alert(`Lot de ${quantiteLot} étiquettes généré avec succès !`);
    } catch (error) {
      console.error('Erreur génération lot:', error);
      alert('Erreur lors de la génération du lot');
    } finally {
      setGenerating(false);
    }
  };

  const exporterDonnees = async (format: 'json' | 'csv') => {
    try {
      if (format === 'json') {
        const data = await exporterDonneesLocales();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cookie_pricing_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Export JSON réussi !');
      } else if (format === 'csv') {
        // Exporter les formats de vente en CSV
        let csv = 'Nom,Recette,Quantité,Prix,Coût,Marge\n';
        formats.forEach((f) => {
          csv += `"${f.nom}","${f.type_cookie_nom}",${f.quantite_cookies},${(f.prix_vente_pratique ?? f.prix_vente_recommande)},${f.cout_total_revient},${f.marge_reelle_pourcentage}%\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `formats_vente_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Export CSV réussi !');
      }
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const importerDonnees = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          await importerDonneesLocales(text);
          alert('Import réussi !');
          window.location.reload();
        } catch (error) {
          console.error('Erreur import:', error);
          alert('Erreur lors de l\'import');
        }
      }
    };
    input.click();
  };

  const synchroniser = async () => {
    try {
      const result = await synchroniserModifications();
      alert(
        `Synchronisation terminée !\nRéussies: ${result.succes}\nÉchouées: ${result.echecs}`
      );
      await chargerSyncStatus();
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      alert('Erreur lors de la synchronisation');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Exports & Étiquettes
        </h1>
        <p className="text-slate-400">
          Générez des étiquettes PDF, codes-barres, QR codes et exportez vos
          données
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('etiquettes')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'etiquettes'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Printer className="w-5 h-5" />
          Étiquettes & Codes
        </button>
        <button
          onClick={() => setActiveTab('exports')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'exports'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Download className="w-5 h-5" />
          Exports de Données
        </button>
        <button
          onClick={() => setActiveTab('offline')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'offline'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          {syncStatus?.mode_hors_ligne ? (
            <WifiOff className="w-5 h-5" />
          ) : (
            <Wifi className="w-5 h-5" />
          )}
          Mode Hors-ligne
        </button>
      </div>

      {/* Onglet Étiquettes */}
      {activeTab === 'etiquettes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Configuration de l'Étiquette
            </h2>

            {/* Type d'étiquette */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type d'étiquette
              </label>
              <select
                value={configEtiquette.type}
                onChange={(e) =>
                  setConfigEtiquette({
                    ...configEtiquette,
                    type: e.target.value as TypeEtiquette,
                  })
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="prix">Prix simple</option>
                <option value="ingredients">Avec ingrédients</option>
                <option value="production">Production & lot</option>
                <option value="inventaire">Inventaire</option>
                <option value="complete">Complète</option>
              </select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Largeur (mm)
                </label>
                <input
                  type="number"
                  value={configEtiquette.largeur_mm}
                  onChange={(e) =>
                    setConfigEtiquette({
                      ...configEtiquette,
                      largeur_mm: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hauteur (mm)
                </label>
                <input
                  type="number"
                  value={configEtiquette.hauteur_mm}
                  onChange={(e) =>
                    setConfigEtiquette({
                      ...configEtiquette,
                      hauteur_mm: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            {/* Format code-barres */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Format de code
              </label>
              <select
                value={configEtiquette.format_code_barre}
                onChange={(e) =>
                  setConfigEtiquette({
                    ...configEtiquette,
                    format_code_barre: e.target.value as FormatCodeBarre,
                  })
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="EAN13">EAN-13 (Standard)</option>
                <option value="CODE128">CODE128 (Alphanumérique)</option>
                <option value="QR">QR Code</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={configEtiquette.inclure_code_barre}
                  onChange={(e) =>
                    setConfigEtiquette({
                      ...configEtiquette,
                      inclure_code_barre: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                Inclure code-barres
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={configEtiquette.inclure_qr_code}
                  onChange={(e) =>
                    setConfigEtiquette({
                      ...configEtiquette,
                      inclure_qr_code: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                Inclure QR code
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={configEtiquette.afficher_prix}
                  onChange={(e) =>
                    setConfigEtiquette({
                      ...configEtiquette,
                      afficher_prix: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                Afficher prix
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={configEtiquette.afficher_ingredients}
                  onChange={(e) =>
                    setConfigEtiquette({
                      ...configEtiquette,
                      afficher_ingredients: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                Afficher ingrédients
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={configEtiquette.afficher_allergenes}
                  onChange={(e) =>
                    setConfigEtiquette({
                      ...configEtiquette,
                      afficher_allergenes: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                Afficher allergènes
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={configEtiquette.afficher_date_peremption}
                  onChange={(e) =>
                    setConfigEtiquette({
                      ...configEtiquette,
                      afficher_date_peremption: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                Afficher date de péremption
              </label>
            </div>

            {/* Jours avant péremption */}
            {configEtiquette.afficher_date_peremption && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Jours avant péremption
                </label>
                <input
                  type="number"
                  value={configEtiquette.jours_avant_peremption}
                  onChange={(e) =>
                    setConfigEtiquette({
                      ...configEtiquette,
                      jours_avant_peremption: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            )}

            {/* Sélection du format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Format de vente
              </label>
              <select
                value={formatSelectionne}
                onChange={(e) => setFormatSelectionne(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="">-- Choisir un format --</option>
                {formats.map((format) => (
                  <option key={format.id} value={format.id}>
                    {format.nom} - {(format.prix_vente_pratique ?? format.prix_vente_recommande ?? 0).toFixed(2)} €
                  </option>
                ))}
              </select>
            </div>

            {/* Boutons génération */}
            <div className="space-y-2">
              <button
                onClick={genererEtiquette}
                disabled={!formatSelectionne || generating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                {generating
                  ? 'Génération...'
                  : 'Générer Étiquette (PDF)'}
              </button>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={quantiteLot}
                  onChange={(e) => setQuantiteLot(Number(e.target.value))}
                  min="1"
                  className="col-span-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Qté"
                />
                <button
                  onClick={genererLot}
                  disabled={!formatSelectionne || generating}
                  className="col-span-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Générer Lot
                </button>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Aperçu des Codes
            </h2>

            {/* QR Code */}
            {qrPreview && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Code
                </h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrPreview} alt="QR Code" className="w-32 h-32" />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Scannez ce code pour voir les informations du produit
                </p>
              </div>
            )}

            {/* Code-barres */}
            {barcodePreview && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Barcode className="w-4 h-4" />
                  Code-barres ({configEtiquette.format_code_barre})
                </h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img
                    src={barcodePreview}
                    alt="Code-barres"
                    className="h-16"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Code-barres unique pour identification produit
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">
                ℹ️ Formats d'étiquettes
              </h3>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>
                  • <strong>Prix simple</strong> : Nom et prix uniquement
                </li>
                <li>
                  • <strong>Avec ingrédients</strong> : + liste des ingrédients
                </li>
                <li>
                  • <strong>Production</strong> : + dates et numéro de lot
                </li>
                <li>
                  • <strong>Inventaire</strong> : Pour gestion de stock
                </li>
                <li>
                  • <strong>Complète</strong> : Toutes les informations
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Exports */}
      {activeTab === 'exports' && (
        <div className="max-w-2xl">
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Exporter les Données
            </h2>

            <div className="space-y-4">
              {/* Export JSON */}
              <div className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white">
                      Export complet (JSON)
                    </h3>
                    <p className="text-sm text-slate-400">
                      Sauvegarde complète de toutes vos données
                    </p>
                  </div>
                  <button
                    onClick={() => exporterDonnees('json')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    JSON
                  </button>
                </div>
              </div>

              {/* Export CSV */}
              <div className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white">
                      Export formats (CSV)
                    </h3>
                    <p className="text-sm text-slate-400">
                      Formats de vente avec prix et coûts
                    </p>
                  </div>
                  <button
                    onClick={() => exporterDonnees('csv')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>

              {/* Import */}
              <div className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white">
                      Importer des données
                    </h3>
                    <p className="text-sm text-slate-400">
                      Restaurer une sauvegarde JSON
                    </p>
                  </div>
                  <button
                    onClick={importerDonnees}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Importer
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">
                ⚠️ Attention
              </h3>
              <p className="text-xs text-slate-300">
                L'import écrasera toutes vos données actuelles. Pensez à faire
                une sauvegarde avant d'importer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Mode Hors-ligne */}
      {activeTab === 'offline' && (
        <div className="max-w-2xl">
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {syncStatus?.mode_hors_ligne ? (
                <WifiOff className="w-6 h-6 text-orange-400" />
              ) : (
                <Wifi className="w-6 h-6 text-green-400" />
              )}
              Mode Hors-ligne
            </h2>

            {/* Statut de connexion */}
            <div className="mb-6">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  syncStatus?.mode_hors_ligne
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    syncStatus?.mode_hors_ligne
                      ? 'bg-orange-400'
                      : 'bg-green-400'
                  }`}
                />
                {syncStatus?.mode_hors_ligne ? 'Hors ligne' : 'En ligne'}
              </div>
            </div>

            {/* Stats de sync */}
            {syncStatus && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">
                    Dernière synchronisation
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {syncStatus.derniere_sync
                      ? new Date(
                          syncStatus.derniere_sync
                        ).toLocaleString('fr-FR')
                      : 'Jamais'}
                  </p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">
                    Modifications en attente
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {syncStatus.donnees_en_attente}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={synchroniser}
                disabled={
                  syncStatus?.mode_hors_ligne ||
                  syncStatus?.donnees_en_attente === 0
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Synchroniser maintenant
              </button>

              <button
                onClick={() => exporterDonnees('json')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Créer une sauvegarde locale
              </button>
            </div>

            {/* Info mode hors-ligne */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">
                ℹ️ Mode Hors-ligne
              </h3>
              <p className="text-xs text-slate-300 mb-2">
                Le mode hors-ligne vous permet de continuer à utiliser
                l'application sans connexion internet.
              </p>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>
                  • Vos modifications sont enregistrées localement
                </li>
                <li>
                  • Elles seront synchronisées automatiquement au retour de la
                  connexion
                </li>
                <li>
                  • Pensez à faire des sauvegardes régulières
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
