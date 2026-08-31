import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import Modal from '../../components/Modal'
import type { Location } from '../../lib/types'

const emptyForm = { country: 'Rwanda', city: '', district: '', neighborhood: '', address: '', latitude: '', longitude: '' }

export default function AdminLocations() {
  const { toast } = useToast()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => { loadLocations() }, [])

  async function loadLocations() {
    setLoading(true)
    const { data } = await supabase.from('locations').select('*').order('city')
    setLocations(data ?? [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  function openEdit(l: Location) {
    setEditing(l)
    setForm({
      country: l.country ?? 'Rwanda', city: l.city ?? '', district: l.district ?? '',
      neighborhood: l.neighborhood ?? '', address: l.address ?? '',
      latitude: l.latitude ? String(l.latitude) : '', longitude: l.longitude ? String(l.longitude) : '',
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.city) { toast('City is required.', 'error'); return }
    const payload: any = {
      country: form.country, city: form.city, district: form.district || null,
      neighborhood: form.neighborhood || null, address: form.address || null,
      latitude: form.latitude ? Number(form.latitude) : null, longitude: form.longitude ? Number(form.longitude) : null,
    }
    if (editing) {
      const { error } = await supabase.from('locations').update(payload).eq('id', editing.id)
      if (error) { toast('Could not save location.', 'error'); return }
      toast('Location updated.', 'success')
    } else {
      const { error } = await supabase.from('locations').insert(payload)
      if (error) { toast('Could not create location.', 'error'); return }
      toast('Location added.', 'success')
    }
    setShowForm(false)
    loadLocations()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('locations').delete().eq('id', deleteTarget.id)
    if (error) { toast('Could not delete.', 'error') } else { toast('Location deleted.', 'success'); setDeleteTarget(null); loadLocations() }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink-900">Locations</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-warm-white text-sm hover:bg-ink-800">
          <Plus size={16} /> Add Location
        </button>
      </div>

      <div className="bg-warm-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4">Neighborhood</th>
              <th className="py-3 px-4">Country</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-stone-400">Loading...</td></tr>
            ) : locations.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-stone-400">No locations found.</td></tr>
            ) : locations.map(l => (
              <tr key={l.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="py-3 px-4 font-medium text-ink-900">{l.city}</td>
                <td className="py-3 px-4 text-stone-600">{l.district ?? '-'}</td>
                <td className="py-3 px-4 text-stone-600">{l.neighborhood ?? '-'}</td>
                <td className="py-3 px-4 text-stone-600">{l.country}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(l)} className="text-stone-400 hover:text-ink-900" aria-label="Edit"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteTarget(l)} className="text-stone-400 hover:text-red-500" aria-label="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Location' : 'Add Location'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">City *</label>
              <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Country</label>
              <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">District</label>
              <input type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Neighborhood</label>
              <input type="text" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-ink-900 text-warm-white text-sm">{editing ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Location" size="sm">
        <p className="text-sm text-stone-600 mb-6">Delete "{deleteTarget?.city}"? Properties using this location will have their location cleared.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-warm-white text-sm">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
