/**
 * UTILITAIRES POUR MODE HORS-LIGNE
 * Gestion de la synchronisation et du cache des données
 */

import type { ModificationHorsLigne, SyncStatus } from '../types';

const DB_NAME = 'CookiePricingDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_queue';
const CACHE_NAME = 'cookie-pricing-v1';

/**
 * Initialiser IndexedDB pour le stockage hors-ligne
 */
export async function initialiserIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Créer le store pour les modifications en attente
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('entity', 'entity', { unique: false });
      }
    };
  });
}

/**
 * Ajouter une modification à la file d'attente hors-ligne
 */
export async function ajouterModificationHorsLigne(
  modification: Omit<ModificationHorsLigne, 'id' | 'timestamp'>
): Promise<void> {
  const db = await initialiserIndexedDB();

  const modifComplete: ModificationHorsLigne = {
    ...modification,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    timestamp: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(modifComplete);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupérer toutes les modifications en attente
 */
export async function getModificationsEnAttente(): Promise<
  ModificationHorsLigne[]
> {
  const db = await initialiserIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Supprimer une modification après synchronisation
 */
export async function supprimerModification(id: string): Promise<void> {
  const db = await initialiserIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Vider toutes les modifications en attente
 */
export async function viderFileAttente(): Promise<void> {
  const db = await initialiserIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Vérifier le statut de connexion
 */
export function estEnLigne(): boolean {
  return navigator.onLine;
}

/**
 * Obtenir le statut de synchronisation
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  const modifications = await getModificationsEnAttente();
  const derniereSync = localStorage.getItem('derniere_sync');

  return {
    derniere_sync: derniereSync ? new Date(derniereSync) : null,
    sync_en_cours: false,
    mode_hors_ligne: !estEnLigne(),
    donnees_en_attente: modifications.length,
  };
}

/**
 * Marquer la dernière synchronisation
 */
export function marquerDerniereSync(): void {
  localStorage.setItem('derniere_sync', new Date().toISOString());
}

/**
 * Synchroniser les modifications hors-ligne
 * (Cette fonction serait connectée à un backend dans une vraie application)
 */
export async function synchroniserModifications(): Promise<{
  succes: number;
  echecs: number;
}> {
  if (!estEnLigne()) {
    throw new Error('Aucune connexion internet disponible');
  }

  const modifications = await getModificationsEnAttente();
  let succes = 0;
  let echecs = 0;

  for (const modif of modifications) {
    try {
      // Dans une vraie application, on enverrait la modification au serveur
      // Pour le moment, on simule juste la synchronisation locale
      console.log('Synchronisation:', modif);

      // Appliquer la modification au store Zustand
      // (ce code serait adapté selon votre architecture)

      await supprimerModification(modif.id);
      succes++;
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      echecs++;
    }
  }

  if (succes > 0) {
    marquerDerniereSync();
  }

  return { succes, echecs };
}

/**
 * Exporter toutes les données pour sauvegarde
 */
export async function exporterDonneesLocales(): Promise<string> {
  // Cette fonction exporterait toutes les données du store Zustand
  // Pour l'instant, on retourne un JSON vide
  const data = {
    version: '1.0.0',
    date_export: new Date().toISOString(),
    donnees: {
      // Les données seraient récupérées du store Zustand
    },
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Importer des données depuis une sauvegarde
 */
export async function importerDonneesLocales(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);

    // Valider la structure des données
    if (!data.version || !data.donnees) {
      throw new Error('Format de données invalide');
    }

    // Dans une vraie application, on restaurerait les données dans le store
    console.log('Import des données:', data);

    // Marquer comme synchronisé
    marquerDerniereSync();
  } catch (error) {
    console.error('Erreur import données:', error);
    throw error;
  }
}

/**
 * Enregistrer le Service Worker pour le mode hors-ligne
 */
export async function enregistrerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/sw.js',
        { scope: '/' }
      );
      console.log('Service Worker enregistré:', registration.scope);
    } catch (error) {
      console.error('Erreur enregistrement Service Worker:', error);
    }
  }
}

/**
 * Mettre en cache les ressources essentielles
 */
export async function cacherRessources(urls: string[]): Promise<void> {
  if ('caches' in window) {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
  }
}

/**
 * Vider le cache
 */
export async function viderCache(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((name) => caches.delete(name))
    );
  }
}
