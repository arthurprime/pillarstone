interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  const showEllipsis = totalPages > 7

  if (!showEllipsis) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm border border-stone-300 text-ink-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 text-sm border transition-colors ${
              p === currentPage
                ? 'bg-ink-900 text-warm-white border-ink-900'
                : 'border-stone-300 text-ink-700 hover:bg-stone-100'
            }`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        ) : (
          <span key={i} className="px-2 text-stone-400">…</span>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm border border-stone-300 text-ink-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </nav>
  )
}
