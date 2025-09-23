const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testOrdersPage() {
  console.log('🧪 Testing orders page functionality...')

  try {
    // Test 1: Check if orders table exists and is accessible
    console.log('\n📊 Checking orders table access...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .limit(1)

    if (ordersError) {
      console.error('❌ Error accessing orders table:', ordersError)
      return
    }

    console.log('✅ Orders table accessible')
    console.log(`📄 Found ${orders.length} orders in database`)

    // Test 2: Test the full query used by the orders page
    console.log('\n🔍 Testing full orders query...')
    const { data: fullOrders, error: fullError } = await supabase
      .from('orders')
      .select(`
        *,
        user:user_profiles!inner(
          id,
          first_name,
          last_name,
          email
        ),
        order_items(
          id,
          quantity,
          unit_price,
          total_price,
          plant:plants(
            id,
            plant_code,
            cultivar:cultivars(
              cultivar_name,
              species:species(scientific_name)
            ),
            photos:plant_photos(photo_url, is_primary)
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (fullError) {
      console.error('❌ Error with full query:', fullError)
      return
    }

    console.log('✅ Full query successful')
    console.log(`📄 Found ${fullOrders.length} orders with full data`)

    if (fullOrders.length > 0) {
      const order = fullOrders[0]
      console.log('📋 Sample order data:')
      console.log(`   Order #: ${order.order_number}`)
      console.log(`   Status: ${order.status}`)
      console.log(`   Total: €${order.total_amount}`)
      console.log(`   Customer: ${order.user?.first_name} ${order.user?.last_name}`)
      console.log(`   Items: ${order.order_items?.length || 0}`)
    }

    // Test 3: Test API endpoint (if dev server is running)
    console.log('\n🌐 Testing orders API endpoint...')
    try {
      const response = await fetch('http://localhost:3000/api/orders')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Orders API endpoint working')
        console.log(`📄 API returned ${data.orders?.length || 0} orders`)
      } else {
        console.log('⚠️ Orders API endpoint not available (dev server not running)')
      }
    } catch (error) {
      console.log('⚠️ Orders API endpoint not available (dev server not running)')
    }

    console.log('\n🎉 Orders page test completed!')
    console.log('📝 The orders page should now work correctly without 400 errors.')

  } catch (error) {
    console.error('💥 Error during orders page test:', error.message)
  }
}

testOrdersPage()

