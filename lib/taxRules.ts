import { CountryRule } from './types';

export const TAX_RULES: Record<string, CountryRule> = {
  'AU': {
    code: 'AU',
    name: 'Australia',
    threshold: 183,
    calendarType: 'calendar-year',
    description: 'Tax resident if physically present for more than 183 days in a calendar year'
  },
  'NZ': {
    code: 'NZ',
    name: 'New Zealand',
    threshold: 183,
    calendarType: 'rolling-12-month',
    description: 'Tax resident if present for more than 183 days in any 12-month period'
  },
  'US': {
    code: 'US',
    name: 'United States',
    threshold: 183,
    calendarType: 'calendar-year',
    description: 'Substantial presence test: 183 days in calendar year (weighted calculation applies)'
  },
  'KR': {
    code: 'KR',
    name: 'South Korea',
    threshold: 183,
    calendarType: 'calendar-year',
    description: 'Tax resident if staying for 183 days or more in a calendar year'
  },
  'HK': {
    code: 'HK',
    name: 'Hong Kong',
    threshold: 180,
    calendarType: 'calendar-year',
    description: 'Tax resident if ordinarily residing or present for 180+ days in a year'
  },
  'IT': {
    code: 'IT',
    name: 'Italy',
    threshold: 183,
    calendarType: 'calendar-year',
    description: 'Tax resident if present for more than 183 days in a calendar year'
  },
  'AE': {
    code: 'AE',
    name: 'UAE',
    threshold: 183,
    calendarType: 'rolling-12-month',
    description: 'Tax resident if present for 183+ days in a 12-month period (no personal income tax)'
  },
  'MC': {
    code: 'MC',
    name: 'Monaco',
    threshold: 183,
    calendarType: 'calendar-year',
    description: 'Tax residency based on primary residence (no personal income tax for residents)'
  },
  'GB': {
    code: 'GB',
    name: 'United Kingdom',
    threshold: 183,
    calendarType: 'calendar-year',
    description: 'Automatic UK resident if present for 183+ days in a tax year (April 6 - April 5)'
  },
  'JP': {
    code: 'JP',
    name: 'Japan',
    threshold: 183,
    calendarType: 'rolling-12-month',
    description: 'Tax resident if having domicile or residence in Japan for 1 year or more'
  }
};

export const COUNTRIES = Object.values(TAX_RULES);
