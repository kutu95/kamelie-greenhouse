import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' })
    }

    const supabase = await createClient()
    
    // Get the admin role ID
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'admin')
      .single()

    if (!adminRole) {
      return NextResponse.json({ error: 'Admin role not found' })
    }

    // Find user by email
    const { data: user } = await supabase.auth.admin.getUserByEmail(email)
    
    if (!user.user) {
      return NextResponse.json({ error: 'User not found' })
    }

    // Update user profile with admin role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({ role_id: adminRole.id })
      .eq('id', user.user.id)
      .select()
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
