const KEY = 'pillarstone_favorites'

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getSavedPropertyIds(): string[] {
  return readIds()
}

export function isSavedLocally(propertyId: string): boolean {
  return readIds().includes(propertyId)
}

export function toggleSavedLocally(propertyId: string): boolean {
  const ids = readIds()
  const next = ids.includes(propertyId)
    ? ids.filter(id => id !== propertyId)
    : [...ids, propertyId]
  localStorage.setItem(KEY, JSON.stringify(next))
  return next.includes(propertyId)
}
