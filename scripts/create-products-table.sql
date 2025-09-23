-- Products table for miscellaneous items like soil, pots, seeds, etc.
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_de VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_de TEXT,
    description_en TEXT,
    category VARCHAR(100) NOT NULL, -- 'soil', 'pots', 'seeds', 'fertilizer', 'tools', 'accessories'
    sku VARCHAR(100) UNIQUE NOT NULL,
    price_euros DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    weight_kg DECIMAL(8,2),
    dimensions_cm VARCHAR(100), -- e.g., "20x20x30" for pots
    image_url VARCHAR(500),
    image_alt_text_de VARCHAR(255),
    image_alt_text_en VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    seo_title_de VARCHAR(255),
    seo_title_en VARCHAR(255),
    seo_description_de TEXT,
    seo_description_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_sku ON products(sku);

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (is_active = true);

-- Allow admin users to manage all products
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN user_roles ur ON up.role_id = ur.id
            WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
    );

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();
