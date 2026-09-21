import { useState, useRef } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  /** Show above-the-fold with high fetch priority (e.g. hero images) */
  priority?: boolean
  /** Extra wrapper class */
  wrapperClassName?: string
}

/**
 * LazyImage — drops in wherever <img> is used.
 * - Shows an animated skeleton while loading
 * - Fades the image in once loaded
 * - Sets loading="lazy" (or "eager" for priority images)
 * - decoding="async" so it never blocks the main thread
 */
export default function LazyImage({
  src,
  alt,
  className = '',
  priority = false,
  wrapperClassName = '',
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {/* Skeleton shimmer shown until image loads */}
      {!loaded && !errored && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse" />
      )}

      {!errored ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(true)
            setErrored(true)
          }}
        />
      ) : (
        <div className={`flex items-center justify-center bg-stone-100 text-stone-400 text-xs ${className}`}>
          No image
        </div>
      )}
    </div>
  )
}
