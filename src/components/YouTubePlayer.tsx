import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeWatchUrl } from '../lib/utils'
import YouTubePlayOverlay from './YouTubePlayOverlay'

export function YouTubePlayer({
  url,
  title,
  className = '',
}: {
  url: string
  title: string
  className?: string
}) {
  const [playing, setPlaying] = useState(false)
  const embed = getYouTubeEmbedUrl(url, { autoplay: true })
  const thumb = getYouTubeThumbnailUrl(url)
  const watch = getYouTubeWatchUrl(url)

  if (!embed || !thumb) {
    if (watch) {
      return (
        <a
          href={watch}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-ink-900 border-b border-ink-900 pb-1"
        >
          Watch on YouTube
        </a>
      )
    }
    return null
  }

  return (
    <div className={`relative aspect-video overflow-hidden bg-ink-950 ${className}`}>
      {playing ? (
        <iframe
          src={embed}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="block w-full h-full relative group"
          aria-label={`Play ${title}`}
        >
          <img src={thumb} alt="" className="w-full h-full object-cover" />
          <span className="absolute inset-0 bg-ink-950/25 group-hover:bg-ink-950/35 transition-colors" />
          <YouTubePlayOverlay size={80} />
        </button>
      )}
    </div>
  )
}

export function YouTubeLightbox({
  url,
  title,
  open,
  onClose,
}: {
  url: string
  title: string
  open: boolean
  onClose: () => void
}) {
  const embed = getYouTubeEmbedUrl(url, { autoplay: true })

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open || !embed) return null

  return (
    <div
      className="fixed inset-0 z-[120] bg-ink-950/85 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-ink-900/80 hover:bg-ink-800 text-warm-white text-xs tracking-wider uppercase transition-colors rounded"
        onClick={onClose}
        aria-label="Close video"
      >
        <X size={16} />
        <span>Close</span>
      </button>
      <div className="w-full max-w-4xl aspect-video bg-ink-950 shadow-2xl rounded-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={embed}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  )
}
