import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the order
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if user can access this order (own order or admin)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        id,
        role_id,
        user_roles!inner(name)
      `)
      .eq('id', user.id)
      .single()

    const isAdmin = (profile as any)?.user_roles?.name === 'admin'
    const isOwner = order.user_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error in order GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        id,
        role_id,
        user_roles!inner(name)
      `)
      .eq('id', user.id)
      .single()

    const isAdmin = (profile as any)?.user_roles?.name === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { order_status, payment_status, admin_notes, customer_info, delivery_info } = body

    // Prepare update data
    const updateData: any = {
      order_status,
      payment_status,
      admin_notes,
      updated_at: new Date().toISOString()
    }

    // Only update customer info if payment hasn't been made
    if (payment_status !== 'paid' && customer_info) {
      updateData.shipping_address = {
        ...customer_info,
        deliveryMethod: delivery_info?.deliveryMethod || 'pickup',
        deliveryNotes: delivery_info?.deliveryNotes || ''
      }
      updateData.billing_address = {
        ...customer_info
      }
    }

    // Update the order
    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error in order PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

