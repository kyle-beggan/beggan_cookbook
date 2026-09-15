'use client'

import { useState, useTransition } from 'react'
import { Star } from 'lucide-react'
import { rateRecipe } from '@/app/actions/rateRecipe'

export default function RatingComponent({
  recipeId,
  averageRating,
  totalRatings,
  initialUserRating,
  isLoggedIn,
}: {
  recipeId: string
  averageRating: number
  totalRatings: number
  initialUserRating: number | null
  isLoggedIn: boolean
}) {
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [userRating, setUserRating] = useState<number | null>(initialUserRating)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRate = (rating: number) => {
    if (!isLoggedIn) {
      setError('You must be logged in to rate recipes.')
      return
    }
    
    setError(null)
    setUserRating(rating)
    startTransition(async () => {
      const res = await rateRecipe(recipeId, rating)
      if (res.error) {
        setError(res.error)
        setUserRating(initialUserRating) // Revert on failure
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isPending}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoveredRating(star)}
              className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  (hoveredRating || userRating || 0) >= star
                    ? 'fill-[var(--color-rustic-accent)] text-[var(--color-rustic-accent)]'
                    : 'text-[var(--color-rustic-muted)]/40'
                }`}
              />
            </button>
          ))}
        </div>
        
        <div className="text-sm">
          {totalRatings > 0 ? (
            <span className="font-medium text-[var(--color-rustic-text)]">
              {averageRating.toFixed(1)} <span className="text-[var(--color-rustic-muted)]">({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>
            </span>
          ) : (
            <span className="text-[var(--color-rustic-muted)]">No ratings yet</span>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-xs font-medium">{error}</p>
      )}
    </div>
  )
}
