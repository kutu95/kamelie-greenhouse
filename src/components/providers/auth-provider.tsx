'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        
        // Fetch user profile with role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user_roles(*)
          `)
          .eq('id', session.user.id)
          .single()
        
        setProfile(profile)
      } else {
        setUser(null)
        setProfile(null)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        
        // Fetch user profile with role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user_roles(*)
          `)
          .eq('id', session.user.id)
          .single()
        
        setProfile(profile)
      } else {
        setUser(null)
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading])

  return <>{children}</>
}
