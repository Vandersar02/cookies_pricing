/**
 * CUSTOM STORAGE - HYBRID LOCALSTORAGE + SUPABASE
 * Permet de sauvegarder localement ET en ligne pour synchronisation multi-appareils
 */

import { PersistStorage } from 'zustand/middleware';
import { databaseService } from './database-service';

// Clé pour le localStorage
const STORAGE_KEY = 'cookie-pricing-storage';

// Debounce pour limiter les sauvegardes en ligne
let saveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 2000; // 2 secondes

/**
 * Storage hybride: localStorage + Supabase
 * - Sauvegarde immédiate en localStorage (rapide)
 * - Sauvegarde différée sur Supabase (sync multi-appareils)
 */
export const hybridStorage: PersistStorage<Record<string, unknown>> = {
  /**
   * Récupérer les données
   * Priorité: Supabase si connecté, sinon localStorage
   */
  getItem: async (name: string): Promise<Record<string, unknown> | null> => {
    try {
      // Toujours charger depuis localStorage en premier (rapide)
      const localData = localStorage.getItem(name);
      
      // Si Supabase est configuré et qu'on a un utilisateur
      if (databaseService.isConfigured()) {
        const user = await databaseService.getCurrentUser();
        
        if (user) {
          // Charger depuis Supabase
          const cloudData = await databaseService.loadData(user.id);
          
          if (cloudData) {
            // Comparer les dates pour prendre la plus récente
            const localState = localData ? JSON.parse(localData) : null;
            const cloudState = cloudData;
            
            // Si les données cloud sont plus récentes ou si pas de données locales
            if (!localState || shouldUseCloudData(localState, cloudState)) {
              // Sauvegarder en local pour accès rapide
              localStorage.setItem(name, JSON.stringify(cloudData));
              return cloudData; // Retourner l'objet parsé directement
            }
          }
        }
      }
      
      // Retourner les données locales parsées
      return localData ? JSON.parse(localData) : null;
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, utiliser localStorage
      const localData = localStorage.getItem(name);
      return localData ? JSON.parse(localData) : null;
    }
  },

  /**
   * Sauvegarder les données
   * - Immédiat en localStorage
   * - Différé sur Supabase (debounced)
   */
  setItem: async (name: string, value: Record<string, unknown>): Promise<void> => {
    try {
      // 1. Sauvegarde immédiate en localStorage
      localStorage.setItem(name, JSON.stringify(value));
      
      // 2. Sauvegarde différée sur Supabase si configuré
      if (databaseService.isConfigured()) {
        // Annuler le timeout précédent
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        
        // Programmer une sauvegarde
        saveTimeout = setTimeout(async () => {
          try {
            const user = await databaseService.getCurrentUser();
            if (user) {
              await databaseService.saveData(user.id, value);
            }
          } catch (error) {
            console.error('Erreur lors de la sauvegarde cloud:', error);
          }
        }, SAVE_DEBOUNCE_MS);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  },

  /**
   * Supprimer les données
   */
  removeItem: async (name: string): Promise<void> => {
    try {
      localStorage.removeItem(name);
      
      // TODO: Supprimer aussi de Supabase si nécessaire
    } catch (error) {
      console.error('Erreur lors de la suppression des données:', error);
    }
  },
};

/**
 * Déterminer si on doit utiliser les données cloud
 * Basé sur la date de dernière modification
 */
function shouldUseCloudData(localState: Record<string, unknown>, cloudState: Record<string, unknown>): boolean {
  try {
    // Chercher la date de dernière modification dans les données
    const localDates = extractModificationDates(localState);
    const cloudDates = extractModificationDates(cloudState);
    
    if (localDates.length === 0) return true; // Pas de données locales
    if (cloudDates.length === 0) return false; // Pas de données cloud
    
    // Prendre la date la plus récente de chaque côté
    const localLatest = Math.max(...localDates);
    const cloudLatest = Math.max(...cloudDates);
    
    return cloudLatest > localLatest;
  } catch (error) {
    console.error('Erreur lors de la comparaison des dates:', error);
    return false; // En cas d'erreur, garder les données locales
  }
}

/**
 * Extraire toutes les dates de modification des entités
 */
function extractModificationDates(state: Record<string, unknown>): number[] {
  const dates: number[] = [];
  
  try {
    // Parcourir toutes les collections qui ont des dates
    const collections = [
      'ingredients',
      'recettes',
      'emballages',
      'charges',
      'pertes',
      'formatsVente',
      'achats',
      'productions',
      'planifications',
    ];
    
    for (const collection of collections) {
      const stateObj = state.state as Record<string, unknown>;
      if (stateObj?.[collection]) {
        const items = stateObj[collection];
        if (Array.isArray(items)) {
          items.forEach((item: unknown) => {
            const itemObj = item as Record<string, unknown>;
            if (itemObj.derniere_modification) {
              dates.push(new Date(itemObj.derniere_modification as string).getTime());
            } else if (itemObj.date_creation) {
              dates.push(new Date(itemObj.date_creation as string).getTime());
            } else if (itemObj.date_production) {
              dates.push(new Date(itemObj.date_production as string).getTime());
            } else if (itemObj.date_achat) {
              dates.push(new Date(itemObj.date_achat as string).getTime());
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'extraction des dates:', error);
  }
  
  return dates;
}

/**
 * Forcer une synchronisation immédiate avec Supabase
 */
export async function forceSyncToCloud(): Promise<boolean> {
  try {
    if (!databaseService.isConfigured()) {
      console.warn('Supabase non configuré');
      return false;
    }
    
    const user = await databaseService.getCurrentUser();
    if (!user) {
      console.warn('Aucun utilisateur connecté');
      return false;
    }
    
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) {
      console.warn('Aucune donnée locale à synchroniser');
      return false;
    }
    
    const data = JSON.parse(localData);
    const success = await databaseService.saveData(user.id, data);
    
    return success;
  } catch (error) {
    console.error('Erreur lors de la synchronisation forcée:', error);
    return false;
  }
}

/**
 * Charger les données depuis Supabase
 */
export async function loadFromCloud(): Promise<boolean> {
  try {
    if (!databaseService.isConfigured()) {
      console.warn('Supabase non configuré');
      return false;
    }
    
    const user = await databaseService.getCurrentUser();
    if (!user) {
      console.warn('Aucun utilisateur connecté');
      return false;
    }
    
    const cloudData = await databaseService.loadData(user.id);
    if (!cloudData) {
      console.warn('Aucune donnée cloud trouvée');
      return false;
    }
    
    // Sauvegarder en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
    
    // Recharger la page pour appliquer les changements
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Erreur lors du chargement depuis le cloud:', error);
    return false;
  }
}
