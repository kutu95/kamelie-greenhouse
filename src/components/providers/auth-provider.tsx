'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, isLoggingOut } = useAuthStore()
  const [hasMounted, setHasMounted] = useState(false)
  const profileFetchingRef = useRef(false)

  useEffect(() => {
    // Track when component has mounted (prevents hydration mismatch)
    setHasMounted(true)
    
    const supabase = createClient()

    // Set a shorter timeout to ensure loading is set to false even if something goes wrong
    const loadingTimeout = setTimeout(() => {
      console.log('AuthProvider - Loading timeout, setting loading to false')
      setLoading(false)
    }, 2000) // 2 second timeout

    // Load user profile function
    const loadUserProfile = async (userId: string) => {
      // Prevent duplicate profile fetches
      if (profileFetchingRef.current) {
        console.log('AuthProvider - Profile fetch already in progress, skipping')
        return
      }

      try {
        profileFetchingRef.current = true
        console.log('AuthProvider - Loading profile for user:', userId)
        
        // Fetch profile directly without timeout
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        console.log('AuthProvider - Profile data:', profile)
        console.log('AuthProvider - Profile error:', error)

        if (error) {
          console.error('AuthProvider - Profile fetch failed:', error)
          setProfile(null)
        } else {
          console.log('AuthProvider - Profile fetch successful')
          
          // Now fetch the role separately
          if (profile?.role_id) {
            console.log('AuthProvider - Fetching role for role_id:', profile.role_id)
            try {
              const { data: role, error: roleError } = await supabase
                .from('user_roles')
                .select('name')
                .eq('id', profile.role_id)
                .single()
              
              console.log('AuthProvider - Role data:', role)
              console.log('AuthProvider - Role error:', roleError)
              
              if (roleError) {
                console.error('AuthProvider - Role fetch failed:', roleError)
                setProfile({ ...profile, user_roles: null })
              } else {
                console.log('AuthProvider - Role fetch successful')
                setProfile({ ...profile, user_roles: role })
              }
            } catch (roleError) {
              console.error('AuthProvider - Role fetch exception:', roleError)
              setProfile({ ...profile, user_roles: null })
            }
          } else {
            console.log('AuthProvider - No role_id, setting profile without role')
            setProfile(profile)
          }
        }
      } catch (error) {
        console.error('AuthProvider - Profile fetch exception:', error)
        setProfile(null)
      } finally {
        profileFetchingRef.current = false
      }
    }

    // Load initial session
    const loadUser = async () => {
      try {
        console.log('AuthProvider - Loading user session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('AuthProvider - Session result:', { session: !!session, error, userId: session?.user?.id })
        
        if (error) {
          console.error('AuthProvider - Session error:', error)
          setUser(null)
          setProfile(null)
        } else {
          console.log('AuthProvider - Setting user:', session?.user?.id || 'null')
          setUser(session?.user ?? null)
          
          // Set loading to false immediately for better UX
          setLoading(false)
          clearTimeout(loadingTimeout)
          
          // Fetch profile if user is authenticated (in background)
          if (session?.user) {
            console.log('AuthProvider - Fetching profile for user:', session.user.id)
            // Don't await this - let it run in background
            loadUserProfile(session.user.id)
          } else {
            console.log('AuthProvider - No session user, setting profile to null')
            setProfile(null)
          }
        }
      } catch (err) {
        console.error('AuthProvider - Auth load error:', err)
        setUser(null)
        setProfile(null)
        setLoading(false)
        clearTimeout(loadingTimeout)
      }
    }

    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider - Auth state change:', event, { hasUser: !!session?.user, userId: session?.user?.id })
      
      // Don't override logout state or if we're in the middle of a logout
      const currentState = useAuthStore.getState()
      if (currentState.isLoggingOut) {
        console.log('AuthProvider - Currently logging out, ignoring auth state change')
        return
      }
      
      // Only process SIGNED_IN events, ignore others during potential logout
      if (event === 'SIGNED_OUT') {
        console.log('AuthProvider - User signed out, clearing state')
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        
        // Only fetch profile if we don't already have a profile for this user
        const currentProfile = currentState.profile
        if (!currentProfile || currentProfile.id !== session.user.id) {
          console.log('AuthProvider - Auth state change: Fetching profile for user:', session.user.id)
          await loadUserProfile(session.user.id)
        } else {
          console.log('AuthProvider - Auth state change: Profile already loaded for user:', session.user.id)
        }
      }
    })

    return () => {
      subscription?.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [setUser, setProfile, setLoading, isLoggingOut])

  // Avoid hydration mismatch by delaying render
  if (!hasMounted) {
    return null
  }

  return <>{children}</>
}
