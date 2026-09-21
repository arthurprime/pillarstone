import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HardHat, Building2, Hammer, ClipboardList, Layers, Home, Plus, ExternalLink } from 'lucide-react'
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
    icon: Home,
    title: 'Residential builds',
    description: 'Houses, villas, and townhomes planned and built to live in — from foundation through handover.',
  },
  {
    icon: Building2,
    title: 'Commercial projects',
    description: 'Offices, retail, and mixed-use buildings delivered with a clear programme and accountable site management.',
  },
  {
    icon: Hammer,
    title: 'Renovations & extensions',
    description: 'Thoughtful upgrades to existing properties: extra rooms, structural work, and complete remodels.',
  },
  {
    icon: ClipboardList,
    title: 'Project management',
    description: 'One team coordinating contractors, materials, timelines, and quality so you are not managing the site yourself.',
  },
  {
    icon: Layers,
    title: 'Quality & finishes',
    description: 'Materials and workmanship checked at each stage, so the building matches what was agreed — not a surprise at the end.',
  },
  {
    icon: HardHat,
    title: 'Site to structure',
    description: 'From land assessment and drawings through construction, we stay with the project until it is ready to occupy.',
  },
]

export default function ConstructionPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const isStaff = profile?.role === 'admin' || profile?.role === 'editor'

  const [projects, setProjects] = useState<ServiceProject[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<ServiceProject | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ServiceProject | null>(null)

  function loadProjects() {
    getServiceProjects('construction').then(setProjects)
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
      <Seo {...PAGE_SEO.construction} />
      <PageHero
        eyebrow="Construction company in Kigali"
        title="House building and construction in Rwanda"
        description="Pillarstone plans and builds residential and commercial projects in Kigali — with clear timelines, honest updates, and work you can inspect at every stage."
        image={HERO_IMAGES.construction}
        imageAlt="Construction site in Kigali"
      />

      <section className="py-20">
        <div className="max-w-site container-px">
          <div className="max-w-2xl mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">What we build</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-4">From first drawings to handover</h2>
            <p className="text-ink-500 leading-relaxed">
              Whether you have land ready for a new home or a building that needs a second life, we coordinate design, construction, and finishing so the result is liveable — not just complete.
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
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-4">Construction projects</h2>
              <p className="text-ink-500 leading-relaxed">
                Recent builds and renovations in Kigali and across Rwanda.
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
            emptyHint="New construction projects will appear here once they are published."
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
            defaultCategory="construction"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">How we work</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-6">A considered process</h2>
              <ol className="space-y-6">
                {[
                  { step: '01', title: 'Brief & site visit', body: 'We walk the land or building with you, understand budget and use, and flag constraints early.' },
                  { step: '02', title: 'Design & programme', body: 'Plans, materials, and a construction timeline you can follow — with costs discussed before work starts.' },
                  { step: '03', title: 'Build & inspect', body: 'Site supervision, scheduled progress reviews, and quality checks at each structural and finishing stage.' },
                  { step: '04', title: 'Handover', body: 'Snagging, documentation, and a building that is ready to occupy or list.' },
                ].map(item => (
                  <li key={item.step} className="flex gap-4">
                    <span className="font-display text-lg text-ink-900 w-10 shrink-0">{item.step}</span>
                    <div>
                      <h3 className="font-display text-lg text-ink-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-stone-500 leading-relaxed">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src="https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="House construction work in Rwanda"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-site container-px">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Start a project</p>
              <h2 className="font-display text-3xl text-ink-900 mb-4">Tell us what you want to build</h2>
              <p className="text-ink-500 leading-relaxed mb-6">
                Share the location, a rough budget, and what you need the building to do. We will follow up to arrange a consultation.
              </p>
            </div>
            <ServiceInquiryForm defaultSubject="Construction consultation" />
          </div>
        </div>
      </section>
    </div>
  )
}
