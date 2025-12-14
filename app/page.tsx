'use client';

import { useState, useEffect, useRef } from 'react';
import { TravelEntry, CountryStay, CountryRule } from '@/lib/types';
import { TAX_RULES } from '@/lib/taxRules';
import { calculateCountryStays, calculateCountryStaysForYear, getStatusColor, getStatusText } from '@/lib/calculations';
import { syncTravelEntries, syncCountryRules } from '@/lib/sync';
import { isSupabaseConfigured } from '@/lib/supabase';
import * as Flags from 'country-flag-icons/react/3x2';

// Map country codes to flag components
const FlagComponents: Record<string, any> = {
  AU: Flags.AU,
  NZ: Flags.NZ,
  US: Flags.US,
  KR: Flags.KR,
  HK: Flags.HK,
  IT: Flags.IT,
  AE: Flags.AE,
  MC: Flags.MC,
  GB: Flags.GB,
  JP: Flags.JP,
};

// Helper function to check if date is in the future
const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
};

// Calendar View Component
function CalendarView({ entries, countries }: { entries: TravelEntry[]; countries: Record<string, CountryRule> }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const years = Array.from(
    new Set(
      entries.flatMap(e => [
        new Date(e.departureDate).getFullYear(),
        new Date(e.arrivalDate).getFullYear()
      ])
    )
  ).sort((a, b) => b - a);

  if (years.length === 0) {
    years.push(new Date().getFullYear());
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextYear = () => setSelectedYear(selectedYear + 1);
  const prevYear = () => setSelectedYear(selectedYear - 1);

  const getCountryForDate = (date: Date): string | null => {
    // Don't show countries for future dates
    if (isFutureDate(date)) return null;

    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime()
    );

    for (let i = sortedEntries.length - 1; i >= 0; i--) {
      const entry = sortedEntries[i];
      const arrivalDate = new Date(entry.arrivalDate);
      arrivalDate.setHours(0, 0, 0, 0);

      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate >= arrivalDate) {
        return entry.arrivalCountry;
      }
    }
    return null;
  };

  const getCountryColor = (countryCode: string): string => {
    const colors: Record<string, string> = {
      'AU': '#FFE5B4',
      'NZ': '#C8E6C9',
      'US': '#BBDEFB',
      'KR': '#E1BEE7',
      'HK': '#FFCDD2',
      'IT': '#F8BBD0',
      'AE': '#FFE0B2',
      'MC': '#C5CAE9',
      'GB': '#B2EBF2',
      'JP': '#FFCCBC'
    };
    return colors[countryCode] || '#E0E0E0';
  };

  const renderMonthView = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded hover:bg-[#E8DCC4] transition-colors card-shadow"
          >
            ← Prev
          </button>
          <h3 className="text-2xl font-bold">{months[selectedMonth]} {selectedYear}</h3>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded hover:bg-[#E8DCC4] transition-colors card-shadow"
          >
            Next →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-bold text-sm py-2 text-[#5C4D3D]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const date = new Date(selectedYear, selectedMonth, day);
            const countryCode = getCountryForDate(date);
            const country = countryCode ? countries[countryCode] : null;
            const FlagIcon = countryCode ? FlagComponents[countryCode] : null;
            const isToday = new Date().toDateString() === date.toDateString();
            const isFuture = isFutureDate(date);

            return (
              <div
                key={day}
                className={`calendar-day aspect-square border-2 p-2 rounded-lg flex flex-col items-center justify-center ${
                  isToday ? 'border-[#8B7355] border-4 font-bold' : 'border-[#D4C4A8]'
                } ${isFuture ? 'opacity-30' : ''}`}
                style={{ backgroundColor: countryCode && !isFuture ? getCountryColor(countryCode) : '#FFFBF0' }}
                title={country ? country.name : isFuture ? 'Future' : 'Unknown location'}
              >
                <div className="text-sm font-bold mb-1">{day}</div>
                {FlagIcon && !isFuture && (
                  <FlagIcon className="w-6 h-4 rounded shadow-sm" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevYear}
            className="px-4 py-2 bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded hover:bg-[#E8DCC4] transition-colors card-shadow"
          >
            ← {selectedYear - 1}
          </button>
          <h3 className="text-3xl font-bold">{selectedYear}</h3>
          <button
            onClick={nextYear}
            className="px-4 py-2 bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded hover:bg-[#E8DCC4] transition-colors card-shadow"
          >
            {selectedYear + 1} →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {monthsShort.map((month, monthIdx) => {
            const daysInMonth = new Date(selectedYear, monthIdx + 1, 0).getDate();
            const firstDay = new Date(selectedYear, monthIdx, 1).getDay();

            const miniDays = [];
            for (let i = 0; i < firstDay; i++) miniDays.push(null);
            for (let day = 1; day <= daysInMonth; day++) miniDays.push(day);

            return (
              <div
                key={monthIdx}
                onClick={() => {
                  setSelectedMonth(monthIdx);
                  setViewMode('month');
                }}
                className="bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded-lg p-3 cursor-pointer hover:bg-[#E8DCC4] transition-all card-shadow"
              >
                <h4 className="text-center font-bold mb-2 text-sm">{month}</h4>
                <div className="grid grid-cols-7 gap-0.5">
                  {miniDays.map((day, idx) => {
                    if (day === null) return <div key={`e-${idx}`} className="aspect-square" />;

                    const date = new Date(selectedYear, monthIdx, day);
                    const countryCode = getCountryForDate(date);

                    return (
                      <div
                        key={day}
                        className="aspect-square rounded-sm text-[0.5rem] flex items-center justify-center"
                        style={{ backgroundColor: countryCode ? getCountryColor(countryCode) : 'transparent' }}
                      >
                        {day === 1 ? day : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 border-2 border-[#D4C4A8] rounded font-medium transition-all ${
            viewMode === 'month'
              ? 'bg-[#8B7355] text-white'
              : 'bg-[#FFFBF0] hover:bg-[#E8DCC4]'
          }`}
        >
          Month View
        </button>
        <button
          onClick={() => setViewMode('year')}
          className={`px-4 py-2 border-2 border-[#D4C4A8] rounded font-medium transition-all ${
            viewMode === 'year'
              ? 'bg-[#8B7355] text-white'
              : 'bg-[#FFFBF0] hover:bg-[#E8DCC4]'
          }`}
        >
          Year View
        </button>
      </div>

      {viewMode === 'month' ? renderMonthView() : renderYearView()}

      {/* Legend */}
      <div className="mt-6 p-4 bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded-lg">
        <h4 className="font-bold mb-3 text-sm">Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(countries).map(country => {
            const FlagIcon = FlagComponents[country.code];
            return (
              <div key={country.code} className="flex items-center gap-2">
                <div
                  className="w-8 h-6 rounded border-2 border-[#D4C4A8] flex items-center justify-center"
                  style={{ backgroundColor: getCountryColor(country.code) }}
                >
                  {/* Show flag only in month view, color only in year view */}
                  {FlagIcon && viewMode === 'month' && <FlagIcon className="w-6 h-4" />}
                </div>
                <span className="text-xs font-medium">{country.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [countries, setCountries] = useState<Record<string, CountryRule>>({ ...TAX_RULES });
  const [departureCountry, setDepartureCountry] = useState('');
  const [arrivalCountry, setArrivalCountry] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [countryStays, setCountryStays] = useState<CountryStay[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCountryManager, setShowCountryManager] = useState(false);
  const [editingCountry, setEditingCountry] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [selectedStatusYear, setSelectedStatusYear] = useState<number | 'current'>(getCurrentYear());
  const fileInputRef = useRef<HTMLInputElement>(null);

  function getCurrentYear() {
    return new Date().getFullYear();
  }

  // Get all available years from travel data
  const getAvailableYears = (): number[] => {
    if (entries.length === 0) return [getCurrentYear()];

    const years = new Set<number>();
    entries.forEach(entry => {
      years.add(new Date(entry.arrivalDate).getFullYear());
      years.add(new Date(entry.departureDate).getFullYear());
    });

    return Array.from(years).sort((a, b) => b - a);
  };

  // Load data from cloud or localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      // Try to load from cloud first
      if (isSupabaseConfigured()) {
        try {
          const cloudEntries = await syncTravelEntries.load();
          const cloudCountries = await syncCountryRules.load();

          if (cloudEntries) {
            setEntries(cloudEntries);
          } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('travelEntries');
            if (saved) setEntries(JSON.parse(saved));
          }

          if (cloudCountries) {
            setCountries(cloudCountries);
          } else {
            // Fallback to localStorage
            const savedCountries = localStorage.getItem('countryRules');
            if (savedCountries) {
              setCountries(JSON.parse(savedCountries));
            }
          }
        } catch (error) {
          console.error('Cloud load failed, using localStorage', error);
          // Fallback to localStorage
          const saved = localStorage.getItem('travelEntries');
          const savedCountries = localStorage.getItem('countryRules');
          if (saved) setEntries(JSON.parse(saved));
          if (savedCountries) setCountries(JSON.parse(savedCountries));
        }
      } else {
        // No cloud configured, use localStorage only
        const saved = localStorage.getItem('travelEntries');
        const savedCountries = localStorage.getItem('countryRules');
        if (saved) setEntries(JSON.parse(saved));
        if (savedCountries) setCountries(JSON.parse(savedCountries));
      }
    };

    loadData();
  }, []);

  // Save to localStorage and cloud, then recalculate whenever entries or countries change
  useEffect(() => {
    localStorage.setItem('travelEntries', JSON.stringify(entries));
    localStorage.setItem('countryRules', JSON.stringify(countries));

    // Sync to cloud if configured
    const syncToCloud = async () => {
      if (isSupabaseConfigured()) {
        try {
          setSyncStatus('syncing');
          await Promise.all([
            syncTravelEntries.save(entries),
            syncCountryRules.save(countries)
          ]);
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 2000);
        } catch (error) {
          console.error('Cloud sync failed:', error);
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 3000);
        }
      }
    };

    syncToCloud();

    // Recalculate with current country rules
    const stays: CountryStay[] = [];
    Object.values(countries).forEach(rule => {
      const range = rule.calendarType === 'calendar-year'
        ? { start: new Date(new Date().getFullYear(), 0, 1), end: new Date(new Date().getFullYear(), 11, 31) }
        : { start: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()), end: new Date() };

      let days = 0;
      entries.forEach(entry => {
        if (entry.arrivalCountry === rule.code) {
          const arrival = new Date(entry.arrivalDate);
          const nextEntry = entries.find(e => new Date(e.departureDate) > arrival && e.departureCountry === entry.arrivalCountry);
          const departure = nextEntry ? new Date(nextEntry.departureDate) : new Date();

          const periodStart = arrival > range.start ? arrival : range.start;
          const periodEnd = departure < range.end ? departure : range.end;

          if (periodStart <= periodEnd) {
            days += Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          }
        }
      });

      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (days >= rule.threshold) {
        status = 'danger';
      } else if (days >= rule.threshold * 0.8) {
        status = 'warning';
      }

      stays.push({
        country: rule.name,
        days,
        status,
        threshold: rule.threshold,
        calendarType: rule.calendarType
      });
    });

    setCountryStays(stays.sort((a, b) => b.days - a.days));
  }, [entries, countries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!departureCountry || !arrivalCountry || !departureDate || !arrivalDate) {
      alert('Please fill in all fields');
      return;
    }

    if (editingId) {
      setEntries(entries.map(entry =>
        entry.id === editingId
          ? { ...entry, departureCountry, arrivalCountry, departureDate, arrivalDate }
          : entry
      ));
      setEditingId(null);
    } else {
      const newEntry: TravelEntry = {
        id: Date.now().toString(),
        departureCountry,
        arrivalCountry,
        departureDate,
        arrivalDate,
      };
      setEntries([...entries, newEntry]);
    }

    setDepartureCountry('');
    setArrivalCountry('');
    setDepartureDate('');
    setArrivalDate('');
  };

  const editEntry = (entry: TravelEntry) => {
    setDepartureCountry(entry.departureCountry);
    setArrivalCountry(entry.arrivalCountry);
    setDepartureDate(entry.departureDate);
    setArrivalDate(entry.arrivalDate);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDepartureCountry('');
    setArrivalCountry('');
    setDepartureDate('');
    setArrivalDate('');
  };

  const deleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(e => e.id !== id));
      if (editingId === id) {
        cancelEdit();
      }
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all travel data?')) {
      setEntries([]);
      localStorage.removeItem('travelEntries');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `travel-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          const confirmed = confirm(
            `Import ${importedData.length} entries? This will replace your current data.`
          );
          if (confirmed) {
            setEntries(importedData);
          }
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateCountryRule = (code: string, updates: Partial<CountryRule>) => {
    setCountries({
      ...countries,
      [code]: { ...countries[code], ...updates }
    });
    setEditingCountry(null);
  };

  const addNewCountry = () => {
    const code = prompt('Enter country code (2-3 letters, e.g., FR, DE):');
    if (!code) return;

    const upperCode = code.toUpperCase();
    if (countries[upperCode]) {
      alert('Country already exists!');
      return;
    }

    const name = prompt('Enter country name:');
    if (!name) return;

    const threshold = prompt('Enter day threshold (e.g., 183):', '183');
    if (!threshold) return;

    const calendarType = confirm('Use calendar year (Jan-Dec)? Click Cancel for rolling 12 months.')
      ? 'calendar-year'
      : 'rolling-12-month';

    setCountries({
      ...countries,
      [upperCode]: {
        code: upperCode,
        name,
        threshold: parseInt(threshold),
        calendarType,
        description: `Custom: Tax resident if present for ${threshold}+ days`,
        isCustom: true
      }
    });
  };

  const deleteCountry = (code: string) => {
    if (!countries[code].isCustom) {
      alert('Cannot delete built-in countries. You can only delete custom countries.');
      return;
    }

    if (confirm(`Delete ${countries[code].name}?`)) {
      const newCountries = { ...countries };
      delete newCountries[code];
      setCountries(newCountries);
    }
  };

  // Filter to show all non-zero countries OR top 5
  const displayedCountryStays = countryStays.filter(stay => stay.days > 0).length > 0
    ? countryStays.filter(stay => stay.days > 0)
    : countryStays.slice(0, 5);

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-3 text-[#2D2419] tracking-tight">
          ✈️ TRAVEL TAX CALCULATOR
        </h1>
        <p className="text-[#5C4D3D] text-sm">
          [ Track your days · Monitor tax residency · Never lose data ]
        </p>
        {isSupabaseConfigured() && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs">
            {syncStatus === 'syncing' && (
              <span className="text-[#8B7355]">☁️ Syncing...</span>
            )}
            {syncStatus === 'synced' && (
              <span className="text-[#4A7C59]">✓ Synced to cloud</span>
            )}
            {syncStatus === 'error' && (
              <span className="text-[#A63446]">⚠ Sync failed</span>
            )}
            {syncStatus === 'idle' && (
              <span className="text-[#5C4D3D]">☁️ Cloud sync enabled</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form - Left Column */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded-lg p-6 card-shadow">
            <h2 className="text-xl font-bold mb-4 text-[#2D2419]">
              {editingId ? '📝 EDIT ENTRY' : '➕ NEW ENTRY'}
            </h2>
            {editingId && (
              <div className="mb-4 p-3 bg-[#E8DCC4] border-2 border-[#D4C4A8] rounded">
                <p className="text-xs font-medium">Currently editing existing entry</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5C4D3D] mb-2 uppercase tracking-wide">
                  From Country
                </label>
                <select
                  value={departureCountry}
                  onChange={(e) => setDepartureCountry(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#D4C4A8] rounded bg-white focus:outline-none focus:border-[#8B7355]"
                >
                  <option value="">Select...</option>
                  {Object.values(countries).map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C4D3D] mb-2 uppercase tracking-wide">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#D4C4A8] rounded bg-white focus:outline-none focus:border-[#8B7355]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C4D3D] mb-2 uppercase tracking-wide">
                  To Country
                </label>
                <select
                  value={arrivalCountry}
                  onChange={(e) => setArrivalCountry(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#D4C4A8] rounded bg-white focus:outline-none focus:border-[#8B7355]"
                >
                  <option value="">Select...</option>
                  {Object.values(countries).map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C4D3D] mb-2 uppercase tracking-wide">
                  Arrival Date
                </label>
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#D4C4A8] rounded bg-white focus:outline-none focus:border-[#8B7355]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#8B7355] text-white py-3 px-4 rounded font-bold hover:bg-[#6B5335] transition-colors border-2 border-[#6B5335]"
                >
                  {editingId ? 'UPDATE' : 'ADD ENTRY'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-3 border-2 border-[#D4C4A8] rounded font-bold hover:bg-[#E8DCC4] transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>

            {/* Data Management */}
            <div className="mt-6 pt-6 border-t-2 border-[#D4C4A8]">
              <h3 className="text-xs font-bold text-[#5C4D3D] mb-3 uppercase tracking-wide">Data Management</h3>
              <div className="space-y-2">
                <button
                  onClick={exportData}
                  disabled={entries.length === 0}
                  className="w-full px-3 py-2 bg-[#4A7C59] text-white text-sm rounded font-medium hover:bg-[#3A6C49] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#3A6C49]"
                >
                  ⬇ Download Backup
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 bg-[#5B7AA5] text-white text-sm rounded font-medium hover:bg-[#4B6A95] transition-colors border-2 border-[#4B6A95]"
                >
                  ⬆ Import Data
                </button>
                <button
                  onClick={() => setShowCountryManager(!showCountryManager)}
                  className="w-full px-3 py-2 bg-[#8B7355] text-white text-sm rounded font-medium hover:bg-[#6B5335] transition-colors border-2 border-[#6B5335]"
                >
                  🌍 Manage Countries
                </button>
                {entries.length > 0 && (
                  <button
                    onClick={clearAllData}
                    className="w-full px-3 py-2 text-sm text-[#A63446] hover:text-[#861424] font-medium transition-colors"
                  >
                    Clear All Data
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Dashboard */}
          <div className="bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded-lg p-6 card-shadow mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#2D2419]">🚦 TAX STATUS</h2>
            </div>

            {/* Year Selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#5C4D3D] mb-2 uppercase tracking-wide">
                View Period
              </label>
              <select
                value={selectedStatusYear}
                onChange={(e) => setSelectedStatusYear(e.target.value === 'current' ? 'current' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border-2 border-[#D4C4A8] rounded bg-white focus:outline-none focus:border-[#8B7355] text-sm font-mono"
              >
                <option value="current">Current (Today)</option>
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>
                    {year} {year === getCurrentYear() ? '(This Year)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#5C4D3D] mt-1">
                {selectedStatusYear === 'current'
                  ? 'Showing current tax status (calendar year or rolling 12 months from today)'
                  : `Showing status as of Dec 31, ${selectedStatusYear}`
                }
              </p>
            </div>

            <div className="space-y-3">
              {(() => {
                const staysToDisplay = selectedStatusYear === 'current'
                  ? displayedCountryStays
                  : calculateCountryStaysForYear(entries, selectedStatusYear as number, countries).filter(s => s.days > 0);

                return staysToDisplay.length > 0 ? staysToDisplay.map((stay) => {
                const countryRule = Object.values(countries).find(c => c.name === stay.country);
                const FlagIcon = countryRule ? FlagComponents[countryRule.code] : null;
                return (
                  <div key={stay.country} className="border-2 border-[#D4C4A8] rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {FlagIcon && <FlagIcon className="w-6 h-4 rounded" />}
                        <h3 className="font-bold text-sm">{stay.country}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(stay.status)}`}></div>
                        <span className="text-xs font-medium">{getStatusText(stay.status)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-[#5C4D3D]">
                      <p className="font-mono">
                        <span className="font-bold">{stay.days}</span> / {stay.threshold} days
                      </p>
                      <p className="text-[0.65rem] mt-1">
                        {stay.calendarType === 'calendar-year' ? 'Calendar Year' : 'Rolling 12mo'}
                      </p>
                    </div>
                    <div className="mt-2 bg-[#E8DCC4] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(stay.status)}`}
                        style={{ width: `${Math.min((stay.days / stay.threshold) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-center text-sm text-[#5C4D3D] py-4">
                  {selectedStatusYear === 'current' ? 'No travel data yet' : `No travel data for ${selectedStatusYear}`}
                </p>
              );
              })()}
            </div>
          </div>
        </div>

        {/* Calendar & History - Right Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Country Manager Modal */}
          {showCountryManager && (
            <div className="bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded-lg p-6 card-shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#2D2419]">🌍 COUNTRY MANAGER</h2>
                <button
                  onClick={() => setShowCountryManager(false)}
                  className="px-3 py-1 border-2 border-[#D4C4A8] rounded font-bold hover:bg-[#E8DCC4]"
                >
                  ✕
                </button>
              </div>
              <button
                onClick={addNewCountry}
                className="w-full mb-4 px-4 py-2 bg-[#4A7C59] text-white rounded font-medium hover:bg-[#3A6C49] border-2 border-[#3A6C49]"
              >
                ➕ Add New Country
              </button>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.values(countries).map(country => (
                  <div key={country.code} className="border-2 border-[#D4C4A8] rounded-lg p-3 bg-white">
                    {editingCountry === country.code ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          defaultValue={country.threshold}
                          onBlur={(e) => updateCountryRule(country.code, { threshold: parseInt(e.target.value) })}
                          className="w-full px-2 py-1 border-2 border-[#D4C4A8] rounded text-sm"
                          placeholder="Threshold days"
                        />
                        <select
                          defaultValue={country.calendarType}
                          onChange={(e) => updateCountryRule(country.code, {
                            calendarType: e.target.value as 'calendar-year' | 'rolling-12-month'
                          })}
                          className="w-full px-2 py-1 border-2 border-[#D4C4A8] rounded text-sm"
                        >
                          <option value="calendar-year">Calendar Year (Jan-Dec)</option>
                          <option value="rolling-12-month">Rolling 12 Months</option>
                        </select>
                        <button
                          onClick={() => setEditingCountry(null)}
                          className="w-full px-2 py-1 bg-[#8B7355] text-white text-sm rounded hover:bg-[#6B5335]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-sm">{country.name} ({country.code})</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingCountry(country.code)}
                              className="text-[#5B7AA5] hover:text-[#4B6A95] font-bold text-sm"
                            >
                              ✎
                            </button>
                            {country.isCustom && (
                              <button
                                onClick={() => deleteCountry(country.code)}
                                className="text-[#A63446] hover:text-[#861424] font-bold text-sm"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-[#5C4D3D]">
                          {country.threshold} days · {country.calendarType === 'calendar-year' ? 'Calendar Year' : 'Rolling 12mo'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar */}
          <div className="bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded-lg p-6 card-shadow">
            <h2 className="text-xl font-bold mb-6 text-[#2D2419]">📅 TRAVEL CALENDAR</h2>
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#5C4D3D] mb-4">No travel data yet. Add your first entry!</p>
              </div>
            ) : (
              <CalendarView entries={entries} countries={countries} />
            )}
          </div>

          {/* Travel History */}
          <div className="bg-[#FFFBF0] border-2 border-[#D4C4A8] rounded-lg p-6 card-shadow">
            <h2 className="text-xl font-bold mb-4 text-[#2D2419]">📋 TRAVEL LOG</h2>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#5C4D3D] text-sm">No entries yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#D4C4A8]">
                      <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wide">From</th>
                      <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wide">Departed</th>
                      <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wide">To</th>
                      <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wide">Arrived</th>
                      <th className="text-left py-3 px-2 font-bold text-xs uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {[...entries].reverse().map((entry) => {
                      const depCountry = countries[entry.departureCountry];
                      const arrCountry = countries[entry.arrivalCountry];
                      const DepFlag = FlagComponents[entry.departureCountry];
                      const ArrFlag = FlagComponents[entry.arrivalCountry];

                      return (
                        <tr key={entry.id} className="border-b border-[#D4C4A8] hover:bg-[#F5F1E8] transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {DepFlag && <DepFlag className="w-5 h-3 rounded" />}
                              <span>{depCountry?.code}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">{new Date(entry.departureDate).toLocaleDateString()}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {ArrFlag && <ArrFlag className="w-5 h-3 rounded" />}
                              <span>{arrCountry?.code}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">{new Date(entry.arrivalDate).toLocaleDateString()}</td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => editEntry(entry)}
                              className="text-[#5B7AA5] hover:text-[#4B6A95] font-bold mr-3"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="text-[#A63446] hover:text-[#861424] font-bold"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
