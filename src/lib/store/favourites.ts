import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/database'

type Plant = Database['public']['Tables']['plants']['Row']
type Cultivar = Database['public']['Tables']['cultivars']['Row']
type Species = Database['public']['Tables']['species']['Row']
type Product = Database['public']['Tables']['products']['Row']

export interface FavouriteItem {
  id: string
  type: 'plant' | 'product'
  name: string
  price: number
  image_url?: string
  description?: string
  
  // For plants
  plant?: Plant & {
    cultivar: Cultivar & {
      species: Species
    }
  }
  
  // For products
  product?: Product
}

interface FavouritesState {
  items: FavouriteItem[]
  addPlant: (plant: Plant & { cultivar: Cultivar & { species: Species } }) => void
  addProduct: (product: Product) => void
  removeItem: (itemId: string) => void
  isFavourite: (itemId: string) => boolean
  clearFavourites: () => void
  getTotalItems: () => number
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      items: [],
      addPlant: (plant) => {
        const favouriteItem: FavouriteItem = {
          id: plant.id,
          type: 'plant',
          name: plant.cultivar.cultivar_name,
          price: plant.price_euros || 0,
          plant: plant,
          image_url: plant.cultivar.photo_url || undefined,
          description: `${plant.cultivar.species.scientific_name} - ${plant.age_years} years`
        }
        
        const existingItem = get().items.find(
          (item) => item.id === favouriteItem.id && item.type === 'plant'
        )
        
        if (!existingItem) {
          set((state) => ({ items: [...state.items, favouriteItem] }))
        }
      },
      addProduct: (product) => {
        const favouriteItem: FavouriteItem = {
          id: product.id,
          type: 'product',
          name: product.name,
          price: product.price_euros,
          product: product,
          image_url: product.image_url || undefined,
          description: product.description || undefined
        }
        
        const existingItem = get().items.find(
          (item) => item.id === favouriteItem.id && item.type === 'product'
        )
        
        if (!existingItem) {
          set((state) => ({ items: [...state.items, favouriteItem] }))
        }
      },
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId)
        }))
      },
      isFavourite: (itemId) => {
        return get().items.some((item) => item.id === itemId)
      },
      clearFavourites: () => {
        set({ items: [] })
      },
      getTotalItems: () => {
        return get().items.length
      }
    }),
    {
      name: 'favourites-storage',
    }
  )
)
