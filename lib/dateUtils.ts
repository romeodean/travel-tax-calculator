/**
 * Parse a YYYY-MM-DD string as a local date (not UTC).
 *
 * `new Date("2025-04-16")` interprets as UTC midnight, which shifts
 * the date by -1 day in timezones west of UTC. This helper avoids that
 * by splitting the string and using the local-time Date constructor.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a Date as YYYY-MM-DD string using local date parts.
 */
export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
