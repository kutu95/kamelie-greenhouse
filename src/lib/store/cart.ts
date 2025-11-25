import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/database'
import { calculatePlantPrice } from '@/lib/supabase/pricing'

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
  age_years?: number // Optional - only required for cultivars
  
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
  isSyncing: boolean
  addCultivar: (cultivar: Cultivar & { species: Species }, age_years: number, quantity?: number) => Promise<void>
  addProduct: (product: Product, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  cleanInvalidItems: () => void
  calculateItemPrice: (item: CartItem) => Promise<number>
  syncCartToDatabase: () => Promise<void>
  loadCartFromDatabase: () => Promise<void>
}

// Helper function to validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      syncCartToDatabase: async () => {
        // Only sync if not already syncing
        if (get().isSyncing) return
        
        set({ isSyncing: true })
        try {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: get().items }),
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            console.error('Failed to sync cart to database:', data)
          } else if (data.message && !data.success) {
            console.warn('Cart sync warning:', data.message)
          }
        } catch (error) {
          console.error('Error syncing cart to database:', error)
        } finally {
          set({ isSyncing: false })
        }
      },
      loadCartFromDatabase: async () => {
        // Only load if not already syncing
        if (get().isSyncing) return
        
        set({ isSyncing: true })
        try {
          const response = await fetch('/api/cart', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          const data = await response.json()
          
          if (response.ok && data.items && Array.isArray(data.items)) {
            if (data.items.length > 0) {
              // Merge with existing items, prioritizing database items
              const dbItems = data.items
              const localItems = get().items
              
              // Create a map of existing local items by ID
              const localItemsMap = new Map(localItems.map(item => [item.id, item]))
              
              // For each DB item, either replace local item or add new one
              const mergedItems = dbItems.map((dbItem: CartItem) => {
                const localItem = localItemsMap.get(dbItem.id)
                // Prefer DB item, but keep local item's updated price if it exists
                return localItem ? { ...dbItem, price: localItem.price } : dbItem
              })
              
              // Add any local items that aren't in DB (for anonymous users who just logged in)
              dbItems.forEach((dbItem: CartItem) => localItemsMap.delete(dbItem.id))
              localItemsMap.forEach((item) => mergedItems.push(item))
              
              set({ items: mergedItems })
              // Sync back to ensure DB has all items
              await get().syncCartToDatabase()
            }
          }
        } catch (error) {
          console.error('Error loading cart from database:', error)
        } finally {
          set({ isSyncing: false })
        }
      },
      addCultivar: async (cultivar, age_years, quantity = 1) => {
        try {
          // Calculate price based on cultivar price_group and age
          const price = await calculatePlantPrice(cultivar.price_group as 'A' | 'B' | 'C', age_years)
          
          const cartItem: CartItem = {
            id: `${cultivar.id}-${age_years}`, // Unique ID for cultivar + age combination
            type: 'cultivar',
            name: cultivar.cultivar_name,
            price: price,
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
          
          // Sync to database after adding
          await get().syncCartToDatabase()
        } catch (error) {
          console.error('Error calculating price for cultivar:', error)
          // Add with price 0 if calculation fails
          const cartItem: CartItem = {
            id: `${cultivar.id}-${age_years}`,
            type: 'cultivar',
            name: cultivar.cultivar_name,
            price: 0,
            quantity: quantity,
            age_years: age_years,
            cultivar: cultivar,
            image_url: cultivar.photo_url || undefined,
            description: `${cultivar.species.scientific_name} - ${age_years} years`
          }
          set((state) => ({ items: [...state.items, cartItem] }))
          // Sync to database after adding
          await get().syncCartToDatabase()
        }
      },
      addProduct: async (product, quantity = 1) => {
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
        
        // Sync to database after adding
        await get().syncCartToDatabase()
      },
      removeItem: async (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }))
        // Sync to database after removing
        await get().syncCartToDatabase()
      },
      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(itemId)
          return
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }))
        // Sync to database after updating
        await get().syncCartToDatabase()
      },
      clearCart: async () => {
        set({ items: [] })
        // Sync to database after clearing
        await get().syncCartToDatabase()
      },
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
            // UUIDs have 5 hyphens, so we need to split from the last hyphen
            const lastHyphenIndex = item.id.lastIndexOf('-')
            if (lastHyphenIndex === -1) {
              return false
            }
            
            const cultivarId = item.id.substring(0, lastHyphenIndex)
            const ageStr = item.id.substring(lastHyphenIndex + 1)
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cultivarId)
            const age = parseInt(ageStr)
            const isValidAge = !isNaN(age) && age > 0
            
            return isValidUUID && isValidAge
          } else if (item.type === 'product') {
            // For products, check if it's a valid UUID
            const isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
            return isValid
          }
          return false
        })
        if (validItems.length !== currentItems.length) {
          set({ items: validItems })
        }
      },
      calculateItemPrice: async (item: CartItem) => {
        if (item.type === 'cultivar' && item.cultivar?.price_group && item.age_years) {
          try {
            return await calculatePlantPrice(item.cultivar.price_group as 'A' | 'B' | 'C', item.age_years)
          } catch (error) {
            console.error('Error calculating price for cart item:', error)
            return 0
          }
        }
        return item.price
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
