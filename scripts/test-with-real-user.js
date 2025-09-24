const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testWithRealUser() {
  try {
    console.log('Testing with real user...');
    
    // First, let's see if we can get any users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(1);
    
    if (usersError) {
      console.log('Error getting users:', usersError);
      return;
    }
    
    if (users && users.length > 0) {
      const userId = users[0].id;
      console.log('Using user ID:', userId);
      
      // Test inserting with real user ID
      const testInsert = await supabase
        .from('orders')
        .insert({
          order_number: 'TEST-123-REAL',
          user_id: userId,
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
        console.log('✓ Test insert successful!');
        console.log('Order created:', testInsert.data);
        
        // Clean up test data
        await supabase.from('orders').delete().eq('order_number', 'TEST-123-REAL');
        console.log('✓ Test data cleaned up');
      }
    } else {
      console.log('No users found in user_profiles table');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testWithRealUser();
