-- Create Stripe settings table for admin configuration
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

-- Insert default Stripe settings
INSERT INTO stripe_settings (setting_key, setting_value, setting_type, description, is_encrypted) VALUES
('stripe_publishable_key', '', 'string', 'Stripe publishable key (starts with pk_)', false),
('stripe_secret_key', '', 'string', 'Stripe secret key (starts with sk_)', true),
('stripe_webhook_secret', '', 'string', 'Stripe webhook endpoint secret', true),
('stripe_webhook_url', '', 'string', 'Stripe webhook URL endpoint', false),
('stripe_test_mode', 'true', 'boolean', 'Enable test mode for Stripe payments', false),
('stripe_currency', 'EUR', 'string', 'Default currency for Stripe payments', false),
('stripe_payment_methods', 'card,sepa_debit', 'string', 'Enabled payment methods (comma-separated)', false),
('stripe_success_url', '/checkout/success', 'string', 'URL to redirect after successful payment', false),
('stripe_cancel_url', '/checkout/cancel', 'string', 'URL to redirect after cancelled payment', false),
('stripe_enabled', 'false', 'boolean', 'Enable Stripe payment processing', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stripe_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_stripe_settings_updated_at
  BEFORE UPDATE ON stripe_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_settings_updated_at();

-- Enable RLS
ALTER TABLE stripe_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Only admins can manage stripe settings" ON stripe_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid()
      AND ur.name = 'admin'
    )
  );
