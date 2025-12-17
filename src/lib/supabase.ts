/**
 * SUPABASE CLIENT CONFIGURATION
 * Configuration du client Supabase pour la synchronisation des données
 */

import { createClient } from '@supabase/supabase-js';

// Configuration avec variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Créer le client Supabase seulement si les credentials sont fournis
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Vérifier si Supabase est configuré
export const isSupabaseConfigured = !!supabase;

// Type pour la base de données
export interface Database {
  public: {
    Tables: {
      user_data: {
        Row: {
          id: string;
          user_id: string;
          data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          data: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
