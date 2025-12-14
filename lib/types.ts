export interface TravelEntry {
  id: string;
  departureCountry: string;
  arrivalCountry: string;
  departureDate: string;
  arrivalDate: string;
}

export interface CountryStay {
  country: string;
  days: number;
  status: 'safe' | 'warning' | 'danger';
  threshold: number;
  calendarType: 'calendar-year' | 'rolling-12-month';
}

export interface CountryRule {
  code: string;
  name: string;
  threshold: number;
  calendarType: 'calendar-year' | 'rolling-12-month';
  description: string;
  isCustom?: boolean;
}
