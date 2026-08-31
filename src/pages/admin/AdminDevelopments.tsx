import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react'
import { supabase, STORAGE_BUCKETS } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import Modal from '../../components/Modal'
import { slugify, formatPrice } from '../../lib/utils'
import type { Development, Location } from '../../lib/types'

export default function AdminDevelopments() {
  const { toast } = useToast()
  const [developments, setDevelopments] = useState<Development[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Development | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Development | null>(null)
  const [form, setForm] = useState({
    name: '', slug: '', developer: '', description: '', main_image_path: '',
    location_id: '', status: 'draft', starting_price: '', currency: 'USD',
    completion_date: '', amenities: '', is_featured: false,
  })

  useEffect(() => {
    loadDevelopments()
    supabase.from('locations').select('*').order('city').then(({ data }) => setLocations(data ?? []))
  }, [])

  async function loadDevelopments() {
    setLoading(true)
    const { data } = await supabase.from('developments').select(`*, locations (*)`).order('created_at', { ascending: false })
    setDevelopments(data ?? [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', slug: '', developer: '', description: '', main_image_path: '', location_id: '', status: 'draft', starting_price: '', currency: 'USD', completion_date: '', amenities: '', is_featured: false })
    setShowForm(true)
  }

  function openEdit(d: Development) {
    setEditing(d)
    setForm({
      name: d.name, slug: d.slug, developer: d.developer ?? '', description: d.description ?? '',
      main_image_path: d.main_image_path ?? '', location_id: d.location_id ?? '', status: d.status,
      starting_price: String(d.starting_price ?? ''), currency: d.currency,
      completion_date: d.completion_date ?? '', amenities: (d.amenities ?? []).join(', '), is_featured: d.is_featured,
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { toast('Name is required.', 'error'); return }
    const slug = form.slug || slugify(form.name)
    const payload: any = {
      name: form.name, slug, developer: form.developer || null,
      description: form.description || null, main_image_path: form.main_image_path || null,
      location_id: form.location_id || null, status: form.status,
      starting_price: form.starting_price ? Number(form.starting_price) : null,
      currency: form.currency, completion_date: form.completion_date || null,
      amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()) : [],
      is_featured: form.is_featured,
    }
    if (form.status === 'published' && !editing) payload.published_at = new Date().toISOString()

    if (editing) {
      const { error } = await supabase.from('developments').update(payload).eq('id', editing.id)
      if (error) { toast('Could not save development.', 'error'); return }
    } else {
      const { error } = await supabase.from('developments').insert(payload)
      if (error) { toast('Could not create development.', 'error'); return }
    }
    toast('Development saved.', 'success')
    setShowForm(false)
    loadDevelopments()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('developments').delete().eq('id', deleteTarget.id)
    if (error) { toast('Could not delete.', 'error') } else { toast('Development deleted.', 'success'); setDeleteTarget(null); loadDevelopments() }
  }

  async function toggleFeatured(d: Development) {
    await supabase.from('developments').update({ is_featured: !d.is_featured }).eq('id', d.id)
    loadDevelopments()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink-900">Developments</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-warm-white text-sm hover:bg-ink-800">
          <Plus size={16} /> Add Development
        </button>
      </div>

      <div className="bg-warm-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Developer</th>
              <th className="py-3 px-4">Starting Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Featured</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-8 text-center text-stone-400">Loading...</td></tr>
            ) : developments.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-stone-400">No developments found.</td></tr>
            ) : developments.map(d => (
              <tr key={d.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="py-3 px-4">
                  {d.main_image_path ? <img src={d.main_image_path} alt={d.name} className="w-14 h-14 object-cover" /> : <div className="w-14 h-14 bg-stone-100" />}
                </td>
                <td className="py-3 px-4 font-medium text-ink-900">{d.name}</td>
                <td className="py-3 px-4 text-stone-600">{d.developer ?? '-'}</td>
                <td className="py-3 px-4 text-ink-900">{d.starting_price ? formatPrice(d.starting_price, d.currency) : '-'}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 ${d.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>{d.status}</span>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => toggleFeatured(d)} className="text-stone-400 hover:text-accent">
                    <Star size={16} className={d.is_featured ? 'fill-accent text-accent' : ''} />
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(d)} className="text-stone-400 hover:text-ink-900"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteTarget(d)} className="text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Development' : 'Add Development'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) }) }} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Developer</label>
            <input type="text" value={form.developer} onChange={(e) => setForm({ ...form, developer: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Main Image URL</label>
            <input type="text" value={form.main_image_path} onChange={(e) => setForm({ ...form, main_image_path: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Location</label>
              <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm">
                <option value="">Select</option>
                {locations.map(l => <option key={l.id} value={l.id}>{[l.neighborhood, l.city].filter(Boolean).join(', ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Featured</label>
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">Featured</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Starting Price</label>
              <input type="number" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm">
                <option value="USD">USD</option>
                <option value="RWF">RWF</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Completion Date</label>
              <input type="date" value={form.completion_date} onChange={(e) => setForm({ ...form, completion_date: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Amenities (comma-separated)</label>
            <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" placeholder="Pool, Gym, Parking" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-ink-900 text-warm-white text-sm">Save</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Development" size="sm">
        <p className="text-sm text-stone-600 mb-6">Delete "{deleteTarget?.name}"? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-warm-white text-sm">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
