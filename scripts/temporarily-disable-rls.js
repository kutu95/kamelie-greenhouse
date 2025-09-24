const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function temporarilyDisableRLS() {
  try {
    console.log('Temporarily disabling RLS for testing...');
    
    // Try to disable RLS on orders table
    const { error: disableError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE orders DISABLE ROW LEVEL SECURITY;' 
    });
    
    if (disableError) {
      console.log('Cannot disable RLS via client:', disableError.message);
      console.log('Please manually disable RLS in Supabase dashboard:');
      console.log('1. Go to Authentication > Policies');
      console.log('2. Find the orders table');
      console.log('3. Disable RLS temporarily');
      console.log('4. Or run: ALTER TABLE orders DISABLE ROW LEVEL SECURITY;');
      return;
    }
    
    console.log('✓ RLS disabled, testing insert...');
    
    // Test insert without RLS
    const testInsert = await supabase
      .from('orders')
      .insert({
        order_number: 'TEST-123-NO-RLS',
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
      console.log('✓ Test insert successful! API structure works.');
      console.log('Order created:', testInsert.data);
      
      // Clean up test data
      await supabase.from('orders').delete().eq('order_number', 'TEST-123-NO-RLS');
      console.log('✓ Test data cleaned up');
      
      // Re-enable RLS
      await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE orders ENABLE ROW LEVEL SECURITY;' 
      });
      console.log('✓ RLS re-enabled');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

temporarilyDisableRLS();
