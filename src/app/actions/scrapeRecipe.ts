'use server'

import * as cheerio from 'cheerio'

export type ScrapedRecipe = {
  title: string
  description?: string
  ingredients: string[]
  prep_instructions: string
  cook_instructions?: string
  prep_time?: string
  cook_time?: string
  image_url?: string
  source_url: string
  difficulty?: string
  cuisine?: string
  occasion?: string
  dietary_needs?: string[]
}

export async function scrapeRecipeFromUrl(url: string): Promise<{ data?: ScrapedRecipe; error?: string }> {
  try {
    const apiKey = process.env.SCRAPER_API_KEY
    let fetchUrl = url
    
    // If we have a scraping API key, route the request through their proxy
    if (apiKey) {
      // Using ScraperAPI format as the default with premium proxies enabled
      fetchUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&premium=true`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout to allow scraperapi to work

    const response = await fetch(fetchUrl, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      return { error: `Failed to fetch URL: ${response.statusText}` }
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    let recipeData: any = null

    // Look through all JSON-LD scripts
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const content = $(element).html()
        if (content) {
          const json = JSON.parse(content)
          
          // Helper to find Recipe in a json object or array
          const findRecipe = (obj: unknown): Record<string, unknown> | null => {
            if (!obj) return null
            if (Array.isArray(obj)) {
              for (const item of obj) {
                const found = findRecipe(item)
                if (found) return found
              }
            } else if (typeof obj === 'object') {
              const record = obj as Record<string, unknown>
              if (record['@type'] === 'Recipe' || (Array.isArray(record['@type']) && record['@type'].includes('Recipe'))) {
                return record
              }
              // Often schema is nested inside @graph
              if (record['@graph']) {
                return findRecipe(record['@graph'])
              }
            }
            return null
          }

          const found = findRecipe(json)
          if (found) {
            recipeData = found
            return false // break loop
          }
        }
      } catch {
        // Skip invalid JSON
      }
    })

    if (!recipeData) {
      return { error: 'Could not find standard recipe data on this page.' }
    }

    // Parse ingredients
    let ingredients: string[] = []
    if (Array.isArray(recipeData.recipeIngredient)) {
      ingredients = recipeData.recipeIngredient as string[]
    }

    // Parse instructions
    let instructionsText = ''
    if (Array.isArray(recipeData.recipeInstructions)) {
      instructionsText = recipeData.recipeInstructions
        .map((step: Record<string, string>) => step.text || step.name || '')
        .filter(Boolean)
        .join('\n\n')
    } else if (typeof recipeData.recipeInstructions === 'string') {
      instructionsText = recipeData.recipeInstructions
    }

    // Parse image
    let imageUrl = ''
    if (recipeData.image) {
      if (typeof recipeData.image === 'string') {
        imageUrl = recipeData.image
      } else if (Array.isArray(recipeData.image) && recipeData.image.length > 0) {
        imageUrl = typeof recipeData.image[0] === 'string' ? recipeData.image[0] : (recipeData.image[0] as Record<string, string>).url
      } else if (typeof recipeData.image === 'object') {
        imageUrl = (recipeData.image as Record<string, string>).url || ''
      }
    }

    const formatTime = (isoTime: string | unknown) => {
      if (typeof isoTime !== 'string' || !isoTime) return ''
      return isoTime.replace('PT', '').replace('H', ' hr ').replace('M', ' min').trim()
    }

    return {
      data: {
        title: (recipeData.name as string) || '',
        description: (recipeData.description as string) || '',
        ingredients,
        prep_instructions: instructionsText, // Mapping all instructions to prep for now, user can split them manually if needed
        cook_instructions: '',
        prep_time: formatTime(recipeData.prepTime),
        cook_time: formatTime(recipeData.cookTime),
        image_url: imageUrl,
        source_url: url,
      },
    }
  } catch (err: unknown) {
    return { error: `An error occurred: ${(err as Error).message}` }
  }
}
