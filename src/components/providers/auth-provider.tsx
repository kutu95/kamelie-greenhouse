'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    console.log('AuthProvider - Starting auth check')
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      console.log('AuthProvider - Getting session')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('AuthProvider - Session:', session?.user?.email)
      
      if (session?.user) {
        setUser(session.user)
        
        // Fetch user profile with role
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user_roles:role_id(*)
          `)
          .eq('id', session.user.id)
          .single()
        
        console.log('AuthProvider - Profile data:', profile)
        console.log('AuthProvider - Profile error:', error)
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
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user_roles:role_id(*)
          `)
          .eq('id', session.user.id)
          .single()
        
        console.log('AuthProvider - Profile data:', profile)
        console.log('AuthProvider - Profile error:', error)
        setProfile(profile)
      } else {
        setUser(null)
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading])

  console.log('AuthProvider - Rendering children')
  return <>{children}</>
}
