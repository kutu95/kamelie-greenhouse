import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
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
  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
