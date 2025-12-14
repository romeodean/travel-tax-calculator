import { TravelEntry, CountryStay, CountryRule } from './types';
import { TAX_RULES } from './taxRules';

export function calculateDaysInCountry(
  entries: TravelEntry[],
  countryCode: string,
  startDate: Date,
  endDate: Date
): number {
  let totalDays = 0;
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
  );

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    const arrival = new Date(entry.arrivalDate);
    const departure = i < sortedEntries.length - 1
      ? new Date(sortedEntries[i + 1].departureDate)
      : new Date(); // If no next entry, assume still there

    // Only count if arrival country matches
    if (entry.arrivalCountry !== countryCode) continue;

    // Calculate overlap with the period
    const periodStart = arrival > startDate ? arrival : startDate;
    const periodEnd = departure < endDate ? departure : endDate;

    if (periodStart <= periodEnd) {
      const days = Math.ceil(
        (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1; // +1 to include both start and end day
      totalDays += days;
    }
  }

  return totalDays;
}

export function getCalendarYearRange(year?: number): { start: Date; end: Date } {
  const targetYear = year ?? new Date().getFullYear();
  return {
    start: new Date(targetYear, 0, 1),
    end: new Date(targetYear, 11, 31, 23, 59, 59)
  };
}

export function getRolling12MonthRange(endDate?: Date): { start: Date; end: Date } {
  const end = endDate || new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  return { start, end };
}

export function calculateCountryStays(entries: TravelEntry[], countries?: Record<string, CountryRule>): CountryStay[] {
  const stays: CountryStay[] = [];
  const rulesToUse = countries || TAX_RULES;

  Object.values(rulesToUse).forEach(rule => {
    const range = rule.calendarType === 'calendar-year'
      ? getCalendarYearRange()
      : getRolling12MonthRange();

    const days = calculateDaysInCountry(entries, rule.code, range.start, range.end);

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

  return stays.sort((a, b) => b.days - a.days);
}

// Calculate country stays for a specific year (historical view)
export function calculateCountryStaysForYear(
  entries: TravelEntry[],
  year: number,
  countries: Record<string, CountryRule>
): CountryStay[] {
  const stays: CountryStay[] = [];

  Object.values(countries).forEach(rule => {
    let range: { start: Date; end: Date };

    if (rule.calendarType === 'calendar-year') {
      // For calendar year, use the specified year
      range = getCalendarYearRange(year);
    } else {
      // For rolling 12 months, use Dec 31 of that year as the end date
      range = getRolling12MonthRange(new Date(year, 11, 31, 23, 59, 59));
    }

    const days = calculateDaysInCountry(entries, rule.code, range.start, range.end);

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

  return stays.sort((a, b) => b.days - a.days);
}

export function getStatusColor(status: 'safe' | 'warning' | 'danger'): string {
  switch (status) {
    case 'safe':
      return 'bg-green-500';
    case 'warning':
      return 'bg-orange-500';
    case 'danger':
      return 'bg-red-500';
  }
}

export function getStatusText(status: 'safe' | 'warning' | 'danger'): string {
  switch (status) {
    case 'safe':
      return 'Safe';
    case 'warning':
      return 'Approaching Limit';
    case 'danger':
      return 'Over Threshold';
  }
}
