'use client'

import { useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Plant = Database['public']['Tables']['plants']['Row']
type Cultivar = Database['public']['Tables']['cultivars']['Row']
type Species = Database['public']['Tables']['species']['Row']
type Product = Database['public']['Tables']['products']['Row']

export function useAuthCart() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const supabase = createClient()
  const { addPlant, addProduct } = useCartStore()

  const checkAuthAndAddPlant = useCallback(async (
    plant: Plant & { cultivar: Cultivar & { species: Species } }, 
    quantity?: number
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Store the intended action and redirect to login
      localStorage.setItem('pendingCartAction', JSON.stringify({
        type: 'plant',
        data: plant,
        quantity: quantity || 1
      }))
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return false
    }

    addPlant(plant, quantity)
    return true
  }, [supabase.auth, router, locale, addPlant])

  const checkAuthAndAddProduct = useCallback(async (
    product: Product, 
    quantity?: number
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Store the intended action and redirect to login
      localStorage.setItem('pendingCartAction', JSON.stringify({
        type: 'product',
        data: product,
        quantity: quantity || 1
      }))
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return false
    }

    addProduct(product, quantity)
    return true
  }, [supabase.auth, router, locale, addProduct])

  return {
    addPlant: checkAuthAndAddPlant,
    addProduct: checkAuthAndAddProduct,
  }
}

