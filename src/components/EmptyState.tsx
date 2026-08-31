import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; href: string }
  icon?: ReactNode
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && <div className="mb-6 text-ink-300">{icon}</div>}
      <h3 className="font-display text-2xl text-ink-900 mb-2">{title}</h3>
      {description && <p className="text-ink-400 max-w-md mb-6">{description}</p>}
      {action && (
        <a
          href={action.href}
          className="inline-block px-6 py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
