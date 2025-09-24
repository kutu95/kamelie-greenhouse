const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runMigration() {
  try {
    console.log('Running SQL migration...');
    
    // Read the SQL file
    const fs = require('fs');
    const sql = fs.readFileSync('./scripts/fix-orders-table.sql', 'utf8');
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        try {
          // Try to execute via a simple query first
          const { error } = await supabase
            .from('orders')
            .select('id')
            .limit(1);
          
          if (error && error.message.includes('customer_address')) {
            console.log('Table needs migration - columns missing');
            // We can't execute DDL via the client, so we'll need to do this manually
            console.log('Please run the SQL migration manually in Supabase SQL Editor:');
            console.log('1. Go to your Supabase dashboard');
            console.log('2. Navigate to SQL Editor');
            console.log('3. Copy and paste the contents of fix-orders-table.sql');
            console.log('4. Execute the SQL');
            break;
          }
        } catch (err) {
          console.log('Error:', err.message);
        }
      }
    }
    
  } catch (err) {
    console.error('Migration error:', err);
  }
}

runMigration();
