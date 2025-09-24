const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testNewOrdersAPI() {
  try {
    console.log('Testing new orders API structure...');
    
    // Test inserting with the new structure (using JSONB fields)
    const testInsert = await supabase
      .from('orders')
      .insert({
        order_number: 'TEST-123-NEW',
        user_id: '00000000-0000-0000-0000-000000000000',
        status: 'pending',
        order_type: 'retail',
        subtotal: 10.00,
        tax_amount: 1.90,
        discount_amount: 0,
        total_amount: 11.90,
        currency: 'EUR',
        payment_method: 'cod',
        payment_status: 'pending',
        shipping_address: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '123456789',
          address: 'Test Address',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
          company: 'Test Company',
          taxId: 'DE123456789',
          deliveryMethod: 'pickup',
          deliveryNotes: 'Test delivery notes'
        },
        billing_address: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '123456789',
          address: 'Test Address',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
          company: 'Test Company',
          taxId: 'DE123456789'
        },
        notes: 'Test delivery notes'
      });
    
    if (testInsert.error) {
      console.log('Insert error:', testInsert.error);
    } else {
      console.log('✓ Test insert successful! New API structure works.');
      console.log('Order created:', testInsert.data);
      
      // Clean up test data
      await supabase.from('orders').delete().eq('order_number', 'TEST-123-NEW');
      console.log('✓ Test data cleaned up');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testNewOrdersAPI();
