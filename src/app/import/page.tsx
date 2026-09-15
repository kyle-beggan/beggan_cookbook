'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { scrapeRecipeFromUrl } from '@/app/actions/scrapeRecipe'
import { createClient } from '@/utils/supabase/client'
import { Link as LinkIcon, Loader2 } from 'lucide-react'

export default function ImportPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    
    setLoading(true)
    setError(null)
    
    try {
      // 1. Scrape the URL
      const { data, error: scrapeError } = await scrapeRecipeFromUrl(url)
      
      if (scrapeError || !data) {
        throw new Error(scrapeError || 'Could not parse recipe data')
      }
      
      // 2. Get the current user to capture their name
      const { data: userData } = await supabase.auth.getUser()
      const authorName = userData.user?.user_metadata?.full_name || 'Family Member'
      const avatarUrl = userData.user?.user_metadata?.avatar_url || userData.user?.user_metadata?.picture || null

      // 3. We have the data, try to insert it directly into Supabase, 
      // but we need a default category. Let's use 'Miscellaneous and Condiments' for now
      // Alternatively, we could show a review step, but let's just insert it and redirect.
      const { data: inserted, error: insertError } = await supabase
        .from('cookbook_recipes')
        .insert({
          title: data.title,
          description: data.description,
          category: 'Main Dishes (Entrées)', // Defaulting
          ingredients: data.ingredients,
          prep_instructions: data.prep_instructions,
          cook_instructions: data.cook_instructions,
          prep_time: data.prep_time,
          cook_time: data.cook_time,
          image_url: data.image_url,
          source_url: data.source_url,
          added_by_name: authorName,
          added_by_avatar_url: avatarUrl,
          difficulty: data.difficulty || null,
          cuisine: data.cuisine || null,
          occasion: data.occasion || null,
          dietary_needs: data.dietary_needs || []
        })
        .select()
        .single()
        
      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`)
      }
      
      // 3. Redirect to the new recipe
      if (inserted) {
        router.push(`/recipe/${inserted.id}`)
      }
    } catch (err: unknown) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[var(--color-rustic-card)] p-6 sm:p-8 rounded-xl shadow-sm border border-[var(--color-rustic-muted)]/20">
        <h1 className="text-2xl font-bold mb-2">Import Recipe</h1>
        <p className="text-[var(--color-rustic-muted)] mb-8">
          Paste a link to a recipe from any popular food blog. We&apos;ll extract the ingredients and instructions automatically.
        </p>
        
        <form onSubmit={handleImport} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">Recipe URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="url"
                required
                placeholder="https://example.com/recipe/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 w-full p-3 rounded-lg border border-[var(--color-rustic-muted)]/30 focus:ring-2 focus:ring-[var(--color-rustic-accent)] focus:border-transparent outline-none bg-white text-[var(--color-rustic-text)]"
              />
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-rustic-accent)] hover:opacity-90 text-white p-3 rounded-lg font-medium transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Recipe'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
