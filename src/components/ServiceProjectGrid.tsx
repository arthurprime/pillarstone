import { useState } from 'react'
import type { ServiceProject } from '../lib/types'
import { getServiceProjectPhotos } from '../lib/data'
import LazyImage from './LazyImage'

function ProjectCard({ project }: { project: ServiceProject }) {
  const photos = getServiceProjectPhotos(project)
  const [active, setActive] = useState(0)
  const current = photos[active] ?? photos[0]

  return (
    <article className="bg-warm-white border border-stone-200 overflow-hidden hover:border-stone-400 transition-colors">
      {current && (
        <LazyImage
          src={current}
          alt={project.title}
          wrapperClassName="aspect-[4/3]"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out"
        />
      )}
      {photos.length > 1 && (
        <div className="flex gap-1 p-2 bg-stone-50 overflow-x-auto">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 w-12 h-12 overflow-hidden border ${i === active ? 'border-ink-900' : 'border-transparent opacity-70 hover:opacity-100'}`}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
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
  )
}

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
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
