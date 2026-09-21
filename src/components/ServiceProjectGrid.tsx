import { Pencil, Trash2 } from 'lucide-react'
import type { ServiceProject } from '../lib/types'

export default function ServiceProjectGrid({
  projects,
  emptyHint,
  isAdmin = false,
  onEdit,
  onDelete,
}: {
  projects: ServiceProject[]
  emptyHint?: string
  isAdmin?: boolean
  onEdit?: (project: ServiceProject) => void
  onDelete?: (project: ServiceProject) => void
}) {
  if (projects.length === 0) {
    return emptyHint ? (
      <p className="text-sm text-stone-500">{emptyHint}</p>
    ) : null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map(project => (
        <article key={project.id} className="relative group bg-warm-white border border-stone-200 overflow-hidden hover:border-stone-400 transition-colors">
          {project.image_path && (
            <div className="aspect-[4/3] overflow-hidden bg-stone-100 relative">
              <img
                src={project.image_path}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1.5 bg-ink-950/80 p-1 rounded backdrop-blur-sm z-10">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(project)}
                      className="p-1.5 text-stone-200 hover:text-warm-white transition-colors"
                      title="Edit project"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(project)}
                      className="p-1.5 text-stone-200 hover:text-red-400 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              {project.location ? (
                <p className="text-xs tracking-[0.15em] uppercase text-stone-400">{project.location}</p>
              ) : <div />}
              {!project.image_path && isAdmin && (
                <div className="flex gap-1.5">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(project)}
                      className="p-1 text-stone-400 hover:text-ink-900"
                      title="Edit project"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(project)}
                      className="p-1 text-stone-400 hover:text-red-500"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <h3 className="font-display text-xl text-ink-900 mb-2">{project.title}</h3>
            {project.description && (
              <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">{project.description}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

