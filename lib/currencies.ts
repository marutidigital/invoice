// lib/currencies.ts — ISO 4217 currency list for ProInvoice

export interface Currency {
  code: string
  name: string
  symbol: string
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
]

export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`
  }
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode)
  return currency?.symbol ?? currencyCode
}
