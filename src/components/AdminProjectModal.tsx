import { useState, useEffect } from 'react'
import { Upload, X, Check } from 'lucide-react'
import Modal from './Modal'
import { supabase, STORAGE_BUCKETS, getPublicImageUrl } from '../lib/supabase'
import { useToast } from './Toast'
import { slugify } from '../lib/utils'
import type { ServiceProject } from '../lib/types'

interface AdminProjectModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  defaultCategory?: 'construction' | 'interior'
  projectToEdit?: ServiceProject | null
}

const initialForm = {
  category: 'construction' as 'construction' | 'interior',
  title: '',
  slug: '',
  description: '',
  location: '',
  image_path: '',
  status: 'published',
  sort_order: '0',
}

export default function AdminProjectModal({
  open,
  onClose,
  onSaved,
  defaultCategory = 'construction',
  projectToEdit,
}: AdminProjectModalProps) {
  const { toast } = useToast()
  const [form, setForm] = useState(initialForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (projectToEdit) {
      setForm({
        category: projectToEdit.category,
        title: projectToEdit.title,
        slug: projectToEdit.slug,
        description: projectToEdit.description ?? '',
        location: projectToEdit.location ?? '',
        image_path: projectToEdit.image_path ?? '',
        status: projectToEdit.status,
        sort_order: String(projectToEdit.sort_order ?? 0),
      })
    } else {
      setForm({
        ...initialForm,
        category: defaultCategory,
      })
    }
  }, [projectToEdit, defaultCategory, open])

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file (JPEG, PNG, WebP).', 'error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('Image must be under 10MB.', 'error')
      return
    }

    setUploading(true)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `service-projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    let { error } = await supabase.storage.from(STORAGE_BUCKETS.SITE_ASSETS).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    })

    let bucketUsed: string = STORAGE_BUCKETS.SITE_ASSETS
    // Fallback to property images bucket if site-assets bucket policy fails
    if (error) {
      const fallback = await supabase.storage.from(STORAGE_BUCKETS.PROPERTY_IMAGES).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      })
      if (!fallback.error) {
        error = null
        bucketUsed = STORAGE_BUCKETS.PROPERTY_IMAGES
      }
    }

    setUploading(false)
    if (error) {
      toast(`Upload failed: ${error.message}`, 'error')
      return
    }

    const publicUrl = getPublicImageUrl(bucketUsed, fileName)
    setForm(prev => ({ ...prev, image_path: publicUrl }))
    toast('Image uploaded successfully.', 'success')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast('Please enter a project title.', 'error')
      return
    }

    setSaving(true)
    const slug = form.slug.trim() || slugify(form.title)
    const payload: Record<string, unknown> = {
      category: form.category,
      title: form.title.trim(),
      slug,
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      image_path: form.image_path.trim() || null,
      status: form.status,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    }

    if (form.status === 'published') {
      payload.published_at = projectToEdit?.published_at ?? new Date().toISOString()
    }

    const query = projectToEdit
      ? supabase.from('service_projects').update(payload).eq('id', projectToEdit.id)
      : supabase.from('service_projects').insert(payload)

    const { error } = await query
    setSaving(false)

    if (error) {
      toast(error.message, 'error')
      return
    }

    toast(
      projectToEdit
        ? 'Project updated successfully.'
        : `New ${form.category} project uploaded and live on the website!`,
      'success'
    )
    onSaved()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={projectToEdit ? `Edit ${form.category} Project` : `Upload New ${form.category === 'construction' ? 'Construction' : 'Interior'} Project`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e =>
                setForm({
                  ...form,
                  title: e.target.value,
                  slug: projectToEdit ? form.slug : slugify(e.target.value),
                })
              }
              placeholder="e.g. Modern Villa in Nyarutarama"
              className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={e =>
                setForm({
                  ...form,
                  category: e.target.value as 'construction' | 'interior',
                })
              }
              className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-900"
            >
              <option value="construction">Construction</option>
              <option value="interior">Interior Design</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Kigali, Nyarutarama"
              className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-900"
            >
              <option value="published">Published (Live on Website)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={e => setForm({ ...form, sort_order: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Brief details about the project, materials, or scope of work..."
            className="w-full px-3 py-2 border border-stone-300 text-sm resize-none focus:outline-none focus:border-ink-900"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
            Project Photo
          </label>
          <div className="border border-dashed border-stone-300 p-4 bg-stone-50/50 mb-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-warm-white border border-stone-300 text-xs font-medium text-ink-900 hover:bg-stone-100 cursor-pointer shadow-sm">
                <Upload size={14} />
                <span>Upload from computer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file)
                  }}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-stone-400">or enter an image URL below</span>
              {uploading && (
                <span className="text-xs text-accent font-medium animate-pulse">
                  Uploading image...
                </span>
              )}
            </div>
            <input
              type="text"
              value={form.image_path}
              onChange={e => setForm({ ...form, image_path: e.target.value })}
              placeholder="https://images.pexels.com/... or uploaded URL"
              className="mt-3 w-full px-3 py-2 border border-stone-300 text-xs focus:outline-none focus:border-ink-900 bg-warm-white"
            />
          </div>

          {form.image_path && (
            <div className="relative mt-2 aspect-[16/9] max-h-48 overflow-hidden rounded bg-stone-100 border border-stone-200">
              <img
                src={form.image_path}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, image_path: '' })}
                className="absolute top-2 right-2 p-1 bg-ink-950/70 hover:bg-ink-950 text-warm-white rounded-full"
                title="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <p className="text-xs text-stone-500">
            {form.status === 'published' ? (
              <span className="text-green-700 flex items-center gap-1 font-medium">
                <Check size={14} /> Will be visible to all website visitors immediately
              </span>
            ) : (
              <span>Will be saved as draft</span>
            )}
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-sm hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2 bg-ink-900 hover:bg-ink-800 text-warm-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : projectToEdit ? 'Save Changes' : 'Upload to Website'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
