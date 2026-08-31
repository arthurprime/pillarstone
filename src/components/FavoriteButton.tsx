import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { isSavedLocally, toggleSavedLocally } from '../lib/localFavorites'
import { useToast } from './Toast'

interface FavoriteButtonProps {
  propertyId: string
  variant?: 'card' | 'detail'
}

export default function FavoriteButton({ propertyId, variant = 'card' }: FavoriteButtonProps) {
  const { toast } = useToast()
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFavorited(isSavedLocally(propertyId))
  }, [propertyId])

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    const saved = toggleSavedLocally(propertyId)
    setFavorited(saved)
    toast(saved ? 'Saved on this device.' : 'Removed from saved.', saved ? 'success' : 'info')
    setLoading(false)
  }

  const sizeClass = variant === 'detail' ? 'w-10 h-10' : 'w-9 h-9'
  const iconSize = variant === 'detail' ? 20 : 18

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`${sizeClass} flex items-center justify-center bg-warm-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-warm-white transition-all disabled:opacity-50`}
      aria-label={favorited ? 'Remove from saved' : 'Save property'}
      aria-pressed={favorited}
    >
      <Heart
        size={iconSize}
        className={favorited ? 'fill-red-500 text-red-500' : 'text-ink-600'}
      />
    </button>
  )
}
