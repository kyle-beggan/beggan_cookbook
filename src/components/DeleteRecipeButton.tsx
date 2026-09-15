'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { deleteRecipe } from '@/app/actions/deleteRecipe'

export default function DeleteRecipeButton({ recipeId, title }: { recipeId: string, title: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }
  
  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const res = await deleteRecipe(recipeId)
      if (res.error) {
        alert(res.error)
      }
      setIsOpen(false)
    })
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={handleDelete}
        className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-full shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 focus:opacity-100 outline-none"
        title="Delete Recipe"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={cancelDelete}>
          <div 
            className="bg-[var(--color-rustic-card)] p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 transform scale-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-[var(--color-rustic-text)]">Delete Recipe</h3>
            </div>
            <p className="text-[var(--color-rustic-muted)] mb-6">
              Are you sure you want to delete <strong className="text-[var(--color-rustic-text)]">{title}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={cancelDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-rustic-muted)] hover:bg-[var(--color-rustic-muted)]/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
