import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Get admin role ID
    const { data: adminRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'admin')
      .single()

    if (roleError || !adminRole) {
      return NextResponse.json({ 
        error: 'Admin role not found', 
        details: roleError?.message 
      }, { status: 500 })
    }

    // Create a test admin user profile
    const testAdminProfile = {
      id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for testing
      email: 'admin@kamelie.net',
      first_name: 'Admin',
      last_name: 'User',
      role_id: adminRole.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(testAdminProfile)
      .select()
      .single()

    if (profileError) {
      return NextResponse.json({ 
        error: 'Failed to create admin profile', 
        details: profileError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      profile,
      adminRoleId: adminRole.id
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}


