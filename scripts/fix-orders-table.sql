-- Fix orders table schema to match API expectations
-- Run this in Supabase SQL Editor

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_last_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_postal_code VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_country VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_company VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_tax_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,4) DEFAULT 0.19;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add constraints
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_delivery_method CHECK (delivery_method IN ('pickup', 'delivery'));
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_payment_method CHECK (payment_method IN ('cod', 'bank_transfer', 'credit_card'));
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_order_status CHECK (order_status IN ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'delivered', 'cancelled'));

-- Create order_items table if it doesn't exist
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
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid()
            AND ur.name = 'admin'
        )
    );

-- Create RLS policies for order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND o.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;
CREATE POLICY "Users can create their own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND o.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
CREATE POLICY "Admins can manage all order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid()
            AND ur.name = 'admin'
        )
    );
