import { supabase, isSupabaseConfigured, TravelEntryDB, CountryRuleDB } from './supabase';
import { TravelEntry, CountryRule } from './types';

// Generate a simple device ID for anonymous users
const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'server';

  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Convert app types to DB types
const entryToDB = (entry: TravelEntry): TravelEntryDB => ({
  id: entry.id,
  user_id: getDeviceId(),
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

const countryToDB = (code: string, rule: CountryRule): CountryRuleDB => ({
  user_id: getDeviceId(),
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
  async save(entries: TravelEntry[]): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, using localStorage only');
      return;
    }

    const userId = getDeviceId();

    try {
      // Delete existing entries for this user
      await supabase.from('travel_entries').delete().eq('user_id', userId);

      // Insert all current entries
      if (entries.length > 0) {
        const dbEntries = entries.map(entryToDB);
        const { error } = await supabase.from('travel_entries').insert(dbEntries);
        if (error) throw error;
      }

      console.log('✅ Synced travel entries to cloud');
    } catch (error) {
      console.error('Failed to sync travel entries:', error);
      throw error;
    }
  },

  async load(): Promise<TravelEntry[] | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    const userId = getDeviceId();

    try {
      const { data, error } = await supabase
        .from('travel_entries')
        .select('*')
        .eq('user_id', userId)
        .order('arrival_date', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`✅ Loaded ${data.length} travel entries from cloud`);
        return data.map(entryFromDB);
      }

      return null;
    } catch (error) {
      console.error('Failed to load travel entries:', error);
      return null;
    }
  },
};

export const syncCountryRules = {
  async save(countries: Record<string, CountryRule>): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, using localStorage only');
      return;
    }

    const userId = getDeviceId();

    try {
      // Delete existing custom countries for this user
      await supabase.from('country_rules').delete().eq('user_id', userId);

      // Insert all current countries
      const dbCountries = Object.entries(countries).map(([code, rule]) => countryToDB(code, rule));

      if (dbCountries.length > 0) {
        const { error } = await supabase.from('country_rules').insert(dbCountries);
        if (error) throw error;
      }

      console.log('✅ Synced country rules to cloud');
    } catch (error) {
      console.error('Failed to sync country rules:', error);
      throw error;
    }
  },

  async load(): Promise<Record<string, CountryRule> | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    const userId = getDeviceId();

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
