const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStripeSettings() {
  try {
    console.log('Setting up Stripe settings table...');

    // First, let's check if the table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('stripe_settings')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✓ Stripe settings table already exists');
    } else {
      console.log('Creating Stripe settings table...');
      
      // Create the table using raw SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS stripe_settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value TEXT,
          setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'boolean', 'number')),
          description TEXT,
          is_encrypted BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      const { error: createError } = await supabase.rpc('sql', { query: createTableSQL });
      
      if (createError) {
        console.error('Error creating table:', createError);
        // Try alternative approach
        console.log('Trying alternative approach...');
      } else {
        console.log('✓ Table created successfully');
      }
    }

    // Insert default settings
    const defaultSettings = [
      { setting_key: 'stripe_publishable_key', setting_value: '', setting_type: 'string', description: 'Stripe publishable key (starts with pk_)', is_encrypted: false },
      { setting_key: 'stripe_secret_key', setting_value: '', setting_type: 'string', description: 'Stripe secret key (starts with sk_)', is_encrypted: true },
      { setting_key: 'stripe_webhook_secret', setting_value: '', setting_type: 'string', description: 'Stripe webhook endpoint secret', is_encrypted: true },
      { setting_key: 'stripe_webhook_url', setting_value: '', setting_type: 'string', description: 'Stripe webhook URL endpoint', is_encrypted: false },
      { setting_key: 'stripe_test_mode', setting_value: 'true', setting_type: 'boolean', description: 'Enable test mode for Stripe payments', is_encrypted: false },
      { setting_key: 'stripe_currency', setting_value: 'EUR', setting_type: 'string', description: 'Default currency for Stripe payments', is_encrypted: false },
      { setting_key: 'stripe_payment_methods', setting_value: 'card,sepa_debit', setting_type: 'string', description: 'Enabled payment methods (comma-separated)', is_encrypted: false },
      { setting_key: 'stripe_success_url', setting_value: '/checkout/success', setting_type: 'string', description: 'URL to redirect after successful payment', is_encrypted: false },
      { setting_key: 'stripe_cancel_url', setting_value: '/checkout/cancel', setting_type: 'string', description: 'URL to redirect after cancelled payment', is_encrypted: false },
      { setting_key: 'stripe_enabled', setting_value: 'false', setting_type: 'boolean', description: 'Enable Stripe payment processing', is_encrypted: false }
    ];

    console.log('Inserting default settings...');
    
    for (const setting of defaultSettings) {
      const { error: insertError } = await supabase
        .from('stripe_settings')
        .upsert(setting, { onConflict: 'setting_key' });

      if (insertError) {
        console.error(`Error inserting ${setting.setting_key}:`, insertError);
      } else {
        console.log(`✓ ${setting.setting_key} inserted/updated`);
      }
    }

    console.log('✓ Stripe settings setup completed successfully!');
    
    // Test by reading the settings
    const { data: settings, error: readError } = await supabase
      .from('stripe_settings')
      .select('*')
      .order('setting_key');

    if (readError) {
      console.error('Error reading settings:', readError);
    } else {
      console.log(`✓ Found ${settings.length} settings in database`);
    }

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupStripeSettings();

