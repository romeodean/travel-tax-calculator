import { supabase, isSupabaseConfigured, TravelEntryDB, CountryRuleDB } from './supabase';
import { TravelEntry, CountryRule } from './types';
import { getCurrentUser } from './auth';

// Sync status types
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'paused';

// Pending sync queue stored in localStorage
const PENDING_SYNC_KEY = 'pendingSyncQueue';

interface PendingSyncItem {
  type: 'entries' | 'countries';
  data: TravelEntry[] | Record<string, CountryRule>;
  timestamp: number;
  retryCount: number;
}

// Check if we're online
export const isOnline = (): boolean => {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
};

// Check if Supabase is reachable (project might be paused)
export const checkSupabaseHealth = async (): Promise<{ healthy: boolean; error?: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { healthy: false, error: 'Supabase not configured' };
  }

  if (!isOnline()) {
    return { healthy: false, error: 'No internet connection' };
  }

  try {
    // Try a simple query to check if Supabase is reachable
    const { error } = await supabase.from('travel_entries').select('id').limit(1);

    if (error) {
      // Check for common Supabase pause/inactive errors
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('project') && (errorMessage.includes('paused') || errorMessage.includes('inactive'))) {
        return { healthy: false, error: 'Supabase project is paused due to inactivity. Please reactivate it in your Supabase dashboard.' };
      }
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return { healthy: false, error: 'Cannot reach Supabase servers. Check your internet connection.' };
      }
      // Auth errors are OK - the database is reachable
      if (error.code === 'PGRST301' || errorMessage.includes('jwt')) {
        return { healthy: true };
      }
      return { healthy: false, error: error.message };
    }

    return { healthy: true };
  } catch (e: any) {
    return { healthy: false, error: e.message || 'Unknown error checking Supabase health' };
  }
};

// Get user ID (either from auth or fallback to deviceId for backwards compatibility)
const getUserId = async (): Promise<string> => {
  if (typeof window === 'undefined') return 'server';

  // Try to get authenticated user first
  const user = await getCurrentUser();
  if (user) {
    return user.id;
  }

  // Fallback to deviceId for anonymous users (backwards compatibility)
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Save pending sync items for later retry
const savePendingSync = (item: PendingSyncItem): void => {
  if (typeof window === 'undefined') return;

  try {
    const existing = localStorage.getItem(PENDING_SYNC_KEY);
    const queue: PendingSyncItem[] = existing ? JSON.parse(existing) : [];

    // Replace existing item of same type or add new
    const index = queue.findIndex(i => i.type === item.type);
    if (index >= 0) {
      queue[index] = item;
    } else {
      queue.push(item);
    }

    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
    console.log(`📦 Saved pending ${item.type} sync for later`);
  } catch (e) {
    console.error('Failed to save pending sync:', e);
  }
};

// Get pending sync items
export const getPendingSyncItems = (): PendingSyncItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const existing = localStorage.getItem(PENDING_SYNC_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    return [];
  }
};

// Clear pending sync items
const clearPendingSync = (type?: 'entries' | 'countries'): void => {
  if (typeof window === 'undefined') return;

  try {
    if (type) {
      const existing = localStorage.getItem(PENDING_SYNC_KEY);
      if (existing) {
        const queue: PendingSyncItem[] = JSON.parse(existing);
        const filtered = queue.filter(i => i.type !== type);
        localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
      }
    } else {
      localStorage.removeItem(PENDING_SYNC_KEY);
    }
  } catch (e) {
    console.error('Failed to clear pending sync:', e);
  }
};

// Check if there are pending syncs
export const hasPendingSyncs = (): boolean => {
  return getPendingSyncItems().length > 0;
};

// Convert app types to DB types
const entryToDB = async (entry: TravelEntry): Promise<TravelEntryDB> => ({
  id: entry.id,
  user_id: await getUserId(),
  departure_country: entry.departureCountry,
  arrival_country: entry.arrivalCountry,
  departure_date: entry.departureDate,
  arrival_date: entry.arrivalDate,
});

const entryFromDB = (dbEntry: TravelEntryDB): TravelEntry => ({
  id: dbEntry.id,
  departureCountry: dbEntry.departure_country,
  arrivalCountry: dbEntry.arrival_country,
  departureDate: dbEntry.departure_date,
  arrivalDate: dbEntry.arrival_date,
});

const countryToDB = async (code: string, rule: CountryRule): Promise<CountryRuleDB> => ({
  user_id: await getUserId(),
  country_code: code,
  name: rule.name,
  threshold: rule.threshold,
  calendar_type: rule.calendarType,
  description: rule.description,
  is_custom: rule.isCustom || false,
});

const countryFromDB = (dbRule: CountryRuleDB): { code: string; rule: CountryRule } => ({
  code: dbRule.country_code,
  rule: {
    code: dbRule.country_code,
    name: dbRule.name,
    threshold: dbRule.threshold,
    calendarType: dbRule.calendar_type,
    description: dbRule.description,
    isCustom: dbRule.is_custom,
  },
});

// Sync functions
export const syncTravelEntries = {
  async save(entries: TravelEntry[]): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, using localStorage only');
      return { success: true };
    }

    if (!isOnline()) {
      console.log('📴 Offline - queuing sync for later');
      savePendingSync({ type: 'entries', data: entries, timestamp: Date.now(), retryCount: 0 });
      return { success: false, error: 'Offline - changes saved locally' };
    }

    const userId = await getUserId();
    console.log(`💾 Saving ${entries.length} travel entries for user:`, userId);

    try {
      // Delete existing entries for this user
      const { error: deleteError } = await supabase.from('travel_entries').delete().eq('user_id', userId);
      if (deleteError) {
        console.error('❌ Error deleting old entries:', deleteError);

        // Check if it's a pause/inactive error
        if (deleteError.message.toLowerCase().includes('paused') || deleteError.message.toLowerCase().includes('inactive')) {
          savePendingSync({ type: 'entries', data: entries, timestamp: Date.now(), retryCount: 0 });
          return { success: false, error: 'Supabase project is paused. Data saved locally.' };
        }

        throw deleteError;
      }

      // Insert all current entries
      if (entries.length > 0) {
        const dbEntries = await Promise.all(entries.map(entryToDB));
        const { error } = await supabase.from('travel_entries').insert(dbEntries);
        if (error) {
          console.error('❌ Error inserting entries:', error);
          savePendingSync({ type: 'entries', data: entries, timestamp: Date.now(), retryCount: 0 });
          throw error;
        }
      }

      // Clear any pending sync for entries since we succeeded
      clearPendingSync('entries');
      console.log('✅ Synced travel entries to cloud');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to sync travel entries:', error);
      savePendingSync({ type: 'entries', data: entries, timestamp: Date.now(), retryCount: 0 });
      return { success: false, error: error.message || 'Sync failed' };
    }
  },

  async load(): Promise<TravelEntry[] | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    if (!isOnline()) {
      console.log('📴 Offline - using local data');
      return null;
    }

    const userId = await getUserId();
    console.log('🔍 Loading travel entries for user:', userId);

    try {
      const { data, error } = await supabase
        .from('travel_entries')
        .select('*')
        .eq('user_id', userId)
        .order('arrival_date', { ascending: false });

      if (error) {
        console.error('❌ Database error loading entries:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log(`✅ Loaded ${data.length} travel entries from cloud`);
        return data.map(entryFromDB);
      }

      console.log('📭 No travel entries found in cloud for this user');
      return null;
    } catch (error) {
      console.error('Failed to load travel entries:', error);
      return null;
    }
  },
};

export const syncCountryRules = {
  async save(countries: Record<string, CountryRule>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, using localStorage only');
      return { success: true };
    }

    if (!isOnline()) {
      console.log('📴 Offline - queuing sync for later');
      savePendingSync({ type: 'countries', data: countries, timestamp: Date.now(), retryCount: 0 });
      return { success: false, error: 'Offline - changes saved locally' };
    }

    const userId = await getUserId();

    try {
      // Delete existing custom countries for this user
      const { error: deleteError } = await supabase.from('country_rules').delete().eq('user_id', userId);
      if (deleteError) {
        // Check if it's a pause/inactive error
        if (deleteError.message.toLowerCase().includes('paused') || deleteError.message.toLowerCase().includes('inactive')) {
          savePendingSync({ type: 'countries', data: countries, timestamp: Date.now(), retryCount: 0 });
          return { success: false, error: 'Supabase project is paused. Data saved locally.' };
        }
      }

      // Insert all current countries
      const dbCountries = await Promise.all(
        Object.entries(countries).map(([code, rule]) => countryToDB(code, rule))
      );

      if (dbCountries.length > 0) {
        const { error } = await supabase.from('country_rules').insert(dbCountries);
        if (error) {
          savePendingSync({ type: 'countries', data: countries, timestamp: Date.now(), retryCount: 0 });
          throw error;
        }
      }

      // Clear any pending sync for countries since we succeeded
      clearPendingSync('countries');
      console.log('✅ Synced country rules to cloud');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to sync country rules:', error);
      savePendingSync({ type: 'countries', data: countries, timestamp: Date.now(), retryCount: 0 });
      return { success: false, error: error.message || 'Sync failed' };
    }
  },

  async load(): Promise<Record<string, CountryRule> | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    if (!isOnline()) {
      console.log('📴 Offline - using local data');
      return null;
    }

    const userId = await getUserId();

    try {
      const { data, error } = await supabase
        .from('country_rules')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        const countries: Record<string, CountryRule> = {};
        data.forEach(dbRule => {
          const { code, rule } = countryFromDB(dbRule);
          countries[code] = rule;
        });
        console.log(`✅ Loaded ${data.length} country rules from cloud`);
        return countries;
      }

      return null;
    } catch (error) {
      console.error('Failed to load country rules:', error);
      return null;
    }
  },
};

// Retry pending syncs - call this when coming back online
export const retryPendingSyncs = async (): Promise<{ success: boolean; synced: number }> => {
  const pendingItems = getPendingSyncItems();
  if (pendingItems.length === 0) {
    return { success: true, synced: 0 };
  }

  if (!isOnline()) {
    return { success: false, synced: 0 };
  }

  console.log(`🔄 Retrying ${pendingItems.length} pending syncs...`);
  let syncedCount = 0;

  for (const item of pendingItems) {
    try {
      if (item.type === 'entries') {
        const result = await syncTravelEntries.save(item.data as TravelEntry[]);
        if (result.success) syncedCount++;
      } else if (item.type === 'countries') {
        const result = await syncCountryRules.save(item.data as Record<string, CountryRule>);
        if (result.success) syncedCount++;
      }
    } catch (e) {
      console.error(`Failed to retry sync for ${item.type}:`, e);
    }
  }

  return { success: syncedCount === pendingItems.length, synced: syncedCount };
};

// Create automatic backup in localStorage with timestamp
export const createLocalBackup = (entries: TravelEntry[], countries: Record<string, CountryRule>): void => {
  if (typeof window === 'undefined') return;

  try {
    const backup = {
      entries,
      countries,
      timestamp: Date.now(),
      version: 1
    };

    // Keep last 3 backups
    const backupKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('travelBackup_')) {
        backupKeys.push(key);
      }
    }

    // Sort by timestamp (oldest first) and remove excess
    backupKeys.sort();
    while (backupKeys.length >= 3) {
      const oldestKey = backupKeys.shift();
      if (oldestKey) localStorage.removeItem(oldestKey);
    }

    // Save new backup
    const backupKey = `travelBackup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));
    console.log('💾 Created local backup:', backupKey);
  } catch (e) {
    console.error('Failed to create local backup:', e);
  }
};

// Get available backups
export const getLocalBackups = (): Array<{ key: string; timestamp: number; entryCount: number }> => {
  if (typeof window === 'undefined') return [];

  const backups: Array<{ key: string; timestamp: number; entryCount: number }> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('travelBackup_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        backups.push({
          key,
          timestamp: data.timestamp || 0,
          entryCount: data.entries?.length || 0
        });
      } catch (e) {
        // Skip invalid backups
      }
    }
  }

  return backups.sort((a, b) => b.timestamp - a.timestamp);
};

// Restore from backup
export const restoreFromBackup = (backupKey: string): { entries: TravelEntry[]; countries: Record<string, CountryRule> } | null => {
  if (typeof window === 'undefined') return null;

  try {
    const data = JSON.parse(localStorage.getItem(backupKey) || '{}');
    if (data.entries) {
      return {
        entries: data.entries,
        countries: data.countries || {}
      };
    }
  } catch (e) {
    console.error('Failed to restore from backup:', e);
  }

  return null;
};
