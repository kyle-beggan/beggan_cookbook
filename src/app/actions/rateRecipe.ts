'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function rateRecipe(recipeId: string, rating: number) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in to rate recipes.' }
    }
    
    if (rating < 1 || rating > 5) {
      return { error: 'Rating must be between 1 and 5.' }
    }

    const { error: upsertError } = await supabase
      .from('cookbook_ratings')
      .upsert({
        recipe_id: recipeId,
        user_id: user.id,
        rating: rating,
      }, { onConflict: 'recipe_id,user_id' })
      
    if (upsertError) {
      return { error: `Failed to save rating: ${upsertError.message}` }
    }
    
    revalidatePath(`/recipe/${recipeId}`)
    revalidatePath('/')
    
    return { success: true }
  } catch (err: unknown) {
    return { error: `An unexpected error occurred: ${(err as Error).message}` }
  }
}
