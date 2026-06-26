export const CURRENCIES: Record<string, { symbol: string; label: string }> = {
  USD: { symbol: '$',  label: 'USD — US Dollar' },
  EUR: { symbol: '€',  label: 'EUR — Euro' },
  GBP: { symbol: '£',  label: 'GBP — British Pound' },
  AUD: { symbol: 'A$', label: 'AUD — Australian Dollar' },
  CAD: { symbol: 'C$', label: 'CAD — Canadian Dollar' },
  CHF: { symbol: 'Fr', label: 'CHF — Swiss Franc' },
  JPY: { symbol: '¥',  label: 'JPY — Japanese Yen' },
  BRL: { symbol: 'R$', label: 'BRL — Brazilian Real' },
  MXN: { symbol: 'MX$', label: 'MXN — Mexican Peso' },
  SGD: { symbol: 'S$', label: 'SGD — Singapore Dollar' },
  TRY: { symbol: '₺',  label: 'TRY — Turkish Lira' },
  VND: { symbol: '₫',  label: 'VND — Vietnamese Dong' },
}

let rateCache: { rates: Record<string, number>; fetchedAt: number } | null = null

async function getRates(): Promise<Record<string, number>> {
  const now = Date.now()
  if (rateCache && now - rateCache.fetchedAt < 86_400_000) return rateCache.rates

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 86400 },
    })
    if (!res.ok) throw new Error('Rate fetch failed')
    const data = await res.json()
    rateCache = { rates: data.rates, fetchedAt: now }
    return data.rates
  } catch {
    // Fallback approximate rates if fetch fails
    return {
      USD: 1, EUR: 0.92, GBP: 0.79, AUD: 1.53, CAD: 1.36,
      CHF: 0.90, JPY: 149.5, BRL: 4.97, MXN: 17.2,
      SGD: 1.34, TRY: 32.1, VND: 24500,
    }
  }
}

export async function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): Promise<number> {
  if (fromCurrency === toCurrency || !amount) return amount
  const rates = await getRates()
  const fromRate = rates[fromCurrency] ?? 1
  const toRate = rates[toCurrency] ?? 1
  return Math.round((amount / fromRate) * toRate)
}

export function formatPrice(amount: number, currency: string): string {
  const { symbol } = CURRENCIES[currency] ?? { symbol: '$' }
  if (currency === 'JPY' || currency === 'VND') {
    return `${symbol}${Math.round(amount).toLocaleString()}`
  }
  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`
  }
  return `${symbol}${amount.toLocaleString()}`
}
