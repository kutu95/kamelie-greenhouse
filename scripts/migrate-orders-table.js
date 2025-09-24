const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function migrateOrdersTable() {
  try {
    console.log('Migrating orders table to new schema...');
    
    // Add missing columns to orders table
    const migrations = [
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(100)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_last_name VARCHAR(100)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_city VARCHAR(100)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_postal_code VARCHAR(20)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_country VARCHAR(100)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_company VARCHAR(100)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_tax_id VARCHAR(50)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping DECIMAL(10,2) DEFAULT 0",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,4) DEFAULT 0.19",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(20) DEFAULT 'pending'",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT"
    ];
    
    for (const migration of migrations) {
      console.log(`Executing: ${migration}`);
      const { error } = await supabase.rpc('exec_sql', { sql: migration });
      if (error) {
        console.log(`Migration failed: ${error.message}`);
        // Try alternative approach using direct SQL
        const { error: directError } = await supabase
          .from('orders')
          .select('id')
          .limit(1);
        if (directError && directError.message.includes('customer_address')) {
          console.log('Table still needs customer_address column');
        }
      } else {
        console.log('✓ Migration successful');
      }
    }
    
    // Add constraints
    const constraints = [
      "ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_delivery_method CHECK (delivery_method IN ('pickup', 'delivery'))",
      "ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_payment_method CHECK (payment_method IN ('cod', 'bank_transfer', 'credit_card'))",
      "ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))",
      "ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_order_status CHECK (order_status IN ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'delivered', 'cancelled'))"
    ];
    
    for (const constraint of constraints) {
      console.log(`Adding constraint: ${constraint}`);
      const { error } = await supabase.rpc('exec_sql', { sql: constraint });
      if (error) {
        console.log(`Constraint failed: ${error.message}`);
      } else {
        console.log('✓ Constraint added');
      }
    }
    
    // Create order_items table if it doesn't exist
    const createOrderItems = `
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('plant', 'product')),
        item_id UUID NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_description TEXT,
        item_image_url TEXT,
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        total_price DECIMAL(10,2) NOT NULL,
        plant_cultivar_id UUID,
        plant_cultivar_name VARCHAR(255),
        plant_age_years INTEGER,
        plant_height_cm INTEGER,
        plant_pot_size VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    console.log('Creating order_items table...');
    const { error: orderItemsError } = await supabase.rpc('exec_sql', { sql: createOrderItems });
    if (orderItemsError) {
      console.log('Order items table creation failed:', orderItemsError.message);
    } else {
      console.log('✓ Order items table created');
    }
    
    console.log('Migration completed!');
    
  } catch (err) {
    console.error('Migration error:', err);
  }
}

migrateOrdersTable();
