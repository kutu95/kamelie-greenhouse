import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/database'

type Cultivar = Database['public']['Tables']['cultivars']['Row']
type Species = Database['public']['Tables']['species']['Row']
type Product = Database['public']['Tables']['products']['Row']

// Unified cart item that can hold either a cultivar or a product
export interface CartItem {
  id: string
  type: 'cultivar' | 'product'
  name: string
  price: number
  quantity: number
  age_years: number
  
  // For cultivars
  cultivar?: Cultivar & {
    species: Species
  }
  
  // For products
  product?: Product
  
  // Additional info for display
  image_url?: string
  description?: string
}

interface CartState {
  items: CartItem[]
  addCultivar: (cultivar: Cultivar & { species: Species }, age_years: number, quantity?: number) => void
  addProduct: (product: Product, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  cleanInvalidItems: () => void
}

// Helper function to validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addCultivar: (cultivar, age_years, quantity = 1) => {
        const cartItem: CartItem = {
          id: `${cultivar.id}-${age_years}`, // Unique ID for cultivar + age combination
          type: 'cultivar',
          name: cultivar.cultivar_name,
          price: 0, // Will be calculated based on price_group and age
          quantity: quantity,
          age_years: age_years,
          cultivar: cultivar,
          image_url: cultivar.photo_url || undefined,
          description: `${cultivar.species.scientific_name} - ${age_years} years`
        }
        
        const existingItem = get().items.find(
          (item) => item.id === cartItem.id && item.type === 'cultivar'
        )
        
        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === cartItem.id && item.type === 'cultivar'
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }))
        } else {
          set((state) => ({ items: [...state.items, cartItem] }))
        }
      },
      addProduct: (product, quantity = 1) => {
        const cartItem: CartItem = {
          id: product.id,
          type: 'product',
          name: product.name_de,
          price: product.price_euros || 0,
          quantity: quantity,
          product: product,
          image_url: product.image_url || undefined,
          description: product.description_de || undefined
        }
        
        const existingItem = get().items.find(
          (item) => item.id === cartItem.id && item.type === 'product'
        )
        
        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === cartItem.id && item.type === 'product'
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }))
        } else {
          set((state) => ({ items: [...state.items, cartItem] }))
        }
      },
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }))
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
      cleanInvalidItems: () => {
        const currentItems = get().items
        const validItems = currentItems.filter(item => {
          if (item.type === 'cultivar') {
            // For cultivars, check if the ID format is correct (cultivar_id-age)
            const parts = item.id.split('-')
            return parts.length === 2 && isValidUUID(parts[0]) && !isNaN(parseInt(parts[1]))
          } else if (item.type === 'product') {
            // For products, check if it's a valid UUID
            return isValidUUID(item.id)
          }
          return false
        })
        if (validItems.length !== currentItems.length) {
          console.log(`Removed ${currentItems.length - validItems.length} invalid cart items`)
          set({ items: validItems })
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
