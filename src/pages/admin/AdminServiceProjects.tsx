import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { supabase, STORAGE_BUCKETS, getPublicImageUrl } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import Modal from '../../components/Modal'
import { slugify } from '../../lib/utils'
import type { ServiceProject } from '../../lib/types'

const emptyForm = {
  category: 'construction' as 'construction' | 'interior',
  title: '',
  slug: '',
  description: '',
  location: '',
  image_path: '',
  status: 'published',
  sort_order: '0',
}

export default function AdminServiceProjects() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<ServiceProject[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'construction' | 'interior'>('all')
  const [editing, setEditing] = useState<ServiceProject | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ServiceProject | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    const { data, error } = await supabase
      .from('service_projects')
      .select('*')
      .order('category')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) {
      toast(error.message.includes('schema cache') || error.message.includes('does not exist')
        ? 'Run the service_projects migration in Supabase, then refresh.'
        : 'Could not load projects.', 'error')
      setProjects([])
    } else {
      setProjects((data as ServiceProject[]) ?? [])
    }
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ ...emptyForm, category: filter === 'interior' ? 'interior' : 'construction' })
    setShowForm(true)
  }

  function openEdit(p: ServiceProject) {
    setEditing(p)
    setForm({
      category: p.category,
      title: p.title,
      slug: p.slug,
      description: p.description ?? '',
      location: p.location ?? '',
      image_path: p.image_path ?? '',
      status: p.status,
      sort_order: String(p.sort_order ?? 0),
    })
    setShowForm(true)
  }

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file.', 'error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('Image must be under 10MB.', 'error')
      return
    }
    setUploading(true)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `service-projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    let bucket: string = STORAGE_BUCKETS.SITE_ASSETS
    let { error } = await supabase.storage.from(STORAGE_BUCKETS.SITE_ASSETS).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    })

    if (error) {
      const fb = await supabase.storage.from(STORAGE_BUCKETS.PROPERTY_IMAGES).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      })
      if (!fb.error) {
        error = null
        bucket = STORAGE_BUCKETS.PROPERTY_IMAGES
      }
    }

    setUploading(false)
    if (error) {
      toast(`Could not upload: ${error.message}`, 'error')
      return
    }
    setForm(prev => ({ ...prev, image_path: getPublicImageUrl(bucket, path) }))
    toast('Image uploaded successfully.', 'success')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast('Title is required.', 'error')
      return
    }
    const slug = form.slug.trim() || slugify(form.title)
    const payload: Record<string, unknown> = {
      category: form.category,
      title: form.title.trim(),
      slug,
      description: form.description?.trim() || null,
      location: form.location?.trim() || null,
      image_path: form.image_path?.trim() || null,
      status: form.status,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    }
    if (form.status === 'published') {
      payload.published_at = editing?.published_at ?? new Date().toISOString()
    }

    const query = editing
      ? supabase.from('service_projects').update(payload).eq('id', editing.id)
      : supabase.from('service_projects').insert(payload)
    const { error } = await query
    if (error) {
      toast(error.message, 'error')
      return
    }
    toast('Project saved! It is now live on the main website.', 'success')
    setShowForm(false)
    loadProjects()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('service_projects').delete().eq('id', deleteTarget.id)
    if (error) toast('Could not delete.', 'error')
    else {
      toast('Project deleted.', 'success')
      setDeleteTarget(null)
      loadProjects()
    }
  }

  const visible = filter === 'all' ? projects : projects.filter(p => p.category === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Construction & Interior Projects</h2>
          <p className="text-sm text-stone-500 mt-1">
            Upload and manage projects here. All published projects appear automatically on the main website.
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-warm-white text-sm hover:bg-ink-800 transition-colors">
          <Plus size={16} /> Add Project
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link
          to="/construction"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-ink-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded transition-colors"
        >
          <span>View Construction page on main website</span>
          <ExternalLink size={12} />
        </Link>
        <Link
          to="/interiors"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-ink-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded transition-colors"
        >
          <span>View Interiors page on main website</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'construction', 'interior'] as const).map(key => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-sm capitalize transition-colors ${filter === key ? 'bg-ink-900 text-warm-white' : 'border border-stone-300 text-ink-700 hover:bg-stone-100'}`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="bg-warm-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-stone-400">Loading...</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-stone-400">No projects yet. Add one for visitors to see.</td></tr>
            ) : visible.map(p => (
              <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="py-3 px-4">
                  {p.image_path ? <img src={p.image_path} alt="" className="w-14 h-14 object-cover" /> : <div className="w-14 h-14 bg-stone-100" />}
                </td>
                <td className="py-3 px-4 font-medium text-ink-900">{p.title}</td>
                <td className="py-3 px-4 capitalize text-stone-600">{p.category}</td>
                <td className="py-3 px-4 text-stone-600">{p.location ?? '-'}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>{p.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEdit(p)} className="text-stone-400 hover:text-ink-900" aria-label="Edit"><Pencil size={16} /></button>
                    <button type="button" onClick={() => setDeleteTarget(p)} className="text-stone-400 hover:text-red-500" aria-label="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Project' : 'Add Project'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as 'construction' | 'interior' })} className="w-full px-3 py-2 border border-stone-300 text-sm">
                <option value="construction">Construction</option>
                <option value="interior">Interior</option>
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
              <label className="block text-xs uppercase text-stone-500 mb-1">Sort order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" placeholder="Kigali, Nyarutarama" />
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs uppercase text-stone-500 mb-1">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
              className="block w-full text-sm text-stone-600 mb-2"
            />
            {uploading && <p className="text-xs text-stone-500 mb-2">Uploading…</p>}
            <input
              type="text"
              value={form.image_path}
              onChange={(e) => setForm({ ...form, image_path: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 text-sm"
              placeholder="Or paste an image URL"
            />
            {form.image_path && (
              <img src={form.image_path} alt="" className="mt-3 w-full max-h-48 object-cover border border-stone-200" />
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-ink-900 text-warm-white text-sm">Save</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project" size="sm">
        <p className="text-sm text-stone-600 mb-6">Delete “{deleteTarget?.title}”? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
          <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-warm-white text-sm">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
