'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteRecipe(recipeId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in to delete recipes.' }
    }
    
    const { error } = await supabase
      .from('cookbook_recipes')
      .delete()
      .eq('id', recipeId)
      
    if (error) {
      return { error: `Failed to delete recipe: ${error.message}` }
    }
    
    revalidatePath('/')
    
    return { success: true }
  } catch (err: unknown) {
    return { error: `An unexpected error occurred: ${(err as Error).message}` }
  }
}
