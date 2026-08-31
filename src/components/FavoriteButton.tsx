import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { saveFavorite, removeFavorite, isFavorited } from '../lib/data'
import { useToast } from './Toast'

interface FavoriteButtonProps {
  propertyId: string
  variant?: 'card' | 'detail'
}

export default function FavoriteButton({ propertyId, variant = 'card' }: FavoriteButtonProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      isFavorited(user.id, propertyId).then(setFavorited)
    }
  }, [user, propertyId])

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast('Please sign in to save favorites.', 'info')
      return
    }

    setLoading(true)
    if (favorited) {
      const { error } = await removeFavorite(user.id, propertyId)
      if (error) {
        toast('Could not remove favorite. Please try again.', 'error')
      } else {
        setFavorited(false)
        toast('Removed from favorites.', 'info')
      }
    } else {
      const { error } = await saveFavorite(user.id, propertyId)
      if (error) {
        toast('Could not save favorite. Please try again.', 'error')
      } else {
        setFavorited(true)
        toast('Saved to favorites.', 'success')
      }
    }
    setLoading(false)
  }

  const sizeClass = variant === 'detail' ? 'w-10 h-10' : 'w-9 h-9'
  const iconSize = variant === 'detail' ? 20 : 18

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${sizeClass} flex items-center justify-center bg-warm-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-warm-white transition-all disabled:opacity-50`}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorited}
    >
      <Heart
        size={iconSize}
        className={favorited ? 'fill-red-500 text-red-500' : 'text-ink-600'}
      />
    </button>
  )
}
