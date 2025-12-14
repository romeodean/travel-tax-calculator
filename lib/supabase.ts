import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey &&
         supabaseUrl !== '' && supabaseAnonKey !== '';
};

// Create Supabase client (will be null if not configured)
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface TravelEntryDB {
  id: string;
  user_id: string;
  departure_country: string;
  arrival_country: string;
  departure_date: string;
  arrival_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CountryRuleDB {
  id?: string;
  user_id: string;
  country_code: string;
  name: string;
  threshold: number;
  calendar_type: 'calendar-year' | 'rolling-12-month';
  description: string;
  is_custom: boolean;
  created_at?: string;
  updated_at?: string;
}
