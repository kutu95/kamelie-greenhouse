const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkOrdersTable() {
  try {
    console.log('Checking orders table structure...');
    
    // Try to select from orders table to see what columns exist
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error accessing orders table:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Orders table columns:', Object.keys(data[0]));
    } else {
      console.log('Orders table is empty, but exists');
      
      // Try to insert a test record to see what columns are expected
      const testInsert = await supabase
        .from('orders')
        .insert({
          order_number: 'TEST-123',
          user_id: '00000000-0000-0000-0000-000000000000',
          customer_first_name: 'Test',
          customer_last_name: 'User',
          customer_email: 'test@example.com',
          customer_address: 'Test Address',
          customer_city: 'Test City',
          customer_postal_code: '12345',
          customer_country: 'Test Country',
          delivery_method: 'pickup',
          subtotal: 10.00,
          shipping: 0.00,
          vat_amount: 1.90,
          total_amount: 11.90,
          payment_method: 'cod',
          payment_status: 'pending',
          order_status: 'pending'
        });
      
      if (testInsert.error) {
        console.log('Insert error (this shows us what columns are missing):', testInsert.error);
      } else {
        console.log('Test insert successful, cleaning up...');
        await supabase.from('orders').delete().eq('order_number', 'TEST-123');
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkOrdersTable();
