export function formatPrice(price: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$', RWF: 'RWF ', EUR: '€' }
  const symbol = symbols[currency] ?? currency + ' '
  if (currency === 'RWF') {
    return `${symbol}${Math.round(price).toLocaleString()}`
  }
  return `${symbol}${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function formatPriceShort(price: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$', RWF: 'RWF ', EUR: '€' }
  const symbol = symbols[currency] ?? currency + ' '
  if (price >= 1000000) return `${symbol}${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `${symbol}${(price / 1000).toFixed(0)}K`
  return `${symbol}${price}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function getLocationString(property: any): string {
  const loc = property.locations
  if (!loc) return ''
  const parts = [loc.neighborhood, loc.district, loc.city].filter(Boolean)
  return parts.join(', ')
}
