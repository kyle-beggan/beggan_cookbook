import { createClient } from '@/utils/supabase/server'
import { Clock, ExternalLink, ArrowLeft, Gauge, Globe, Calendar, Leaf, Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import RatingComponent from '@/components/RatingComponent'

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  const { data: recipe, error } = await supabase
    .from('cookbook_recipes')
    .select('*, cookbook_ratings(rating, user_id)')
    .eq('id', resolvedParams.id)
    .single()
    
  if (error || !recipe) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  const ratings = recipe.cookbook_ratings || []
  const totalRatings = ratings.length
  const averageRating = totalRatings > 0 
    ? ratings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / totalRatings 
    : 0
  const initialUserRating = user ? ratings.find((r: { user_id: string, rating: number }) => r.user_id === user.id)?.rating || null : null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-rustic-muted)] hover:text-[var(--color-rustic-accent)] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cookbook
      </Link>
      
      <div className="bg-[var(--color-rustic-card)] rounded-2xl overflow-hidden shadow-sm border border-[var(--color-rustic-muted)]/20">
        {recipe.image_url && (
          <div className="w-full h-64 md:h-96 relative">
            <img 
              src={recipe.image_url} 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <span className="inline-block text-sm font-semibold uppercase tracking-wider text-[var(--color-rustic-sage)] mb-2">
                {recipe.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-[var(--color-rustic-text)] mb-4 leading-tight">
                {recipe.title}
              </h1>
              {recipe.added_by_name && (
                <div className="flex items-center gap-2 mb-4">
                  {recipe.added_by_avatar_url ? (
                    <img src={recipe.added_by_avatar_url} alt={recipe.added_by_name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[var(--color-rustic-accent)] text-white flex items-center justify-center text-xs font-bold">
                      {recipe.added_by_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-sm font-medium text-[var(--color-rustic-muted)]">
                    Added by {recipe.added_by_name}
                  </p>
                </div>
              )}
              {recipe.description && (
                <p className="text-[var(--color-rustic-muted)] text-lg leading-relaxed mb-4">
                  {recipe.description}
                </p>
              )}
              
              <div className="mt-2">
                <RatingComponent 
                  recipeId={recipe.id}
                  averageRating={averageRating}
                  totalRatings={totalRatings}
                  initialUserRating={initialUserRating}
                  isLoggedIn={!!user}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link 
                href={`/recipe/${recipe.id}/edit`} 
                className="flex items-center gap-2 text-sm font-medium bg-[var(--color-rustic-text)] text-white px-4 py-2 rounded-full hover:bg-[var(--color-rustic-text)]/90 transition-colors whitespace-nowrap"
              >
                <Edit className="w-4 h-4" /> Edit Recipe
              </Link>
              {recipe.source_url && (
                <a 
                  href={recipe.source_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium bg-white/50 border border-[var(--color-rustic-muted)]/20 px-4 py-2 rounded-full hover:bg-[var(--color-rustic-bg)] transition-colors whitespace-nowrap"
                >
                  Original Recipe <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 py-6 border-y border-[var(--color-rustic-muted)]/20 mb-10">
            {recipe.prep_time && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--color-rustic-accent)]" />
                <div>
                  <p className="text-xs text-[var(--color-rustic-muted)] uppercase font-semibold tracking-wider">Prep Time</p>
                  <p className="font-medium">{recipe.prep_time}</p>
                </div>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--color-rustic-accent)]" />
                <div>
                  <p className="text-xs text-[var(--color-rustic-muted)] uppercase font-semibold tracking-wider">Cook Time</p>
                  <p className="font-medium">{recipe.cook_time}</p>
                </div>
              </div>
            )}
            {recipe.difficulty && (
              <div className="flex items-center gap-3">
                <Gauge className="w-5 h-5 text-[var(--color-rustic-accent)]" />
                <div>
                  <p className="text-xs text-[var(--color-rustic-muted)] uppercase font-semibold tracking-wider">Difficulty</p>
                  <p className="font-medium">{recipe.difficulty}</p>
                </div>
              </div>
            )}
            {recipe.cuisine && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[var(--color-rustic-accent)]" />
                <div>
                  <p className="text-xs text-[var(--color-rustic-muted)] uppercase font-semibold tracking-wider">Cuisine</p>
                  <p className="font-medium">{recipe.cuisine}</p>
                </div>
              </div>
            )}
            {recipe.occasion && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[var(--color-rustic-accent)]" />
                <div>
                  <p className="text-xs text-[var(--color-rustic-muted)] uppercase font-semibold tracking-wider">Occasion</p>
                  <p className="font-medium">{recipe.occasion}</p>
                </div>
              </div>
            )}
            {recipe.dietary_needs && recipe.dietary_needs.length > 0 && (
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-[var(--color-rustic-accent)]" />
                <div>
                  <p className="text-xs text-[var(--color-rustic-muted)] uppercase font-semibold tracking-wider">Dietary</p>
                  <p className="font-medium">{recipe.dietary_needs.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Ingredients */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6 text-[var(--color-rustic-text)] flex items-center gap-2">
                Ingredients
              </h2>
              <ul className="space-y-4">
                {recipe.ingredients.map((ingredient: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-[var(--color-rustic-text)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-rustic-accent)] mt-2 shrink-0"></span>
                    <span className="leading-relaxed">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Instructions */}
            <div className="lg:col-span-2 space-y-10">
              {recipe.prep_instructions && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-[var(--color-rustic-text)]">Instructions</h2>
                  <div className="prose prose-stone max-w-none text-[var(--color-rustic-text)]">
                    {recipe.prep_instructions.split('\n\n').map((paragraph: string, idx: number) => (
                      <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {recipe.cook_instructions && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-[var(--color-rustic-text)]">Cooking Instructions</h2>
                  <div className="prose prose-stone max-w-none text-[var(--color-rustic-text)]">
                    {recipe.cook_instructions.split('\n\n').map((paragraph: string, idx: number) => (
                      <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
