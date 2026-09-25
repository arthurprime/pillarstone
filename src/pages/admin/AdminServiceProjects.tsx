import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ExternalLink, Upload, X } from 'lucide-react'
import { supabase, STORAGE_BUCKETS, getPublicImageUrl } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import Modal from '../../components/Modal'
import { slugify } from '../../lib/utils'
import { getServiceProjectPhotos } from '../../lib/data'
import type { ServiceProject } from '../../lib/types'

const emptyForm = {
  category: 'construction' as 'construction' | 'interior',
  title: '',
  slug: '',
  description: '',
  location: '',
  status: 'published',
  sort_order: '0',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_IMAGES = 20

const SERVICE_PROJECTS_SQL = `CREATE TABLE IF NOT EXISTS public.service_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('construction', 'interior')),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  location text,
  image_path text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order int NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.service_projects(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_project_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_projects_select_published" ON public.service_projects;
CREATE POLICY "service_projects_select_published" ON public.service_projects FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "service_projects_manage_admin" ON public.service_projects;
CREATE POLICY "service_projects_manage_admin" ON public.service_projects FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "service_project_images_select" ON public.service_project_images;
CREATE POLICY "service_project_images_select" ON public.service_project_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_projects p
      WHERE p.id = project_id
        AND (p.status = 'published' OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "service_project_images_manage_admin" ON public.service_project_images;
CREATE POLICY "service_project_images_manage_admin" ON public.service_project_images FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT ON public.service_projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_projects TO authenticated;
GRANT SELECT ON public.service_project_images TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_project_images TO authenticated;

NOTIFY pgrst, 'reload schema';`

function isMissingTable(message?: string) {
  if (!message) return false
  const m = message.toLowerCase()
  return m.includes('schema cache') || m.includes('does not exist') || m.includes('could not find the table')
}

function saveErrorMessage(message?: string) {
  if (!message) return 'Could not save project.'
  if (isMissingTable(message)) {
    return 'The projects table is missing in Supabase. Run the SQL shown on this page, then refresh.'
  }
  if (message.includes('duplicate key') || message.includes('unique')) {
    return 'That slug is already used. Change the slug and try again.'
  }
  if (message.toLowerCase().includes('row-level security')) {
    return 'Supabase blocked the save (RLS). Confirm this account is admin in profiles, then try again.'
  }
  return message
}

export default function AdminServiceProjects() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<ServiceProject[]>([])
  const [loading, setLoading] = useState(true)
  const [schemaMissing, setSchemaMissing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'construction' | 'interior'>('all')
  const [editing, setEditing] = useState<ServiceProject | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ServiceProject | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    const withImages = await supabase
      .from('service_projects')
      .select('*, service_project_images(*)')
      .order('category')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!withImages.error) {
      setSchemaMissing(false)
      setProjects((withImages.data as ServiceProject[]) ?? [])
      setLoading(false)
      return
    }

    if (isMissingTable(withImages.error.message) && withImages.error.message.includes('service_project_images')) {
      const fallback = await supabase
        .from('service_projects')
        .select('*')
        .order('category')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (!fallback.error) {
        setSchemaMissing(false)
        setProjects((fallback.data as ServiceProject[]) ?? [])
        setLoading(false)
        return
      }
      setSchemaMissing(isMissingTable(fallback.error.message))
      toast(saveErrorMessage(fallback.error.message), 'error')
      setProjects([])
      setLoading(false)
      return
    }

    setSchemaMissing(isMissingTable(withImages.error.message))
    toast(saveErrorMessage(withImages.error.message), 'error')
    setProjects([])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ ...emptyForm, category: filter === 'interior' ? 'interior' : 'construction' })
    setPhotos([])
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
      status: p.status,
      sort_order: String(p.sort_order ?? 0),
    })
    setPhotos(getServiceProjectPhotos(p))
    setShowForm(true)
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList)
    if (incoming.length === 0) return

    const remaining = MAX_IMAGES - photos.length
    if (remaining <= 0) {
      toast(`You can add up to ${MAX_IMAGES} photos per project.`, 'error')
      return
    }

    const files = incoming.slice(0, remaining)
    if (incoming.length > remaining) {
      toast(`Only ${remaining} more photo(s) can be added (limit ${MAX_IMAGES}).`, 'error')
    }

    setUploading(true)
    const uploaded: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(`Uploading ${i + 1} of ${files.length}…`)

      if (!file.type.startsWith('image/')) {
        toast(`${file.name} is not a supported image.`, 'error')
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        toast(`${file.name} exceeds the 10MB limit.`, 'error')
        continue
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `service-projects/${fileName}`
      const { error } = await supabase.storage.from(STORAGE_BUCKETS.PROPERTY_IMAGES).upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      })
      if (error) {
        toast(`Could not upload ${file.name}: ${error.message}`, 'error')
      } else {
        uploaded.push(getPublicImageUrl(STORAGE_BUCKETS.PROPERTY_IMAGES, path))
      }
    }

    if (uploaded.length > 0) {
      setPhotos(prev => [...prev, ...uploaded])
      toast(`${uploaded.length} photo(s) added.`, 'success')
    }

    setUploading(false)
    setUploadProgress('')
  }

  async function saveGallery(projectId: string, paths: string[]) {
    const { error: delError } = await supabase
      .from('service_project_images')
      .delete()
      .eq('project_id', projectId)
    if (delError) {
      return isMissingTable(delError.message) ? null : delError
    }
    if (paths.length === 0) return null
    const { error } = await supabase.from('service_project_images').insert(
      paths.map((image_path, sort_order) => ({ project_id: projectId, image_path, sort_order }))
    )
    if (error && isMissingTable(error.message)) return null
    return error
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast('Title is required.', 'error')
      return
    }
    setSaving(true)
    const slug = form.slug.trim() || slugify(form.title)
    const payload: Record<string, unknown> = {
      category: form.category,
      title: form.title.trim(),
      slug,
      description: form.description?.trim() || null,
      location: form.location?.trim() || null,
      image_path: photos[0] ?? null,
      status: form.status,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    }
    if (form.status === 'published') {
      payload.published_at = editing?.published_at ?? new Date().toISOString()
    }

    let projectId = editing?.id
    if (editing) {
      const { error } = await supabase.from('service_projects').update(payload).eq('id', editing.id)
      if (error) {
        toast(saveErrorMessage(error.message), 'error')
        setSaving(false)
        return
      }
    } else {
      const { data, error } = await supabase.from('service_projects').insert(payload).select('id').single()
      if (error) {
        toast(saveErrorMessage(error.message), 'error')
        setSaving(false)
        return
      }
      projectId = data?.id
    }

    if (projectId) {
      const galleryError = await saveGallery(projectId, photos)
      if (galleryError) {
        toast('Project saved, but extra photos could not be linked. Run the latest SQL in Supabase, then try again.', 'error')
        setSaving(false)
        return
      }
    }

    toast('Project saved. Published photos appear on Construction and Interiors.', 'success')
    setShowForm(false)
    setSaving(false)
    loadProjects()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('service_projects').delete().eq('id', deleteTarget.id)
    if (error) toast(saveErrorMessage(error.message), 'error')
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
            Upload project photos from your computer. Published projects appear on Construction and Interiors.
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-ink-900 text-warm-white text-sm hover:bg-ink-800 transition-colors">
          <Plus size={16} /> Add Project
        </button>
      </div>

      {schemaMissing && (
        <div className="mb-6 border border-amber-300 bg-amber-50 p-4 text-sm text-ink-800">
          <p className="font-medium mb-2">Supabase is missing the construction/interior tables.</p>
          <p className="mb-3 text-stone-600">
            Open Supabase → SQL Editor → New query, paste this, run it, then refresh this page.
          </p>
          <textarea
            readOnly
            value={SERVICE_PROJECTS_SQL}
            className="w-full h-40 text-xs font-mono bg-ink-950 text-stone-200 p-3"
          />
        </div>
      )}

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
              <th className="py-3 px-4">Photos</th>
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
            ) : visible.map(p => {
              const cover = getServiceProjectPhotos(p)[0]
              const count = getServiceProjectPhotos(p).length
              return (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-3 px-4">
                    {cover ? (
                      <div className="relative w-14 h-14">
                        <img src={cover} alt="" className="w-14 h-14 object-cover" />
                        {count > 1 && (
                          <span className="absolute bottom-0 right-0 bg-ink-900 text-warm-white text-[10px] px-1">{count}</span>
                        )}
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-stone-100" />
                    )}
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
              )
            })}
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
            <label className="block text-xs uppercase text-stone-500 mb-2">Photos</label>
            <p className="text-xs text-stone-500 mb-2">Choose files from your computer. The first photo is the cover.</p>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files)
              }}
              className={`flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded cursor-pointer transition-colors ${
                dragOver || uploading ? 'border-ink-700 bg-stone-50' : 'border-stone-300 hover:border-ink-700 hover:bg-stone-50'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  if (e.target.files) uploadFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <Upload size={22} className="text-stone-400 mb-2" />
              <span className="text-sm text-ink-700">
                {uploading ? uploadProgress || 'Uploading…' : 'Drop photos here or click to choose'}
              </span>
              <span className="text-xs text-stone-400 mt-1">JPEG, PNG, WebP · up to 10MB each · up to {MAX_IMAGES} photos</span>
            </label>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {photos.map((src, i) => (
                  <div key={`${src}-${i}`} className="relative aspect-square bg-stone-100 border border-stone-200">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[10px] uppercase bg-ink-900 text-warm-white px-1.5 py-0.5">Cover</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white flex items-center justify-center"
                      aria-label="Remove photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
            <button type="submit" disabled={saving || uploading} className="px-4 py-2 bg-ink-900 text-warm-white text-sm disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
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
