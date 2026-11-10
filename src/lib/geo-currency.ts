import { getConfigJson } from '@/lib/config';

export interface CurrencyInfo {
  symbol: string;
  code: string;
  locale: string;
}

const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
  BD: { symbol: '৳', code: 'BDT', locale: 'bn-BD' },
  US: { symbol: '$', code: 'USD', locale: 'en-US' },
  GB: { symbol: '£', code: 'GBP', locale: 'en-GB' },
  EU: { symbol: '€', code: 'EUR', locale: 'de-DE' },
  DE: { symbol: '€', code: 'EUR', locale: 'de-DE' },
  FR: { symbol: '€', code: 'EUR', locale: 'fr-FR' },
  IN: { symbol: '₹', code: 'INR', locale: 'hi-IN' },
  CA: { symbol: 'CA$', code: 'CAD', locale: 'en-CA' },
  AU: { symbol: 'AU$', code: 'AUD', locale: 'en-AU' },
  SG: { symbol: 'S$', code: 'SGD', locale: 'en-SG' },
  MY: { symbol: 'RM', code: 'MYR', locale: 'ms-MY' },
  PK: { symbol: 'Rs', code: 'PKR', locale: 'ur-PK' },
};

export function getCurrencyForCountry(countryCode: string | null | undefined): CurrencyInfo {
  if (!countryCode) return COUNTRY_CURRENCY_MAP.US;
  const upper = countryCode.toUpperCase();
  return COUNTRY_CURRENCY_MAP[upper] || COUNTRY_CURRENCY_MAP.US;
}

/**
 * Returns a human-friendly localized price estimate formatted with local symbol.
 * If currency is USD, returns direct format e.g. "$49".
 * If local currency e.g. BDT, returns "approx ৳5,390"
 */
export async function formatPriceForCountry(
  usdAmount: number,
  countryCode: string | null | undefined
): Promise<string> {
  if (usdAmount === 0) return '$0';

  const currency = getCurrencyForCountry(countryCode);
  if (currency.code === 'USD') {
    return `$${usdAmount}`;
  }

  const defaultRates: Record<string, number> = {
    BDT: 110,
    INR: 84,
    GBP: 0.79,
    EUR: 0.92,
    CAD: 1.36,
    AUD: 1.53,
    SGD: 1.34,
    MYR: 4.7,
    PKR: 278,
  };

  const rates = await getConfigJson<Record<string, number>>('currency_rates', defaultRates);
  const rate = rates[currency.code] || 1;
  const converted = Math.round(usdAmount * rate);

  return `approx ${currency.symbol}${converted.toLocaleString(currency.locale)}`;
}
