/**
 * DATABASE SERVICE
 * Service de synchronisation des données avec Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  error: string | null;
}

class DatabaseService {
  private syncStatus: SyncStatus = {
    isOnline: false,
    lastSync: null,
    isSyncing: false,
    error: null,
  };

  private syncListeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    if (isSupabaseConfigured && supabase) {
      this.checkConnection();
    }
  }

  /**
   * Vérifier la connexion à Supabase
   */
  async checkConnection(): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      this.updateSyncStatus({ isOnline: false, error: 'Supabase non configuré' });
      return false;
    }

    try {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      
      this.updateSyncStatus({ 
        isOnline: true, 
        error: null 
      });
      return true;
    } catch (error) {
      this.updateSyncStatus({ 
        isOnline: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      });
      return false;
    }
  }

  /**
   * Sauvegarder les données dans Supabase
   */
  async saveData(userId: string, data: Record<string, unknown>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase non configuré, utilisation du localStorage uniquement');
      return false;
    }

    this.updateSyncStatus({ isSyncing: true });

    try {
      // Vérifier si des données existent déjà pour cet utilisateur
      const { data: existing } = await supabase
        .from('user_data')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Mettre à jour les données existantes
        const { error } = await supabase
          .from('user_data')
          .update({ 
            data, 
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insérer de nouvelles données
        const { error } = await supabase
          .from('user_data')
          .insert({ 
            user_id: userId, 
            data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      this.updateSyncStatus({ 
        isSyncing: false, 
        lastSync: new Date(),
        error: null 
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.updateSyncStatus({ 
        isSyncing: false, 
        error: error instanceof Error ? error.message : 'Erreur de sauvegarde' 
      });
      return false;
    }
  }

  /**
   * Charger les données depuis Supabase
   */
  async loadData(userId: string): Promise<Record<string, unknown> | null> {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase non configuré, utilisation du localStorage uniquement');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data, updated_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Pas de données trouvées, c'est normal pour un nouvel utilisateur
          return null;
        }
        throw error;
      }

      if (data) {
        this.updateSyncStatus({ 
          lastSync: new Date(data.updated_at),
          error: null 
        });
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      this.updateSyncStatus({ 
        error: error instanceof Error ? error.message : 'Erreur de chargement' 
      });
      return null;
    }
  }

  /**
   * S'authentifier avec Supabase (email/password)
   */
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase non configuré' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.updateSyncStatus({ isOnline: true, error: null });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  }

  /**
   * S'inscrire avec Supabase
   */
  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase non configuré' };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur d\'inscription' 
      };
    }
  }

  /**
   * Se déconnecter
   */
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.auth.signOut();
      this.updateSyncStatus({ isOnline: false, error: null });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Obtenir le statut de synchronisation
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * S'abonner aux changements de statut
   */
  onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(callback);
    // Retourner une fonction pour se désabonner
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Mettre à jour le statut de synchronisation
   */
  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.syncListeners.forEach(callback => callback(this.syncStatus));
  }

  /**
   * Vérifier si la base de données est configurée
   */
  isConfigured(): boolean {
    return isSupabaseConfigured;
  }
}

// Exporter une instance unique (singleton)
export const databaseService = new DatabaseService();
