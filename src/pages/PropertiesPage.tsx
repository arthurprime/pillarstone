import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { getProperties, getPropertyTypes, getLocations } from '../lib/data'
import type { Property, PropertyType, Location } from '../lib/types'

const PAGE_SIZE = 12

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [types, setTypes] = useState<PropertyType[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const sort = searchParams.get('sort') ?? 'newest'

  const filters = {
    listing: searchParams.get('listing') ?? '',
    type: searchParams.get('type') ?? '',
    location: searchParams.get('location') ?? '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
  }

  useEffect(() => {
    getPropertyTypes().then(setTypes).catch(() => {})
    getLocations().then(setLocations).catch(() => {})
  }, [])

  const loadProperties = useCallback(async () => {
    setLoading(true)
    try {
      const { data, total: count } = await getProperties({
        listing: filters.listing || undefined,
        type: filters.type || undefined,
        location: filters.location || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        bedrooms: filters.bedrooms,
        bathrooms: filters.bathrooms,
        sort,
        page,
        pageSize: PAGE_SIZE,
      })
      setProperties(data)
      setTotal(count)
    } catch {
      setProperties([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters.listing, filters.type, filters.location, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.bathrooms, sort, page])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams())
  }

  const hasFilters = !!(filters.listing || filters.type || filters.location || filters.minPrice || filters.maxPrice || filters.bedrooms || filters.bathrooms)

  return (
    <div>
      {/* Header */}
      <section className="bg-ink-950 text-warm-white py-16">
        <div className="max-w-site container-px">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Browse</p>
          <h1 className="font-display text-4xl md:text-5xl">All Properties</h1>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-site container-px">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-stone-500">
                {loading ? 'Loading...' : `${total} ${total === 1 ? 'property' : 'properties'} found`}
              </p>
              {hasFilters && (
                <button onClick={resetFilters} className="text-sm text-ink-600 hover:text-ink-900 underline">
                  Reset filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-sm text-ink-700 hover:bg-stone-100 transition-colors lg:hidden"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="px-4 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Largest Area</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* Filter sidebar */}
            <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="lg:hidden flex justify-end mb-2">
                  <button onClick={() => setShowFilters(false)} className="text-stone-400"><X size={20} /></button>
                </div>

                <FilterGroup label="Listing Type">
                  <select
                    value={filters.listing}
                    onChange={(e) => updateFilter('listing', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700"
                  >
                    <option value="">All</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </FilterGroup>

                <FilterGroup label="Property Type">
                  <select
                    value={filters.type}
                    onChange={(e) => updateFilter('type', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700"
                  >
                    <option value="">All Types</option>
                    {types.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup label="Location">
                  <select
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700"
                  >
                    <option value="">All Locations</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.neighborhood ?? l.city}>
                        {[l.neighborhood, l.city].filter(Boolean).join(', ')}
                      </option>
                    ))}
                  </select>
                </FilterGroup>

                <FilterGroup label="Min Price">
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice ?? ''}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700"
                  />
                </FilterGroup>

                <FilterGroup label="Max Price">
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.maxPrice ?? ''}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700"
                  />
                </FilterGroup>

                <FilterGroup label="Min Bedrooms">
                  <select
                    value={filters.bedrooms ?? ''}
                    onChange={(e) => updateFilter('bedrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup label="Min Bathrooms">
                  <select
                    value={filters.bathrooms ?? ''}
                    onChange={(e) => updateFilter('bathrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
                  </select>
                </FilterGroup>
              </div>
            </aside>

            {/* Property grid */}
            <div>
              {loading ? (
                <LoadingSkeleton count={6} />
              ) : properties.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties.map(p => <PropertyCard key={p.id} property={p} />)}
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      const next = new URLSearchParams(searchParams)
                      next.set('page', String(p))
                      setSearchParams(next)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </>
              ) : (
                <EmptyState
                  title="No properties found"
                  description="Try adjusting your search filters to find what you're looking for."
                  action={{ label: 'Browse all properties', href: '/properties' }}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs tracking-wide uppercase text-stone-500 mb-2">{label}</label>
      {children}
    </div>
  )
}
