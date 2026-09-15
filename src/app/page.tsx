import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Clock, Star } from 'lucide-react'
import SidebarFilter from '@/components/SidebarFilter'
import DeleteRecipeButton from '@/components/DeleteRecipeButton'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string; 
    ingredients?: string;
    difficulty?: string;
    cuisine?: string;
    occasion?: string;
    dietary?: string;
    preptime?: string;
    rating?: string;
  }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const params = await searchParams
  const categoryFilter = params.category ? params.category.split(',').filter(Boolean) : []
  const ingredientsFilter = params.ingredients ? params.ingredients.split(',').filter(Boolean) : []
  const difficultyFilter = params.difficulty ? params.difficulty.split(',').filter(Boolean) : []
  const cuisineFilter = params.cuisine ? params.cuisine.split(',').filter(Boolean) : []
  const occasionFilter = params.occasion ? params.occasion.split(',').filter(Boolean) : []
  const dietaryFilter = params.dietary ? params.dietary.split(',').filter(Boolean) : []
  const prepTimeFilter = params.preptime ? params.preptime.split(',').filter(Boolean) : []
  const ratingFilter = params.rating ? params.rating.split(',').filter(Boolean) : []

  let query = supabase.from('cookbook_recipes').select('*, cookbook_ratings(rating)').order('created_at', { ascending: false })

  if (categoryFilter.length > 0) {
    query = query.in('category', categoryFilter)
  }

  const { data: recipes, error } = await query

  const filteredRecipes = recipes?.filter(recipe => {
    // Ingredients Filter (AND logic)
    if (ingredientsFilter.length > 0) {
      const recipeIngredientsStr = (recipe.ingredients || []).join(' ').toLowerCase()
      const hasIngredients = ingredientsFilter.every(ingredient => 
        recipeIngredientsStr.includes(ingredient.toLowerCase())
      )
      if (!hasIngredients) return false
    }

    // Difficulty Filter (OR logic)
    if (difficultyFilter.length > 0) {
      if (!recipe.difficulty || !difficultyFilter.includes(recipe.difficulty)) return false
    }

    // Cuisine Filter (OR logic, case-insensitive)
    if (cuisineFilter.length > 0) {
      if (!recipe.cuisine || !cuisineFilter.some((c: string) => c.toLowerCase() === recipe.cuisine.toLowerCase())) return false
    }

    // Occasion Filter (OR logic, case-insensitive)
    if (occasionFilter.length > 0) {
      if (!recipe.occasion || !occasionFilter.some((o: string) => o.toLowerCase() === recipe.occasion.toLowerCase())) return false
    }

    // Dietary Needs Filter (AND logic, all selected dietary needs must be met)
    if (dietaryFilter.length > 0) {
      if (!recipe.dietary_needs) return false
      const hasDietaryNeeds = dietaryFilter.every((need: string) => 
        recipe.dietary_needs.includes(need)
      )
      if (!hasDietaryNeeds) return false
    }

    // Prep Time Filter (OR logic)
    if (prepTimeFilter.length > 0) {
      if (!recipe.prep_time) return false
      
      // Basic text matching since prep_time is free text.
      // A more robust implementation would parse the string to minutes, but this is a simple approximation.
      const timeStr = recipe.prep_time.toLowerCase()
      let matchesTime = false
      
      for (const filter of prepTimeFilter) {
        if (filter === 'Under 15 mins') {
          if (timeStr.includes('10') || timeStr.includes('5') || (timeStr.includes('15') && !timeStr.includes('1.5'))) matchesTime = true
        } else if (filter === 'Under 30 mins') {
          if (timeStr.includes('15') || timeStr.includes('20') || timeStr.includes('25') || timeStr.includes('30')) matchesTime = true
        } else if (filter === 'Under 1 hour') {
          if (timeStr.includes('45') || timeStr.includes('30') || timeStr.includes('40') || timeStr.includes('50')) matchesTime = true
        } else if (filter === 'Over 1 hour') {
          if (timeStr.includes('hour') || timeStr.includes('hr') || timeStr.includes('60') || timeStr.includes('90')) matchesTime = true
        }
      }
      
      if (!matchesTime) return false
    }

    // Rating Filter (OR logic)
    if (ratingFilter.length > 0) {
      const ratings = recipe.cookbook_ratings || []
      const totalRatings = ratings.length
      const averageRating = totalRatings > 0 
        ? ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalRatings 
        : 0
        
      const passesRating = ratingFilter.some((filter: string) => {
        if (filter === '4+ Stars') return averageRating >= 4
        if (filter === '3+ Stars') return averageRating >= 3
        if (filter === '2+ Stars') return averageRating >= 2
        if (filter === '1+ Star') return averageRating >= 1
        return false
      })
      if (!passesRating) return false
    }

    return true
  })

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <SidebarFilter />
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">

        {error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">Error loading recipes</div>
        ) : filteredRecipes?.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-rustic-card)] rounded-xl border border-[var(--color-rustic-muted)]/20 shadow-sm">
            <p className="text-[var(--color-rustic-muted)] text-lg mb-4">No recipes found matching your filters.</p>
            <div className="flex justify-center gap-4">
              <Link href="/add" className="text-[var(--color-rustic-accent)] hover:underline font-medium">Add a Recipe</Link>
              <span className="text-[var(--color-rustic-muted)]">or</span>
              <Link href="/import" className="text-[var(--color-rustic-accent)] hover:underline font-medium">Import from URL</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes?.map((recipe) => {
              const ratings = recipe.cookbook_ratings || []
              const totalRatings = ratings.length
              const averageRating = totalRatings > 0 
                ? ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalRatings 
                : 0

              return (
              <div key={recipe.id} className="group relative h-full">
                {user && (
                  <DeleteRecipeButton recipeId={recipe.id} title={recipe.title} />
                )}
                <Link href={`/recipe/${recipe.id}`} className="block h-full">
                  <div className="h-full bg-[var(--color-rustic-card)] rounded-xl border border-[var(--color-rustic-muted)]/20 shadow-sm overflow-hidden hover:shadow-md transition-all group-hover:border-[var(--color-rustic-accent)]/50 flex flex-col">
                  {recipe.image_url ? (
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-[var(--color-rustic-bg)] flex items-center justify-center border-b border-[var(--color-rustic-muted)]/10">
                      <span className="text-4xl text-[var(--color-rustic-muted)]/30">🍲</span>
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-rustic-sage)] mb-2">
                      {recipe.category}
                    </span>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{recipe.title}</h3>
                    <p className="text-[var(--color-rustic-muted)] text-sm line-clamp-2 mb-4 flex-1">
                      {recipe.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center justify-between relative text-sm text-[var(--color-rustic-muted)] mt-auto pt-4 border-t border-[var(--color-rustic-muted)]/10">
                      <div className="flex items-center gap-4">
                        {(recipe.prep_time || recipe.cook_time) && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.prep_time || recipe.cook_time}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Rating (Bottom Middle) */}
                      <div className="flex items-center gap-1 text-[var(--color-rustic-accent)] absolute left-1/2 -translate-x-1/2">
                        {totalRatings > 0 ? (
                          <>
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-medium text-[var(--color-rustic-text)]">{averageRating.toFixed(1)}</span>
                            <span className="text-xs">({totalRatings})</span>
                          </>
                        ) : (
                          <span className="text-xs text-[var(--color-rustic-muted)]">No ratings</span>
                        )}
                      </div>

                      {/* Avatar (Bottom Right) */}
                      <div className="flex items-center justify-end">
                        {recipe.added_by_avatar_url ? (
                          <img src={recipe.added_by_avatar_url} alt={recipe.added_by_name || 'User'} className="w-6 h-6 rounded-full object-cover" title={recipe.added_by_name || 'User'} />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[var(--color-rustic-accent)] text-white flex items-center justify-center text-xs font-bold" title={recipe.added_by_name || 'User'}>
                            {(recipe.added_by_name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>
                </Link>
              </div>
            )})}
          </div>
        )}
      </main>
    </div>
  )
}
