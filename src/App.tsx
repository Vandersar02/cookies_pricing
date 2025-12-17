import { useStore } from "@/store";
import { useState } from "react";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Cookie,
  Warehouse,
  Menu,
  X,
  Receipt,
  Calculator,
  Factory,
  FileText,
} from "lucide-react";
import Dashboard from "@/pages/Dashboard";
import Ingredients from "@/pages/Ingredients";
import Recettes from "@/pages/Recettes";
import Emballages from "@/pages/Emballages";
import Charges from "@/pages/Charges";
import FormatsVente from "@/pages/FormatsVente";
import Analyses from "@/pages/Analyses";
import Stocks from "@/pages/Stocks";
import Achats from "@/pages/Achats";
import ComparateurMarges from "@/pages/ComparateurMarges";
import Optimisations from "@/pages/Optimisations";
import Production from "@/pages/Production";
import PricingPromotions from "@/pages/PricingPromotions";
import ExportsLabels from "@/pages/ExportsLabels";
import SyncStatus from "@/components/SyncStatus";

function App() {
  const { pageActive, changerPage, alertes } = useStore();
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  const navigation = [
    { id: "dashboard", nom: "Tableau de bord", icon: TrendingUp },
    { id: "ingredients", nom: "Ingrédients", icon: Package },
    { id: "recettes", nom: "Recettes", icon: Cookie },
    { id: "emballages", nom: "Emballages", icon: Package },
    { id: "stocks", nom: "Stocks", icon: Warehouse },
    { id: "achats", nom: "Achats", icon: Receipt },
    { id: "charges", nom: "Charges & Pertes", icon: DollarSign },
    { id: "production", nom: "Production", icon: Factory },
    { id: "formats", nom: "Formats de Vente", icon: ShoppingCart },
    { id: "pricing", nom: "Pricing & Promos", icon: DollarSign },
    { id: "comparateur", nom: "Comparateur Marges", icon: Calculator },
    { id: "optimisations", nom: "Optimisations", icon: TrendingUp },
    { id: "exports", nom: "Exports & Labels", icon: FileText },
    { id: "analyses", nom: "Analyses", icon: TrendingUp },
  ];

  const renderPage = () => {
    switch (pageActive) {
      case "dashboard":
        return <Dashboard />;
      case "ingredients":
        return <Ingredients />;
      case "recettes":
        return <Recettes />;
      case "emballages":
        return <Emballages />;
      case "stocks":
        return <Stocks />;
      case "achats":
        return <Achats />;
      case "charges":
        return <Charges />;
      case "production":
        return <Production />;
      case "formats":
        return <FormatsVente />;
      case "pricing":
        return <PricingPromotions />;
      case "comparateur":
        return <ComparateurMarges />;
      case "optimisations":
        return <Optimisations />;
      case "exports":
        return <ExportsLabels />;
      case "analyses":
        return <Analyses />;
      default:
        return <Dashboard />;
    }
  };

  const alertesDanger = alertes.filter(
    (a) => a.severite === "danger" && !a.resolu
  ).length;
  const alertesWarning = alertes.filter(
    (a) => a.severite === "warning" && !a.resolu
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuMobileOuvert(!menuMobileOuvert)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-800 rounded-lg shadow-lg border border-slate-700 touch-target"
        aria-label={menuMobileOuvert ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {menuMobileOuvert ? (
          <X className="w-6 h-6 text-slate-100" />
        ) : (
          <Menu className="w-6 h-6 text-slate-100" />
        )}
      </button>

      {/* Overlay Mobile */}
      {menuMobileOuvert && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMenuMobileOuvert(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        w-64 sm:w-72 bg-slate-900 border-r border-slate-700 flex flex-col
        fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${
          menuMobileOuvert
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        <div className="p-4 sm:p-6 border-b border-slate-700">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <img
                src="/cookies.png"
                alt="Logo"
                className="w-8 h-8 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-100 truncate">Tamy Cookies</h1>
                <p className="text-xs text-slate-400">Calcul des coûts</p>
              </div>
            </div>
          </div>
          <SyncStatus />
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Section: Vue d'ensemble */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Vue d'ensemble
              </h3>
              <ul className="space-y-1">
                {navigation.slice(0, 1).map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          changerPage(item.id);
                          setMenuMobileOuvert(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base touch-target ${
                          pageActive === item.id
                            ? "bg-primary-700 text-primary-100 font-medium"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.nom}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Section: Gestion */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Gestion
              </h3>
              <ul className="space-y-1">
                {navigation.slice(1, 6).map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          changerPage(item.id);
                          setMenuMobileOuvert(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base touch-target ${
                          pageActive === item.id
                            ? "bg-primary-700 text-primary-100 font-medium"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.nom}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Section: Production & Vente */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Production & Vente
              </h3>
              <ul className="space-y-1">
                {navigation.slice(6, 10).map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          changerPage(item.id);
                          setMenuMobileOuvert(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base touch-target ${
                          pageActive === item.id
                            ? "bg-primary-700 text-primary-100 font-medium"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.nom}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Section: Analyses & Outils */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Analyses & Outils
              </h3>
              <ul className="space-y-1">
                {navigation.slice(10).map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          changerPage(item.id);
                          setMenuMobileOuvert(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base touch-target ${
                          pageActive === item.id
                            ? "bg-primary-700 text-primary-100 font-medium"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.nom}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* Alertes */}
        {(alertesDanger > 0 || alertesWarning > 0) && (
          <div className="p-4 border-t border-slate-700">
            <div className="bg-red-900 border border-red-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  {alertesDanger > 0 && (
                    <p className="text-sm font-medium text-red-100">
                      {alertesDanger} alerte{alertesDanger > 1 ? "s" : ""}{" "}
                      critique{alertesDanger > 1 ? "s" : ""}
                    </p>
                  )}
                  {alertesWarning > 0 && (
                    <p className="text-xs text-red-200">
                      {alertesWarning} avertissement
                      {alertesWarning > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            Version 1.0.0 • Made with ❤️
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full lg:w-auto pt-14 sm:pt-16 lg:pt-0">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
