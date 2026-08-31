import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { getPropertiesByIds } from '../lib/data'
import { getSavedPropertyIds } from '../lib/localFavorites'
import PropertyCard from '../components/PropertyCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import type { Property } from '../lib/types'

export default function FavoritesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = getSavedPropertyIds()
    if (ids.length === 0) {
      setProperties([])
      setLoading(false)
      return
    }
    getPropertiesByIds(ids)
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pt-20">
      <section className="bg-ink-950 text-warm-white py-16">
        <div className="max-w-site container-px">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Saved</p>
          <h1 className="font-display text-4xl md:text-5xl">Saved properties</h1>
          <p className="text-stone-400 mt-2 text-sm">Kept on this device. No account needed.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-site container-px">
          {loading ? (
            <LoadingSkeleton count={3} />
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <EmptyState
              title="No saved properties yet"
              description="Browse listings and tap the heart icon to save them on this device."
              action={{ label: 'Browse properties', href: '/properties' }}
              icon={<Heart size={48} />}
            />
          )}
        </div>
      </section>
    </div>
  )
}
