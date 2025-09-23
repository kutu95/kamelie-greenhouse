import { createClient } from './client'
import { Database } from '@/types/database'

type PricingMatrix = Database['public']['Tables']['pricing_matrix']['Row']
type Cultivar = Database['public']['Tables']['cultivars']['Row']

export interface PriceRange {
  min_price: number
  max_price: number
  available_sizes: string[]
}

export interface PricingOptions {
  age_years: number
  pot_size: string
  price: number
}

/**
 * Calculate plant price based on cultivar price group, age, and pot size
 */
export async function calculatePlantPrice(
  cultivarPriceGroup: 'A' | 'B' | 'C',
  ageYears: number,
  potSize: string
): Promise<number> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.rpc('calculate_plant_price', {
      cultivar_price_group: cultivarPriceGroup,
      plant_age_years: ageYears,
      plant_pot_size: potSize
    })
    
    if (error) throw error
    return data || 0
  } catch (error) {
    console.error('Error calculating plant price:', error)
    // Fallback calculation
    return calculateFallbackPrice(cultivarPriceGroup, ageYears, potSize)
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
      available_sizes: ['5L', '10L', '15L', '20L'] 
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
      .select('age_years, pot_size, base_price_euros')
      .eq('price_group', priceGroup)
      .eq('is_available', true)
      .order('age_years')
      .order('pot_size')
    
    if (error) throw error
    
    return data.map(item => ({
      age_years: item.age_years,
      pot_size: item.pot_size,
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
      return { min_price: 15, max_price: 100, available_sizes: ['5L', '10L', '15L', '20L'] }
    case 'B':
      return { min_price: 25, max_price: 170, available_sizes: ['5L', '10L', '15L', '20L'] }
    case 'C':
      return { min_price: 40, max_price: 340, available_sizes: ['5L', '10L', '20L'] }
    default:
      return { min_price: 15, max_price: 100, available_sizes: ['5L', '10L', '15L', '20L'] }
  }
}

/**
 * Fallback price calculation when database function fails
 */
function calculateFallbackPrice(
  priceGroup: 'A' | 'B' | 'C',
  ageYears: number,
  potSize: string
): number {
  let basePrice = 25.00
  
  // Base prices by group
  switch (priceGroup) {
    case 'A':
      basePrice = 25.00
      break
    case 'B':
      basePrice = 45.00
      break
    case 'C':
      basePrice = 75.00
      break
  }
  
  // Age multipliers
  let ageMultiplier = 1.0
  if (ageYears <= 2) ageMultiplier = 1.0
  else if (ageYears <= 5) ageMultiplier = 1.5
  else if (ageYears <= 10) ageMultiplier = 2.0
  else ageMultiplier = 2.5
  
  // Size multipliers
  let sizeMultiplier = 1.0
  switch (potSize) {
    case '5L':
      sizeMultiplier = 1.0
      break
    case '10L':
      sizeMultiplier = 1.3
      break
    case '15L':
      sizeMultiplier = 1.6
      break
    case '20L':
      sizeMultiplier = 2.0
      break
  }
  
  return Math.round(basePrice * ageMultiplier * sizeMultiplier * 100) / 100
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
