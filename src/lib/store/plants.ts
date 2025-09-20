import { create } from 'zustand'

// Types
export interface Plant {
  id: string
  cultivar_id: string
  plant_code: string
  age_years: number
  height_cm: number
  width_cm: number
  pot_size: string
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
    year_introduced: number | null
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
    image_url: string
    alt_text_de: string
    alt_text_en: string
    is_featured: boolean
    sort_order: number
  }>
}

export interface Species {
  id: string
  scientific_name: string
  common_name_de: string
  common_name_en: string
}

interface PlantsState {
  plants: Plant[]
  species: Array<{ id: number; scientific_name: string; common_name_de: string; common_name_en: string }>
  loading: boolean
  error: string | null
  total: number
  filters: {
    search: string
    species: string
    price_min: number | null
    price_max: number | null
    status: string
  }
  pagination: {
    page: number
    limit: number
  }
}

interface PlantsActions {
  fetchPlants: () => Promise<void>
  fetchSpecies: () => Promise<void>
  setFilters: (filters: Partial<PlantsState['filters']>) => void
  setPagination: (pagination: Partial<PlantsState['pagination']>) => void
  resetFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const initialState: PlantsState = {
  plants: [],
  species: [],
  loading: false,
  error: null,
  total: 0,
  filters: {
    search: '',
    species: '',
    price_min: null,
    price_max: null,
    status: 'available'
  },
  pagination: {
    page: 1,
    limit: 12
  }
}

export const usePlantsStore = create<PlantsState & PlantsActions>((set, get) => ({
  ...initialState,

  fetchPlants: async () => {
    const { filters, pagination } = get()
    set({ loading: true, error: null })

    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.species) params.append('species', filters.species)
      if (filters.price_min) params.append('price_min', filters.price_min.toString())
      if (filters.price_max) params.append('price_max', filters.price_max.toString())
      if (filters.status) params.append('status', filters.status)
      params.append('limit', pagination.limit.toString())
      params.append('offset', ((pagination.page - 1) * pagination.limit).toString())

      const response = await fetch(`/api/plants?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch plants')
      }
      
      const { plants, total } = await response.json()
      set({ plants, total, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch plants',
        loading: false 
      })
    }
  },

  fetchSpecies: async () => {
    set({ loading: true, error: null })

    try {
      const response = await fetch('/api/species')
      if (!response.ok) {
        throw new Error('Failed to fetch species')
      }
      
      const species = await response.json()
      set({ species, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch species',
        loading: false 
      })
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page when filters change
    }))
  },

  setPagination: (newPagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination }
    }))
  },

  resetFilters: () => {
    set({ filters: initialState.filters, pagination: initialState.pagination })
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))
