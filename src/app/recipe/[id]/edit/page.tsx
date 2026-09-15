import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import RecipeForm from '@/components/RecipeForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  const { data: recipe, error } = await supabase
    .from('cookbook_recipes')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()
    
  if (error || !recipe) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/recipe/${recipe.id}`} className="inline-flex items-center gap-2 text-sm text-[var(--color-rustic-muted)] hover:text-[var(--color-rustic-accent)] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Cancel Edit
      </Link>
      <RecipeForm initialData={recipe} />
    </div>
  )
}
