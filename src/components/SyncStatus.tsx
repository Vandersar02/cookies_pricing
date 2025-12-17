/**
 * INDICATEUR DE STATUT DE SYNCHRONISATION
 * Affiche l'état de la synchronisation avec Supabase
 */

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, Loader2, User, LogOut, RefreshCw, Database } from 'lucide-react';
import { databaseService, SyncStatus as SyncStatusType } from '@/lib/database-service';
import { forceSyncToCloud, loadFromCloud } from '@/lib/storage';
import AuthModal from './AuthModal';

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>(databaseService.getSyncStatus());
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // S'abonner aux changements de statut
    const unsubscribe = databaseService.onSyncStatusChange(setSyncStatus);

    // Charger l'utilisateur actuel
    loadCurrentUser();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadCurrentUser = async () => {
    const currentUser = await databaseService.getCurrentUser();
    setUser(currentUser);
  };

  const handleSignOut = async () => {
    await databaseService.signOut();
    setUser(null);
    setShowMenu(false);
  };

  const handleForceSync = async () => {
    setSyncing(true);
    await forceSyncToCloud();
    setSyncing(false);
    setShowMenu(false);
  };

  const handleLoadFromCloud = async () => {
    setSyncing(true);
    await loadFromCloud();
    setSyncing(false);
    setShowMenu(false);
  };

  const handleAuthSuccess = () => {
    loadCurrentUser();
  };

  // Si Supabase n'est pas configuré, ne rien afficher
  if (!databaseService.isConfigured()) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          {user ? (
            <>
              {syncStatus.isSyncing || syncing ? (
                <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
              ) : syncStatus.isOnline ? (
                <Cloud className="w-4 h-4 text-green-400" />
              ) : (
                <CloudOff className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm text-slate-300">
                {user.email?.split('@')[0]}
              </span>
            </>
          ) : (
            <>
              <Database className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Local uniquement</span>
            </>
          )}
        </button>

        {/* Menu déroulant */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
            {user ? (
              <>
                {/* Utilisateur connecté */}
                <div className="p-3 border-b border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-medium text-slate-100">
                      {user.email}
                    </span>
                  </div>
                  {syncStatus.lastSync && (
                    <p className="text-xs text-slate-400">
                      Dernière sync: {new Date(syncStatus.lastSync).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-2 space-y-1">
                  <button
                    onClick={handleForceSync}
                    disabled={syncing}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    Synchroniser maintenant
                  </button>

                  <button
                    onClick={handleLoadFromCloud}
                    disabled={syncing}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                  >
                    <Cloud className="w-4 h-4" />
                    Charger depuis le cloud
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>

                {/* Statut */}
                {syncStatus.error && (
                  <div className="p-3 border-t border-slate-700">
                    <p className="text-xs text-red-400">{syncStatus.error}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Utilisateur non connecté */}
                <div className="p-3">
                  <p className="text-sm text-slate-300 mb-3">
                    Connectez-vous pour synchroniser vos données entre vos appareils
                  </p>
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Se connecter
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal d'authentification */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
