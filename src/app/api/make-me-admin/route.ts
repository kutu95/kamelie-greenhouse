import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No user logged in' })
    }

    // Get the admin role ID
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'admin')
      .single()

    if (!adminRole) {
      return NextResponse.json({ error: 'Admin role not found' })
    }

    // Update user profile with admin role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({ role_id: adminRole.id })
      .eq('id', user.id)
      .select(`
        *,
        user_roles:role_id(*)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin role assigned successfully',
      profile 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign admin role' })
  }
}
