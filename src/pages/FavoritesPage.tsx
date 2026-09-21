import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { getPropertiesByIds } from '../lib/data'
import { getSavedPropertyIds } from '../lib/localFavorites'
import PropertyCard from '../components/PropertyCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import type { Property } from '../lib/types'
import PageHero from '../components/PageHero'
import Seo from '../components/Seo'
import { HERO_IMAGES, PAGE_SEO } from '../lib/pageContent'

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
    <div>
      <Seo {...PAGE_SEO.favorites} />
      <PageHero
        eyebrow="Saved on this device"
        title="Saved properties"
        description="Kept on this device. No account needed."
        image={HERO_IMAGES.favorites}
        imageAlt="Saved homes"
      />

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
