-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Customer information
    customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_address TEXT,
    customer_city VARCHAR(100),
    customer_postal_code VARCHAR(20),
    customer_country VARCHAR(100),
    customer_company VARCHAR(100),
    customer_tax_id VARCHAR(50),
    
    -- Delivery information
    delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('pickup', 'delivery')),
    delivery_notes TEXT,
    
    -- Order details
    subtotal DECIMAL(10,2) NOT NULL,
    shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
    vat_rate DECIMAL(5,4) NOT NULL DEFAULT 0.19,
    vat_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment information
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cod', 'bank_transfer', 'credit_card')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    
    -- Order status
    order_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'delivered', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional fields
    notes TEXT,
    admin_notes TEXT
);

-- Create order_items table to store individual items in each order
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Item details
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('plant', 'product')),
    item_id UUID NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    item_image_url TEXT,
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Additional item-specific data (for plants)
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

-- Create RLS policies
-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid()
            AND ur.name = 'admin'
        )
    );

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND o.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid()
            AND ur.name = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

