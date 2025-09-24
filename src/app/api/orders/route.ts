import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
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

    if (isAdmin) {
      // Admin can see all orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
      }

      return NextResponse.json({ orders })
    } else {
      // Regular user can only see their own orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user orders:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
      }

      return NextResponse.json({ orders })
    }
  } catch (error) {
    console.error('Error in orders API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      orderNumber,
      customerInfo,
      deliveryInfo,
      paymentInfo,
      subtotal,
      shipping,
      vatAmount,
      totalAmount,
      items
    } = body

    // Create the order using the existing schema
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        order_type: 'retail',
        subtotal: subtotal,
        tax_amount: vatAmount,
        discount_amount: 0,
        total_amount: totalAmount,
        currency: 'EUR',
        payment_method: paymentInfo.method === 'card' ? 'credit_card' : paymentInfo.method === 'bank' ? 'bank_transfer' : paymentInfo.method,
        payment_status: paymentInfo.method === 'credit_card' ? 'paid' : 'pending',
        shipping_address: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          postalCode: customerInfo.postalCode,
          country: customerInfo.country,
          company: customerInfo.company,
          taxId: customerInfo.taxId,
          deliveryMethod: deliveryInfo.deliveryMethod,
          deliveryNotes: deliveryInfo.deliveryNotes
        },
        billing_address: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          postalCode: customerInfo.postalCode,
          country: customerInfo.country,
          company: customerInfo.company,
          taxId: customerInfo.taxId
        },
        notes: deliveryInfo.deliveryNotes
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      item_type: item.type,
      item_id: item.id,
      item_name: item.name,
      item_description: item.description,
      item_image_url: item.image_url,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      plant_cultivar_id: item.plant?.cultivar?.id,
      plant_cultivar_name: item.plant?.cultivar?.cultivar_name,
      plant_age_years: item.plant?.age_years,
      plant_height_cm: item.plant?.height_cm
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Delete the order if items creation failed
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error in orders POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

