import type { ServiceProject } from '../lib/types'

export default function ServiceProjectGrid({
  projects,
  emptyHint,
}: {
  projects: ServiceProject[]
  emptyHint?: string
}) {
  if (projects.length === 0) {
    return emptyHint ? (
      <p className="text-sm text-stone-500">{emptyHint}</p>
    ) : null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map(project => (
        <article key={project.id} className="bg-warm-white border border-stone-200 overflow-hidden hover:border-stone-400 transition-colors">
          {project.image_path && (
            <div className="aspect-[4/3] overflow-hidden bg-stone-100">
              <img
                src={project.image_path}
                alt={project.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-6">
            {project.location && (
              <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-2">{project.location}</p>
            )}
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
