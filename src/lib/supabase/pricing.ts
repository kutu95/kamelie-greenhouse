import { createClient } from './client'
import { Database } from '@/types/database'

type PricingMatrix = Database['public']['Tables']['pricing_matrix']['Row']
type Cultivar = Database['public']['Tables']['cultivars']['Row']

export interface PriceRange {
  min_price: number
  max_price: number
  available_ages: number[]
}

export interface PricingOptions {
  age_years: number
  price: number
}

/**
 * Calculate plant price based on cultivar price group and age
 */
export async function calculatePlantPrice(
  cultivarPriceGroup: 'A' | 'B' | 'C',
  ageYears: number
): Promise<number> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.rpc('calculate_plant_price', {
      cultivar_price_group: cultivarPriceGroup,
      plant_age_years: ageYears
    })
    
    if (error) throw error
    return data || 0
  } catch (error) {
    console.error('Error calculating plant price:', error)
    // Fallback calculation
    return calculateFallbackPrice(cultivarPriceGroup, ageYears)
  }
}

/**
 * Get price range for a cultivar price group
 */
export async function getCultivarPriceRange(
  priceGroup: 'A' | 'B' | 'C'
): Promise<PriceRange | null> {
  const supabase = createClient()
  
  try {
    // Try to get data from pricing_matrix table directly
    const { data, error } = await supabase
      .from('pricing_matrix')
      .select('base_price_euros')
      .eq('price_group', priceGroup)
      .order('base_price_euros', { ascending: true })
    
    if (error) {
      console.error('Error fetching price range from pricing_matrix:', error)
      // Return fallback pricing
      return getFallbackPriceRange(priceGroup)
    }
    
    if (!data || data.length === 0) {
      // Return fallback pricing if no data found
      return getFallbackPriceRange(priceGroup)
    }
    
    const prices = data.map(row => row.base_price_euros)
    const min_price = Math.min(...prices)
    const max_price = Math.max(...prices)
    
    return { 
      min_price, 
      max_price, 
      available_ages: [3, 4, 5, 6] 
    }
  } catch (error) {
    console.error('Error getting price range:', error)
    // Return fallback pricing instead of null
    return getFallbackPriceRange(priceGroup)
  }
}

/**
 * Get all pricing options for a cultivar
 */
export async function getPricingOptions(
  priceGroup: 'A' | 'B' | 'C'
): Promise<PricingOptions[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('pricing_matrix')
      .select('age_years, base_price_euros')
      .eq('price_group', priceGroup)
      .eq('is_available', true)
      .order('age_years')
    
    if (error) throw error
    
    return data.map(item => ({
      age_years: item.age_years,
      price: item.base_price_euros
    }))
  } catch (error) {
    console.error('Error getting pricing options:', error)
    return []
  }
}

/**
 * Get fallback price range when database functions aren't available
 */
function getFallbackPriceRange(priceGroup: 'A' | 'B' | 'C'): PriceRange {
  switch (priceGroup) {
    case 'A':
      return { min_price: 21, max_price: 59, available_ages: [3, 4, 5, 6] }
    case 'B':
      return { min_price: 28, max_price: 69, available_ages: [3, 4, 5, 6] }
    case 'C':
      return { min_price: 37, max_price: 79, available_ages: [3, 4, 5, 6] }
    default:
      return { min_price: 21, max_price: 59, available_ages: [3, 4, 5, 6] }
  }
}

/**
 * Fallback price calculation when database function fails
 * Based on actual PDF pricing data
 */
function calculateFallbackPrice(
  priceGroup: 'A' | 'B' | 'C',
  ageYears: number
): number {
  // Use actual prices from PDF data
  const pricingMatrix: Record<string, Record<number, number>> = {
    A: { 3: 21.00, 4: 32.00, 5: 47.00, 6: 59.00 },
    B: { 3: 28.00, 4: 39.00, 5: 59.00, 6: 69.00 },
    C: { 3: 37.00, 4: 53.00, 5: 69.00, 6: 79.00 }
  }
  
  // Get price for exact age match
  if (pricingMatrix[priceGroup][ageYears]) {
    return pricingMatrix[priceGroup][ageYears]
  }
  
  // If age not in matrix, use closest age
  const availableAges = Object.keys(pricingMatrix[priceGroup]).map(Number).sort()
  let closestAge = availableAges[0]
  
  for (const age of availableAges) {
    if (age <= ageYears) {
      closestAge = age
    } else {
      break
    }
  }
  
  return pricingMatrix[priceGroup][closestAge]
}

/**
 * Format price for display
 */
export function formatPrice(price: number, locale: string = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(price)
}

/**
 * Get price group description
 */
export function getPriceGroupDescription(priceGroup: 'A' | 'B' | 'C', locale: string = 'de'): string {
  const descriptions = {
    de: {
      A: 'Häufige Sorten',
      B: 'Mittlere Seltenheit',
      C: 'Seltene Sorten'
    },
    en: {
      A: 'Common Varieties',
      B: 'Medium Rarity',
      C: 'Rare Varieties'
    }
  }
  
  return descriptions[locale as keyof typeof descriptions]?.[priceGroup] || priceGroup
}
