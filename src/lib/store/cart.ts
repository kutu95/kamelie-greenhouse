import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/database'

type Plant = Database['public']['Tables']['plants']['Row']
type Cultivar = Database['public']['Tables']['cultivars']['Row']
type Species = Database['public']['Tables']['species']['Row']
type Product = Database['public']['Tables']['products']['Row']

// Unified cart item that can hold either a plant or a product
export interface CartItem {
  id: string
  type: 'plant' | 'product'
  name: string
  price: number
  quantity: number
  
  // For plants
  plant?: Plant & {
    cultivar: Cultivar & {
      species: Species
    }
  }
  
  // For products
  product?: Product
  
  // Additional info for display
  image_url?: string
  description?: string
}

interface CartState {
  items: CartItem[]
  addPlant: (plant: Plant & { cultivar: Cultivar & { species: Species } }) => void
  addProduct: (product: Product) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addPlant: (plant) => {
        const cartItem: CartItem = {
          id: plant.id,
          type: 'plant',
          name: plant.cultivar.cultivar_name,
          price: plant.price_euros || 0,
          quantity: 1,
          plant: plant,
          image_url: plant.cultivar.photo_url,
          description: plant.cultivar.species.scientific_name
        }
        
        const existingItem = get().items.find(
          (item) => item.id === cartItem.id && item.type === 'plant'
        )
        
        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === cartItem.id && item.type === 'plant'
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }))
        } else {
          set((state) => ({ items: [...state.items, cartItem] }))
        }
      },
      addProduct: (product) => {
        const cartItem: CartItem = {
          id: product.id,
          type: 'product',
          name: product.name_de,
          price: product.price_euros || 0,
          quantity: 1,
          product: product,
          image_url: product.image_url,
          description: product.description_de
        }
        
        const existingItem = get().items.find(
          (item) => item.id === cartItem.id && item.type === 'product'
        )
        
        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === cartItem.id && item.type === 'product'
                ? { ...item, quantity: item.quantity + 1 }
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
    }),
    {
      name: 'cart-storage',
    }
  )
)
