import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, Trash2, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import Modal from '../../components/Modal'
import { formatPrice, getLocationString } from '../../lib/utils'
import type { Property } from '../../lib/types'

export default function AdminProperties() {
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select(`*, property_types (*), locations (*), property_images (*)`)
      .order('created_at', { ascending: false })
    if (error) {
      toast('Could not load properties.', 'error')
    } else {
      setProperties(data ?? [])
    }
    setLoading(false)
  }

  const filtered = properties.filter(p => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())
    const matchesStatus = !statusFilter || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function toggleStatus(p: Property) {
    const newStatus = p.status === 'published' ? 'draft' : 'published'
    const update: any = { status: newStatus }
    if (newStatus === 'published') update.published_at = new Date().toISOString()
    const { error } = await supabase.from('properties').update(update).eq('id', p.id)
    if (error) {
      toast('Could not update status.', 'error')
    } else {
      toast(`Property ${newStatus === 'published' ? 'published' : 'unpublished'}.`, 'success')
      loadProperties()
    }
  }

  async function toggleFeatured(p: Property) {
    const { error } = await supabase.from('properties').update({ is_featured: !p.is_featured }).eq('id', p.id)
    if (error) {
      toast('Could not update featured status.', 'error')
    } else {
      toast('Featured status updated.', 'success')
      loadProperties()
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('properties').delete().eq('id', deleteTarget.id)
    if (error) {
      toast('Could not delete property.', 'error')
    } else {
      toast('Property deleted.', 'success')
      setDeleteTarget(null)
      loadProperties()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink-900">Properties</h2>
        <Link to="/admin/properties/new" className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-warm-white text-sm hover:bg-ink-800 transition-colors">
          <Plus size={16} /> Add Property
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-stone-300 text-sm bg-warm-white focus:outline-none focus:border-ink-700">
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
      </div>

      <div className="bg-warm-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Property</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Listing</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Featured</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="py-8 text-center text-stone-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="py-8 text-center text-stone-400">No properties found.</td></tr>
            ) : filtered.map(p => {
              const img = p.property_images?.[0]?.image_path
              return (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-3 px-4">
                    {img ? <img src={img} alt={p.title} className="w-14 h-14 object-cover" /> : <div className="w-14 h-14 bg-stone-100" />}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-ink-900 line-clamp-1">{p.title}</p>
                    {p.reference_number && <p className="text-xs text-stone-400">{p.reference_number}</p>}
                  </td>
                  <td className="py-3 px-4 text-stone-600">{p.property_types?.name ?? '-'}</td>
                  <td className="py-3 px-4 text-stone-600 capitalize">{p.listing_type}</td>
                  <td className="py-3 px-4 text-stone-600">{getLocationString(p) || '-'}</td>
                  <td className="py-3 px-4 text-ink-900 font-medium">{formatPrice(p.price, p.currency)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 ${p.status === 'published' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-stone-100 text-stone-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleFeatured(p)} className={`text-stone-400 hover:text-accent ${p.is_featured ? 'text-accent' : ''}`} aria-label="Toggle featured">
                      <Star size={16} className={p.is_featured ? 'fill-accent' : ''} />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/property/${p.slug}`} target="_blank" className="text-stone-400 hover:text-ink-900" aria-label="View"><Eye size={16} /></Link>
                      <Link to={`/admin/properties/${p.id}`} className="text-stone-400 hover:text-ink-900" aria-label="Edit"><Pencil size={16} /></Link>
                      <button onClick={() => toggleStatus(p)} className="text-xs text-stone-500 hover:text-ink-900">{p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                      <button onClick={() => setDeleteTarget(p)} className="text-stone-400 hover:text-red-500" aria-label="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Property" size="sm">
        <p className="text-sm text-stone-600 mb-6">Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-stone-300 text-sm hover:bg-stone-100">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-warm-white text-sm hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
