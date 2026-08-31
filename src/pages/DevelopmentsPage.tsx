import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight, Check } from 'lucide-react'
import { getDevelopments } from '../lib/data'
import DevelopmentCard from '../components/DevelopmentCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import type { Development } from '../lib/types'

export default function DevelopmentsPage() {
  const [developments, setDevelopments] = useState<Development[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDevelopments().then(setDevelopments).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="bg-ink-950 text-warm-white py-16">
        <div className="max-w-site container-px">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Browse</p>
          <h1 className="font-display text-4xl md:text-5xl">Developments</h1>
          <p className="text-stone-300 mt-4 max-w-lg">Explore our featured residential and commercial developments, each designed with care and built to last.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-site container-px">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-[16/10] skeleton" />
              <div className="aspect-[16/10] skeleton" />
            </div>
          ) : developments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {developments.map(d => <DevelopmentCard key={d.id} development={d} />)}
            </div>
          ) : (
            <EmptyState title="No developments available" description="Check back soon for new development projects." />
          )}
        </div>
      </section>
    </div>
  )
}
