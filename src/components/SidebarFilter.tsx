'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback, KeyboardEvent } from 'react'
import { Plus, ChevronDown, ChevronUp, Filter } from 'lucide-react'

const CATEGORIES = [
  'Appetizers and Snacks',
  'Beverages',
  'Soups and Salads',
  'Breakfast and Brunch',
  'Breads and Rolls',
  'Main Dishes (Entrées)',
  'Side Dishes',
  'Desserts',
  'Miscellaneous',
]

const DEFAULT_INGREDIENTS = [
  'Chicken', 'Beef', 'Pork', 'Rice', 'Pasta', 'Garlic', 'Onion', 'Tomato', 'Cheese',
]

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const PREP_TIMES = ['Under 15 mins', 'Under 30 mins', 'Under 1 hour', 'Over 1 hour']

const DIETARY_NEEDS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free']

const RATINGS = ['4+ Stars', '3+ Stars', '2+ Stars', '1+ Star']

// For Cuisine and Occasion, we'll allow custom additions similar to Ingredients.
const DEFAULT_CUISINES = ['Italian', 'Mexican', 'American', 'Chinese', 'Indian']
const DEFAULT_OCCASIONS = ['Thanksgiving', 'Christmas', 'Summer BBQ', 'Weeknight Dinner']

export default function SidebarFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State for toggling sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  // State for custom inputs
  const [customIngredients, setCustomIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  
  const [customCuisines, setCustomCuisines] = useState<string[]>([])
  const [newCuisine, setNewCuisine] = useState('')
  
  const [customOccasions, setCustomOccasions] = useState<string[]>([])
  const [newOccasion, setNewOccasion] = useState('')

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null) {
        params.delete(name)
      } else {
        params.set(name, value)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleToggleParam = (paramName: string, value: string) => {
    const currentValues = searchParams.get(paramName)?.split(',').filter(Boolean) || []
    
    // Exact match for category, case-insensitive for others like ingredients
    const isExact = paramName === 'category' || paramName === 'difficulty' || paramName === 'preptime' || paramName === 'dietary' || paramName === 'rating' || paramName === 'source'
    
    let updated: string[] = []
    
    if (isExact) {
      if (currentValues.includes(value)) {
        updated = currentValues.filter(v => v !== value)
      } else {
        updated = [...currentValues, value]
      }
    } else {
      const lowerValue = value.toLowerCase()
      if (currentValues.some(v => v.toLowerCase() === lowerValue)) {
        updated = currentValues.filter(v => v.toLowerCase() !== lowerValue)
      } else {
        updated = [...currentValues, lowerValue]
      }
    }

    const query = createQueryString(paramName, updated.length > 0 ? updated.join(',') : null)
    router.push(`${pathname}?${query}`)
  }
  
  const handleAddCustom = (
    e: KeyboardEvent<HTMLInputElement>, 
    value: string, 
    setValue: (val: string) => void, 
    setCustomList: React.Dispatch<React.SetStateAction<string[]>>, 
    allList: string[], 
    paramName: string
  ) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault()
      const trimmed = value.trim()
      
      if (!allList.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
        setCustomList(prev => [...prev, trimmed])
      }
      
      const currentValues = searchParams.get(paramName)?.split(',').filter(Boolean) || []
      if (!currentValues.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
        handleToggleParam(paramName, trimmed)
      }
      
      setValue('')
    }
  }

  const renderSection = (
    title: string, 
    paramName: string, 
    options: string[], 
    customInputProps?: { value: string, setter: (val: string) => void, customListSetter: React.Dispatch<React.SetStateAction<string[]>> }
  ) => {
    const currentValues = searchParams.get(paramName)?.split(',').filter(Boolean) || []
    const isOpen = !!openSections[paramName]
    
    return (
      <div className="border border-[var(--color-rustic-muted)]/20 rounded-xl overflow-hidden bg-[var(--color-rustic-card)]">
        <button 
          onClick={() => toggleSection(paramName)}
          className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-[var(--color-rustic-muted)]/5 transition-colors"
        >
          <h3 className="text-sm md:text-base font-bold text-[var(--color-rustic-text)]">
            {title} {currentValues.length > 0 && `(${currentValues.length})`}
          </h3>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-[var(--color-rustic-muted)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--color-rustic-muted)]" />
          )}
        </button>
        
        {isOpen && (
          <div className="p-4 pt-0 border-t border-[var(--color-rustic-muted)]/10 flex flex-col gap-2">
            {options.map((opt) => {
              const isSelected = paramName === 'category' || paramName === 'difficulty' || paramName === 'preptime' || paramName === 'dietary' || paramName === 'rating' || paramName === 'source'
                ? currentValues.includes(opt)
                : currentValues.some(v => v.toLowerCase() === opt.toLowerCase())
                
              return (
                <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleParam(paramName, opt)}
                    className="w-4 h-4 rounded border-[var(--color-rustic-muted)]/30 text-[var(--color-rustic-accent)] focus:ring-[var(--color-rustic-accent)] cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${isSelected ? 'text-[var(--color-rustic-text)] font-medium' : 'text-[var(--color-rustic-muted)] group-hover:text-[var(--color-rustic-text)]'}`}>
                    {opt}
                  </span>
                </label>
              )
            })}
            
            {customInputProps && (
              <div className="mt-2 relative">
                <input
                  type="text"
                  value={customInputProps.value}
                  onChange={(e) => customInputProps.setter(e.target.value)}
                  onKeyDown={(e) => handleAddCustom(e, customInputProps.value, customInputProps.setter, customInputProps.customListSetter, options, paramName)}
                  placeholder={`Add ${title.toLowerCase().slice(0, -1)}...`}
                  className="w-full text-sm px-3 py-2 bg-[var(--color-rustic-bg)] border border-[var(--color-rustic-muted)]/30 rounded-lg focus:outline-none focus:border-[var(--color-rustic-accent)] focus:ring-1 focus:ring-[var(--color-rustic-accent)] text-[var(--color-rustic-text)] placeholder:text-[var(--color-rustic-muted)]/50"
                />
                {customInputProps.value && (
                  <button 
                    onClick={(e) => {
                      const pseudoEvent = { key: 'Enter', preventDefault: () => {} } as unknown as KeyboardEvent<HTMLInputElement>;
                      handleAddCustom(pseudoEvent, customInputProps.value, customInputProps.setter, customInputProps.customListSetter, options, paramName);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-rustic-accent)]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const getActiveFilters = () => {
    const filters: { paramName: string; value: string; display: string }[] = []
    const paramsToCheck = ['category', 'ingredients', 'difficulty', 'preptime', 'dietary', 'cuisine', 'occasion', 'rating', 'source']
    
    paramsToCheck.forEach(param => {
      const values = searchParams.get(param)?.split(',').filter(Boolean) || []
      values.forEach(val => {
        filters.push({
          paramName: param,
          value: val,
          display: val
        })
      })
    })
    
    return filters
  }

  const activeFilters = getActiveFilters()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden flex items-center justify-between w-full p-4 bg-[var(--color-rustic-card)] border border-[var(--color-rustic-muted)]/20 rounded-xl font-bold text-[var(--color-rustic-text)]"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--color-rustic-muted)]" />
          <span>Filters {activeFilters.length > 0 && `(${activeFilters.length})`}</span>
        </div>
        {isMobileOpen ? <ChevronUp className="w-5 h-5 text-[var(--color-rustic-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--color-rustic-muted)]" />}
      </button>

      <div className={`flex-col gap-4 ${isMobileOpen ? 'flex' : 'hidden'} md:flex`}>
      {activeFilters.length > 0 && (
        <div className="bg-[var(--color-rustic-card)] p-4 rounded-xl border border-[var(--color-rustic-muted)]/20 shadow-sm mb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--color-rustic-text)]">Current Filters</h3>
            <button 
              onClick={() => router.push(pathname)}
              className="text-xs text-[var(--color-rustic-muted)] hover:text-[var(--color-rustic-accent)] transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, idx) => (
              <div 
                key={`${filter.paramName}-${filter.value}-${idx}`}
                className="flex items-center gap-1.5 bg-[var(--color-rustic-bg)] border border-[var(--color-rustic-muted)]/30 px-2.5 py-1 rounded-full text-xs font-medium text-[var(--color-rustic-text)] group"
              >
                <span>{filter.display}</span>
                <button 
                  onClick={() => handleToggleParam(filter.paramName, filter.value)}
                  className="text-[var(--color-rustic-muted)] group-hover:text-red-500 transition-colors flex items-center justify-center w-3 h-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {renderSection('Source', 'source', ['Original', 'Imported'])}
      {renderSection('Categories', 'category', CATEGORIES)}
      {renderSection('Ingredients', 'ingredients', Array.from(new Set([...DEFAULT_INGREDIENTS, ...customIngredients])), { value: newIngredient, setter: setNewIngredient, customListSetter: setCustomIngredients })}
      {renderSection('Difficulty', 'difficulty', DIFFICULTIES)}
      {renderSection('Rating', 'rating', RATINGS)}
      {renderSection('Prep Time', 'preptime', PREP_TIMES)}
      {renderSection('Dietary Needs', 'dietary', DIETARY_NEEDS)}
      {renderSection('Cuisine', 'cuisine', Array.from(new Set([...DEFAULT_CUISINES, ...customCuisines])), { value: newCuisine, setter: setNewCuisine, customListSetter: setCustomCuisines })}
      {renderSection('Occasion', 'occasion', Array.from(new Set([...DEFAULT_OCCASIONS, ...customOccasions])), { value: newOccasion, setter: setNewOccasion, customListSetter: setCustomOccasions })}
      </div>
    </div>
  )
}
