import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sofa, Palette, Layout, Lamp, Store, Sparkles, Plus, ExternalLink } from 'lucide-react'
import ServiceInquiryForm from '../components/ServiceInquiryForm'
import ServiceProjectGrid from '../components/ServiceProjectGrid'
import PageHero from '../components/PageHero'
import Seo from '../components/Seo'
import Modal from '../components/Modal'
import AdminProjectModal from '../components/AdminProjectModal'
import { useAuth } from '../lib/auth'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import { getServiceProjects } from '../lib/data'
import { HERO_IMAGES, PAGE_SEO } from '../lib/pageContent'
import type { ServiceProject } from '../lib/types'

const offerings = [
  {
    icon: Palette,
    title: 'Interior design',
    description: 'A full design direction for your home or workspace — materials, colour, light, and how rooms actually get used.',
  },
  {
    icon: Layout,
    title: 'Space planning',
    description: 'Layouts that make small rooms feel generous and large rooms feel purposeful, without wasting square metres.',
  },
  {
    icon: Lamp,
    title: 'Kitchens & bathrooms',
    description: 'The rooms you use every day, specified for durability, storage, and a finish that still looks considered years later.',
  },
  {
    icon: Sofa,
    title: 'Furniture & styling',
    description: 'Sourcing, custom pieces, and a final layer of styling so the space is ready to live in, not just photographed.',
  },
  {
    icon: Store,
    title: 'Commercial interiors',
    description: 'Offices, showrooms, and hospitality spaces that support how your team and clients actually move through them.',
  },
  {
    icon: Sparkles,
    title: 'Turnkey fit-out',
    description: 'From concept to installation: we coordinate contractors, joinery, and finishes so you get one accountable result.',
  },
]

export default function InteriorPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const isStaff = profile?.role === 'admin' || profile?.role === 'editor'

  const [projects, setProjects] = useState<ServiceProject[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<ServiceProject | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ServiceProject | null>(null)

  function loadProjects() {
    getServiceProjects('interior').then(setProjects)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('service_projects').delete().eq('id', deleteTarget.id)
    if (error) {
      toast('Could not delete project.', 'error')
    } else {
      toast('Project deleted successfully.', 'success')
      setDeleteTarget(null)
      loadProjects()
    }
  }

  return (
    <div>
      <Seo {...PAGE_SEO.interiors} />
      <PageHero
        eyebrow="Interior design in Kigali"
        title="Interior design and fit-out in Rwanda"
        description="Pillarstone interiors are designed for how people live and work — calm materials, practical layouts, and details that hold up after the photos are taken."
        image={HERO_IMAGES.interiors}
        imageAlt="Interior living space in Kigali"
      />

      <section className="py-20">
        <div className="max-w-site container-px">
          <div className="max-w-2xl mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">What we design</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-4">Homes and workplaces, considered inside</h2>
            <p className="text-ink-500 leading-relaxed">
              We work on new builds alongside our construction team, and on existing properties that need a clearer layout, better light, or a complete interior refresh.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offerings.map(item => (
              <div key={item.title} className="border border-stone-200 p-8 bg-warm-white">
                <item.icon size={28} className="text-stone-400 mb-4" />
                <h3 className="font-display text-xl text-ink-900 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-site container-px">
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <div className="max-w-2xl">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Completed work</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-4">Interior projects</h2>
              <p className="text-ink-500 leading-relaxed">
                Homes and workplaces we have designed and fitted out in Kigali.
              </p>
            </div>

            {isStaff && (
              <div className="flex items-center gap-3 p-3 bg-warm-white border border-stone-300 shadow-sm rounded">
                <span className="text-[11px] uppercase tracking-wider text-ink-700 font-semibold px-2 py-0.5 bg-stone-100 rounded">
                  Admin
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setProjectToEdit(null)
                    setModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-ink-900 hover:bg-ink-800 text-warm-white text-xs tracking-wider uppercase font-medium transition-colors"
                >
                  <Plus size={14} />
                  <span>Upload Project</span>
                </button>
                <Link
                  to="/admin/projects"
                  className="flex items-center gap-1 px-3 py-2 border border-stone-300 hover:border-ink-900 text-xs text-ink-700 transition-colors"
                >
                  <span>Dashboard</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            )}
          </div>

          <ServiceProjectGrid
            projects={projects}
            emptyHint="New interior projects will appear here once they are published."
            isAdmin={isStaff}
            onEdit={p => {
              setProjectToEdit(p)
              setModalOpen(true)
            }}
            onDelete={p => setDeleteTarget(p)}
          />
        </div>
      </section>

      {/* Admin Project Upload / Edit Modal */}
      {isStaff && (
        <>
          <AdminProjectModal
            open={modalOpen}
            onClose={() => {
              setModalOpen(false)
              setProjectToEdit(null)
            }}
            onSaved={loadProjects}
            defaultCategory="interior"
            projectToEdit={projectToEdit}
          />

          <Modal
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            title="Delete Project"
            size="sm"
          >
            <p className="text-sm text-stone-600 mb-6">
              Delete “{deleteTarget?.title}”? This project will be permanently removed from the website.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-stone-300 text-sm hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-warm-white text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </Modal>
        </>
      )}

      <section className="py-20">
        <div className="max-w-site container-px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] overflow-hidden order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Interior design details"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Approach</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-6">Design that belongs to the building</h2>
              <p className="text-ink-500 leading-relaxed mb-4">
                Interiors work best when they are planned with the architecture, not applied after. We start with how you use each room, then choose finishes, joinery, and furniture that suit the light and the climate.
              </p>
              <p className="text-ink-500 leading-relaxed">
                For clients buying or building with Pillarstone, we can take the project from empty shell to a space you can move into — one conversation, one team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-site container-px">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Start a project</p>
              <h2 className="font-display text-3xl text-ink-900 mb-4">Tell us about the space</h2>
              <p className="text-ink-500 leading-relaxed mb-6">
                Share the property type, what is not working today, and whether you need a full redesign or a focused update. We will follow up to arrange a consultation.
              </p>
            </div>
            <ServiceInquiryForm defaultSubject="Interior design consultation" />
          </div>
        </div>
      </section>
    </div>
  )
}
