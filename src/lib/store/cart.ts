import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/database'

type Plant = Database['public']['Tables']['plants']['Row']
type Cultivar = Database['public']['Tables']['cultivars']['Row']
type Species = Database['public']['Tables']['species']['Row']

export interface CartItem {
  plant: Plant & {
    cultivars: Cultivar & {
      species: Species
    }
  }
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (plantId: string) => void
  updateQuantity: (plantId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItem = get().items.find(
          (cartItem) => cartItem.plant.id === item.plant.id
        )
        
        if (existingItem) {
          set((state) => ({
            items: state.items.map((cartItem) =>
              cartItem.plant.id === item.plant.id
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem
            ),
          }))
        } else {
          set((state) => ({ items: [...state.items, item] }))
        }
      },
      removeItem: (plantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.plant.id !== plantId),
        }))
      },
      updateQuantity: (plantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(plantId)
          return
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.plant.id === plantId ? { ...item, quantity } : item
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.plant.price_euros || 0) * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
