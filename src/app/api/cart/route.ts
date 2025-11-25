import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Load cart from database
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    // Get cart from database (create table if needed with JSONB column)
    const { data: cart, error } = await supabase
      .from('user_carts')
      .select('items')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching cart:', error)
      console.error('Error details:', { code: error.code, message: error.message })
      
      // If table doesn't exist or no cart found, return empty cart
      if (
        error.code === 'PGRST116' || // no rows returned
        error.code === '42P01' || // relation does not exist
        error.message?.includes('relation') ||
        error.message?.includes('does not exist')
      ) {
        console.warn('Cart table does not exist yet or no cart found')
        return NextResponse.json({ items: [] }, { status: 200 })
      }
      
      // For any other error, return empty cart gracefully
      console.warn('Cart fetch failed - returning empty cart')
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    return NextResponse.json({ items: cart?.items || [] }, { status: 200 })
  } catch (error: any) {
    console.error('Error in cart GET API:', error)
    console.error('Exception details:', { message: error?.message, stack: error?.stack })
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}

// POST - Save cart to database
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body

    // Upsert cart in database
    const { error } = await supabase
      .from('user_carts')
      .upsert({
        user_id: user.id,
        items: items || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error saving cart:', error)
      console.error('Error details:', { code: error.code, message: error.message, details: error.details, hint: error.hint })
      
      // If table doesn't exist or other common errors, return success gracefully
      // This allows the app to work even if the table hasn't been created yet
      if (
        error.code === '42P01' || // relation does not exist
        error.code === 'PGRST116' || // no rows returned (shouldn't happen with upsert but handle it)
        error.message?.includes('relation') ||
        error.message?.includes('does not exist')
      ) {
        console.warn('Cart table does not exist yet - returning success (migration needed)')
        return NextResponse.json({ success: true, message: 'Cart table not yet created - migration required' }, { status: 200 })
      }
      
      // For other errors, still return 200 to prevent breaking the UI
      // The cart will still work with localStorage
      console.warn('Cart sync failed but continuing - cart works with localStorage only')
      return NextResponse.json({ success: false, message: 'Cart sync failed - using local storage' }, { status: 200 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error in cart POST API:', error)
    console.error('Exception details:', { message: error?.message, stack: error?.stack })
    // Return 200 instead of 500 so the app continues working with localStorage
    return NextResponse.json({ success: false, message: 'Cart sync failed - using local storage' }, { status: 200 })
  }
}
