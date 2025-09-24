import { createClient } from '@/lib/supabase/client'

export interface Plant {
  id: string
  cultivar_id: string
  plant_code: string
  age_years: number
  height_cm: number
  width_cm: number
  price_band: string
  price_euros: number
  status: string
  location: string
  notes: string
  is_quick_buy: boolean
  created_at: string
  updated_at: string
  cultivar: {
    id: string
    cultivar_name: string
    breeder: string
    year_introduced: number
    flower_color: string
    flower_form: string
    flower_size: string
    foliage_type: string
    growth_habit: string
    special_characteristics: string
    species: {
      id: string
      scientific_name: string
      common_name_de: string
      common_name_en: string
      description_de: string
      description_en: string
    }
  }
  photos: Array<{
    id: string
    photo_url: string
    alt_text_de: string
    alt_text_en: string
    is_primary: boolean
    sort_order: number
  }>
}

export async function getPlants(filters?: {
  search?: string
  species?: string
  price_min?: number
  price_max?: number
  status?: string
  limit?: number
  offset?: number
}): Promise<{ plants: Plant[]; total: number }> {
  const supabase = createClient()
  
  let query = supabase
    .from('plants')
    .select(`
      *,
      cultivar:cultivars(
        *,
        species:species(*)
      ),
      photos:plant_photos(*)
    `)
    .eq('status', 'available')

  // Apply filters
  if (filters?.search) {
    query = query.or(`cultivar.cultivar_name.ilike.%${filters.search}%,cultivar.species.scientific_name.ilike.%${filters.search}%`)
  }

  if (filters?.species) {
    query = query.eq('cultivar.species.scientific_name', filters.species)
  }

  if (filters?.price_min) {
    query = query.gte('price_euros', filters.price_min)
  }

  if (filters?.price_max) {
    query = query.lte('price_euros', filters.price_max)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  // Get total count for pagination
  const { count } = await supabase
    .from('plants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  // Apply pagination
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching plants:', error)
    throw new Error('Failed to fetch plants')
  }

  return {
    plants: data || [],
    total: count || 0
  }
}

export async function getPlantById(id: number): Promise<Plant | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('plants')
    .select(`
      *,
      cultivar:cultivars(
        *,
        species:species(*)
      ),
      photos:plant_photos(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching plant:', error)
    return null
  }

  return data
}

export async function getSpecies(): Promise<Array<{ id: number; scientific_name: string; common_name_de: string; common_name_en: string }>> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('species')
    .select('id, scientific_name, common_name_de, common_name_en')
    .order('scientific_name')

  if (error) {
    console.error('Error fetching species:', error)
    return []
  }

  return data || []
}
