import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isLoggingOut: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setIsLoggingOut: (isLoggingOut: boolean) => void
  signOut: () => Promise<void>
  resetLogoutState: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  isLoggingOut: false,
  setUser: (user) => {
    console.log('AuthStore - Setting user:', user?.email)
    set({ user })
  },
  setProfile: (profile) => {
    console.log('AuthStore - Setting profile:', profile)
    set({ profile })
  },
  setLoading: (loading) => {
    console.log('AuthStore - Setting loading:', loading)
    set({ loading })
  },
  setIsLoggingOut: (isLoggingOut) => {
    console.log('AuthStore - Setting isLoggingOut:', isLoggingOut)
    set({ isLoggingOut })
  },
  signOut: async () => {
    console.log('AuthStore - SignOut called')
    set({ isLoggingOut: true, user: null, profile: null, loading: false })
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('AuthStore - SignOut error:', error)
      } else {
        console.log('AuthStore - SignOut successful')
      }
    } catch (error) {
      console.error('AuthStore - SignOut exception:', error)
    }
    
    // Don't reset isLoggingOut here - let the page redirect handle it
    // This prevents the AuthProvider from overriding the logout state
  },
  resetLogoutState: () => {
    console.log('AuthStore - Resetting logout state')
    set({ isLoggingOut: false })
  },
}))
