import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import Modal from '../../components/Modal'
import type { Agent } from '../../lib/types'

export default function AdminAgents() {
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Agent | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null)
  const [form, setForm] = useState({
    name: '', photo_url: '', email: '', phone: '', bio: '', role: '',
    facebook_url: '', twitter_url: '', linkedin_url: '', instagram_url: '', is_active: true,
  })

  useEffect(() => { loadAgents() }, [])

  async function loadAgents() {
    setLoading(true)
    const { data } = await supabase.from('agents').select('*').order('sort_order')
    setAgents(data ?? [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', photo_url: '', email: '', phone: '', bio: '', role: '', facebook_url: '', twitter_url: '', linkedin_url: '', instagram_url: '', is_active: true })
    setShowForm(true)
  }

  function openEdit(a: Agent) {
    setEditing(a)
    setForm({
      name: a.name, photo_url: a.photo_url ?? '', email: a.email ?? '', phone: a.phone ?? '',
      bio: a.bio ?? '', role: a.role ?? '', facebook_url: a.facebook_url ?? '',
      twitter_url: a.twitter_url ?? '', linkedin_url: a.linkedin_url ?? '',
      instagram_url: a.instagram_url ?? '', is_active: a.is_active,
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { toast('Name is required.', 'error'); return }
    const payload: any = {
      name: form.name, photo_url: form.photo_url || null, email: form.email || null,
      phone: form.phone || null, bio: form.bio || null, role: form.role || null,
      facebook_url: form.facebook_url || null, twitter_url: form.twitter_url || null,
      linkedin_url: form.linkedin_url || null, instagram_url: form.instagram_url || null,
      is_active: form.is_active,
    }
    if (editing) {
      const { error } = await supabase.from('agents').update(payload).eq('id', editing.id)
      if (error) { toast('Could not save agent.', 'error'); return }
    } else {
      const { error } = await supabase.from('agents').insert(payload)
      if (error) { toast('Could not create agent.', 'error'); return }
    }
    toast('Agent saved.', 'success')
    setShowForm(false)
    loadAgents()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('agents').delete().eq('id', deleteTarget.id)
    if (error) { toast('Could not delete.', 'error') } else { toast('Agent deleted.', 'success'); setDeleteTarget(null); loadAgents() }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink-900">Agents</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-warm-white text-sm hover:bg-ink-800">
          <Plus size={16} /> Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-stone-400 col-span-full text-center py-8">Loading...</p>
        ) : agents.length === 0 ? (
          <p className="text-stone-400 col-span-full text-center py-8">No agents found.</p>
        ) : agents.map(a => (
          <div key={a.id} className="bg-warm-white border border-stone-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              {a.photo_url ? <img src={a.photo_url} alt={a.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center font-display text-lg text-stone-500">{a.name.charAt(0)}</div>}
              <div>
                <p className="font-medium text-ink-900">{a.name}</p>
                <p className="text-xs text-stone-500">{a.role ?? '-'}</p>
                <span className={`text-xs ${a.is_active ? 'text-green-600' : 'text-stone-400'}`}>{a.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(a)} className="text-stone-400 hover:text-ink-900"><Pencil size={16} /></button>
              <button onClick={() => setDeleteTarget(a)} className="text-stone-400 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Agent' : 'Add Agent'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Role</label>
              <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Photo URL</label>
            <input type="text" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Facebook URL</label>
              <input type="text" value={form.facebook_url} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Twitter URL</label>
              <input type="text" value={form.twitter_url} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">LinkedIn URL</label>
              <input type="text" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Instagram URL</label>
              <input type="text" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </label>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-ink-900 text-warm-white text-sm">Save</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Agent" size="sm">
        <p className="text-sm text-stone-600 mb-6">Delete "{deleteTarget?.name}"?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-warm-white text-sm">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
