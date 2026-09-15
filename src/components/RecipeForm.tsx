'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Plus, Trash2 } from 'lucide-react'

const CATEGORIES = [
  'Appetizers and Snacks',
  'Beverages',
  'Soups and Salads',
  'Breakfast and Brunch',
  'Breads and Rolls',
  'Main Dishes (Entrées)',
  'Side Dishes',
  'Desserts',
  'Miscellaneous and Condiments',
]

export type RecipeData = {
  id?: string
  title: string
  category: string
  description?: string | null
  ingredients: string[]
  prep_instructions: string
  cook_instructions?: string | null
  prep_time?: string | null
  cook_time?: string | null
  difficulty?: string | null
  cuisine?: string | null
  occasion?: string | null
  dietary_needs?: string[] | null
  image_url?: string | null
}

export default function RecipeForm({ initialData }: { initialData?: RecipeData }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState(initialData?.title || '')
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[5])
  const [description, setDescription] = useState(initialData?.description || '')
  const [prepTime, setPrepTime] = useState(initialData?.prep_time || '')
  const [cookTime, setCookTime] = useState(initialData?.cook_time || '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || '')
  const [cuisine, setCuisine] = useState(initialData?.cuisine || '')
  const [occasion, setOccasion] = useState(initialData?.occasion || '')
  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>(initialData?.dietary_needs || [])

  const toggleDietaryNeed = (need: string) => {
    setDietaryNeeds(prev => 
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    )
  }

  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients?.length ? initialData.ingredients : [''])
  const [prepInstructions, setPrepInstructions] = useState(initialData?.prep_instructions || '')
  const [cookInstructions, setCookInstructions] = useState(initialData?.cook_instructions || '')

  const handleAddIngredient = () => setIngredients([...ingredients, ''])
  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...ingredients]
    newIngredients.splice(index, 1)
    setIngredients(newIngredients)
  }
  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Filter empty ingredients
    const validIngredients = ingredients.filter(i => i.trim() !== '')
    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient.')
      setLoading(false)
      return
    }
    
    const { data: userData } = await supabase.auth.getUser()
    const authorName = userData.user?.user_metadata?.full_name || 'Family Member'
    const avatarUrl = userData.user?.user_metadata?.avatar_url || userData.user?.user_metadata?.picture || null
    
    const payload = {
      title,
      category,
      description,
      ingredients: validIngredients,
      prep_instructions: prepInstructions,
      cook_instructions: cookInstructions,
      prep_time: prepTime,
      cook_time: cookTime,
      difficulty: difficulty || null,
      cuisine: cuisine || null,
      occasion: occasion || null,
      dietary_needs: dietaryNeeds.length > 0 ? dietaryNeeds : null,
      image_url: imageUrl || null,
      ...(initialData?.id ? {} : { added_by_name: authorName, added_by_avatar_url: avatarUrl }) // Only set author on insert
    }

    let result
    
    if (initialData?.id) {
      result = await supabase
        .from('cookbook_recipes')
        .update(payload)
        .eq('id', initialData.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('cookbook_recipes')
        .insert(payload)
        .select()
        .single()
    }
      
    if (result.error) {
      setError(`Database error: ${result.error.message}`)
      setLoading(false)
    } else if (result.data) {
      router.push(`/recipe/${result.data.id}`)
      router.refresh()
    }
  }

  return (
    <div className="bg-[var(--color-rustic-card)] p-6 sm:p-8 rounded-xl shadow-sm border border-[var(--color-rustic-muted)]/20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-rustic-text)]">
          {initialData?.id ? 'Edit Recipe' : 'Add Custom Recipe'}
        </h1>
        <button
          form="recipe-form"
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-[var(--color-rustic-text)] hover:bg-[var(--color-rustic-text)]/90 text-white px-5 py-2 rounded-lg font-medium transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <form id="recipe-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Basics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-[var(--color-rustic-muted)]/20 pb-2">Basics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Recipe Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Category *</label>
              <select
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium">Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
            />
          </div>
        </div>

        {/* Details & Metadata */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-[var(--color-rustic-muted)]/20 pb-2">Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Prep Time (e.g., &quot;15 mins&quot;)</label>
              <input
                type="text"
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Cook Time (e.g., &quot;1 hr&quot;)</label>
              <input
                type="text"
                value={cookTime}
                onChange={e => setCookTime(e.target.value)}
                className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none bg-white"
              >
                <option value="">Select Difficulty...</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Cuisine</label>
              <input
                type="text"
                placeholder="e.g., Italian, Mexican"
                value={cuisine}
                onChange={e => setCuisine(e.target.value)}
                className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium">Occasion or Season</label>
              <input
                type="text"
                placeholder="e.g., Thanksgiving, Summer BBQ"
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
                className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2 mt-2">
              <label className="block text-sm font-medium mb-3">Dietary Needs</label>
              <div className="flex flex-wrap gap-4">
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'].map(need => (
                  <label key={need} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dietaryNeeds.includes(need)}
                      onChange={() => toggleDietaryNeed(need)}
                      className="w-4 h-4 rounded border-[var(--color-rustic-muted)]/30 text-[var(--color-rustic-accent)] focus:ring-[var(--color-rustic-accent)] cursor-pointer"
                    />
                    <span className="text-sm">{need}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-rustic-muted)]/20 pb-2">
            <h2 className="text-xl font-semibold">Ingredients *</h2>
            <button 
              type="button" 
              onClick={handleAddIngredient}
              className="text-sm text-[var(--color-rustic-accent)] hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Line
            </button>
          </div>
          
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                name="ingredient"
                value={ing}
                placeholder={`e.g., 2 cups flour`}
                onChange={e => handleIngredientChange(idx, e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddIngredient()
                    setTimeout(() => {
                      const inputs = document.querySelectorAll('input[name="ingredient"]')
                      if (inputs.length > 0) {
                        ;(inputs[inputs.length - 1] as HTMLInputElement).focus()
                      }
                    }, 0)
                  }
                }}
                className="flex-1 p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
              />
              {ingredients.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveIngredient(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Instructions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-[var(--color-rustic-muted)]/20 pb-2">Instructions</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Preparation Instructions *</label>
            <textarea
              required
              rows={5}
              value={prepInstructions}
              onChange={e => setPrepInstructions(e.target.value)}
              className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Cooking Instructions (Optional)</label>
            <textarea
              rows={4}
              value={cookInstructions}
              onChange={e => setCookInstructions(e.target.value)}
              className="w-full p-2.5 rounded border border-[var(--color-rustic-muted)]/30 focus:ring-1 focus:ring-[var(--color-rustic-accent)] outline-none"
            />
          </div>
        </div>
        
        <div className="pt-6 border-t border-[var(--color-rustic-muted)]/20">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-rustic-text)] hover:bg-[var(--color-rustic-text)]/90 text-white p-4 rounded-lg font-medium transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Recipe...
              </>
            ) : (
              'Save Recipe to Cookbook'
            )}
          </button>
        </div>
        </div>
      </form>
    </div>
  )
}
