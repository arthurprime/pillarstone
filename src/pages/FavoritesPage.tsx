import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { getFavorites } from '../lib/data'
import PropertyCard from '../components/PropertyCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import type { Favorite } from '../lib/types'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      setLoading(false)
      return
    }
    if (user) {
      getFavorites(user.id).then(setFavorites).catch(() => {}).finally(() => setLoading(false))
    }
  }, [user, authLoading])

  if (authLoading) {
    return <div className="pt-20"><div className="max-w-site container-px py-10"><LoadingSkeleton count={3} /></div></div>
  }

  if (!user) {
    return (
      <div className="pt-20">
        <EmptyState
          title="Sign in to view favorites"
          description="Save properties you love and access them anytime from your account."
          action={{ label: 'Sign in', href: '/login' }}
          icon={<Heart size={48} />}
        />
      </div>
    )
  }

  return (
    <div className="pt-20">
      <section className="bg-ink-950 text-warm-white py-16">
        <div className="max-w-site container-px">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Saved</p>
          <h1 className="font-display text-4xl md:text-5xl">Your Favorites</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-site container-px">
          {loading ? (
            <LoadingSkeleton count={3} />
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map(f => f.properties && <PropertyCard key={f.id} property={f.properties} />)}
            </div>
          ) : (
            <EmptyState
              title="No saved properties yet"
              description="Browse properties and tap the heart icon to save your favorites here."
              action={{ label: 'Browse properties', href: '/properties' }}
              icon={<Heart size={48} />}
            />
          )}
        </div>
      </section>
    </div>
  )
}
