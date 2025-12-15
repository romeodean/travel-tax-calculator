import { supabase, isSupabaseConfigured } from './supabase';

export interface User {
  id: string;
  email: string;
}

// Check if user is logged in
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        id: user.id,
        email: user.email || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

// Sign up with email and password
export async function signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email || ''
        },
        error: null
      };
    }

    return { user: null, error: 'Sign up failed' };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email || ''
        },
        error: null
      };
    }

    return { user: null, error: 'Sign in failed' };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// Sign out
export async function signOut(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Migrate existing localStorage data to user account
export async function migrateLocalDataToUser(userId: string): Promise<void> {
  const localEntries = localStorage.getItem('travelEntries');
  const localCountries = localStorage.getItem('countryRules');

  if (localEntries || localCountries) {
    // Mark that we have local data to migrate
    localStorage.setItem('hasLocalDataToMigrate', 'true');
  }
}

// Check if there's local data to migrate
export function hasLocalDataToMigrate(): boolean {
  const entries = localStorage.getItem('travelEntries');
  const deviceId = localStorage.getItem('deviceId');

  // Has data if there are entries OR if there's a deviceId (meaning they used the app before)
  return !!(entries && JSON.parse(entries).length > 0) || !!deviceId;
}
