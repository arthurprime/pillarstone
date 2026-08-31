import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { getProperties, getPropertyTypes } from '../lib/data'
import type { Property, PropertyType } from '../lib/types'

const PAGE_SIZE = 12

interface CategoryPageProps {
  listing?: string
  type?: string
  title: string
}

export default function CategoryPage({ listing, type, title }: CategoryPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [types, setTypes] = useState<PropertyType[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const sort = searchParams.get('sort') ?? 'newest'
  const urlListing = searchParams.get('listing') ?? ''
  const urlType = searchParams.get('type') ?? ''
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined

  const effectiveListing = listing ?? urlListing ?? ''
  const effectiveType = type ?? urlType ?? ''

  useEffect(() => {
    getPropertyTypes().then(setTypes).catch(() => {})
  }, [])

  const loadProperties = useCallback(async () => {
    setLoading(true)
    try {
      const { data, total: count } = await getProperties({
        listing: effectiveListing || undefined,
        type: effectiveType || undefined,
        minPrice,
        maxPrice,
        bedrooms,
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
  }, [effectiveListing, effectiveType, minPrice, maxPrice, bedrooms, sort, page])

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

  return (
    <div>
      <section className="bg-ink-950 text-warm-white py-16">
        <div className="max-w-site container-px">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Browse</p>
          <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-site container-px">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <p className="text-sm text-stone-500">
              {loading ? 'Loading...' : `${total} ${total === 1 ? 'property' : 'properties'} found`}
            </p>
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
            <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="lg:hidden flex justify-end mb-2">
                  <button onClick={() => setShowFilters(false)} className="text-stone-400"><X size={20} /></button>
                </div>
                {!listing && (
                  <div>
                    <label className="block text-xs tracking-wide uppercase text-stone-500 mb-2">Listing Type</label>
                    <select value={urlListing} onChange={(e) => updateFilter('listing', e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700">
                      <option value="">All</option>
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                )}
                {!type && (
                  <div>
                    <label className="block text-xs tracking-wide uppercase text-stone-500 mb-2">Property Type</label>
                    <select value={urlType} onChange={(e) => updateFilter('type', e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700">
                      <option value="">All Types</option>
                      {types.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-2">Min Price</label>
                  <input type="number" placeholder="0" value={searchParams.get('minPrice') ?? ''} onChange={(e) => updateFilter('minPrice', e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                </div>
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-2">Max Price</label>
                  <input type="number" placeholder="Any" value={searchParams.get('maxPrice') ?? ''} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                </div>
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-2">Min Bedrooms</label>
                  <select value={searchParams.get('bedrooms') ?? ''} onChange={(e) => updateFilter('bedrooms', e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700">
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
                  </select>
                </div>
              </div>
            </aside>

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
                  description="Try adjusting your filters to find what you're looking for."
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
