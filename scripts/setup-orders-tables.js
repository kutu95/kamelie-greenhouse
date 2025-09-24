const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://clbcxvgbbvnvcpyvqrot.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYmN4dmdiYnZudmNweXZxcm90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMjAyMiwiZXhwIjoyMDczNzc4MDIyfQ.S_vIt2YKpymHlN27lO69P0wCs-AXKi4WI9tFlOv4xME';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupOrdersTables() {
  try {
    console.log('Setting up orders tables...');

    // Read the SQL file
    const sql = fs.readFileSync('./scripts/create-orders-table.sql', 'utf8');
    
    // Split into individual statements and execute them one by one
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 80) + '...');
        
        try {
          // Use the SQL editor endpoint for DDL statements
          const { data, error } = await supabase
            .from('_sql')
            .select('*')
            .limit(0); // This won't return data, just execute the statement
          
          // For DDL statements, we need to use a different approach
          // Let's try using the REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql_query: statement })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.log('Statement failed, trying alternative approach...');
            
            // Try to create tables using direct table creation
            if (statement.includes('CREATE TABLE') && statement.includes('orders')) {
              console.log('Creating orders table...');
              // We'll handle this in the next step
              continue;
            }
          } else {
            console.log('✓ Statement executed successfully');
          }
        } catch (err) {
          console.log('Statement failed, will try alternative approach:', err.message);
        }
      }
    }

    // Try to create tables using direct Supabase client calls
    console.log('Attempting to create tables using direct approach...');
    
    // Check if orders table exists
    const { data: existingTables, error: tableCheckError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.code === 'PGRST116') {
      console.log('Orders table does not exist, creating...');
      
      // Since we can't execute DDL directly, let's create a simple orders table structure
      // and let the user know they need to create it manually
      console.log('\n⚠️  Unable to create tables automatically.');
      console.log('Please run the SQL script manually in your Supabase dashboard:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of scripts/create-orders-table.sql');
      console.log('4. Execute the script');
      
    } else {
      console.log('✓ Orders table already exists');
    }

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupOrdersTables();

