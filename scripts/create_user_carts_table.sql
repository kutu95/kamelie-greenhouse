-- Create user_carts table to store cart items for logged-in users
-- This allows carts to sync across different domains (production, localhost, etc.)

CREATE TABLE IF NOT EXISTS user_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own cart
CREATE POLICY "Users can read their own cart"
    ON user_carts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own cart
CREATE POLICY "Users can insert their own cart"
    ON user_carts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own cart
CREATE POLICY "Users can update their own cart"
    ON user_carts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own cart
CREATE POLICY "Users can delete their own cart"
    ON user_carts
    FOR DELETE
    USING (auth.uid() = user_id);

COMMENT ON TABLE user_carts IS 'Stores shopping cart items for logged-in users. Cart items are stored as JSONB to support cultivars and products.';
COMMENT ON COLUMN user_carts.items IS 'JSON array of cart items. Each item contains: id, type (cultivar|product), name, price, quantity, age_years (optional), cultivar/product data, etc.';
