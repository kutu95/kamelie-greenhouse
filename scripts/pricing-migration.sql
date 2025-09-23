-- Pricing Structure Migration
-- Adds A/B/C price groups and pricing matrix to support complex pricing logic

-- Step 1: Add price_group column to cultivars table
ALTER TABLE cultivars 
ADD COLUMN IF NOT EXISTS price_group CHAR(1) CHECK (price_group IN ('A', 'B', 'C'));

-- Step 2: Create pricing matrix table
CREATE TABLE IF NOT EXISTS pricing_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    price_group CHAR(1) NOT NULL CHECK (price_group IN ('A', 'B', 'C')),
    age_years INTEGER NOT NULL CHECK (age_years >= 0),
    pot_size VARCHAR(50) NOT NULL,
    base_price_euros DECIMAL(10,2) NOT NULL CHECK (base_price_euros >= 0),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(price_group, age_years, pot_size)
);

-- Step 3: Add pricing_matrix_id to plants table (optional reference)
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS pricing_matrix_id UUID REFERENCES pricing_matrix(id);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cultivars_price_group ON cultivars(price_group);
CREATE INDEX IF NOT EXISTS idx_pricing_matrix_lookup ON pricing_matrix(price_group, age_years, pot_size);
CREATE INDEX IF NOT EXISTS idx_pricing_matrix_available ON pricing_matrix(is_available);

-- Step 5: Insert default pricing matrix data
-- Based on the PDF structure, these are reasonable starting prices
-- Group A: Common varieties (easier to cultivate)
-- Group B: Medium rarity/difficulty
-- Group C: Rare varieties (harder to cultivate)

INSERT INTO pricing_matrix (price_group, age_years, pot_size, base_price_euros) VALUES
-- Group A (Common varieties)
('A', 1, '5L', 15.00),
('A', 1, '10L', 20.00),
('A', 1, '15L', 25.00),
('A', 1, '20L', 30.00),
('A', 2, '5L', 20.00),
('A', 2, '10L', 28.00),
('A', 2, '15L', 35.00),
('A', 2, '20L', 45.00),
('A', 3, '5L', 25.00),
('A', 3, '10L', 35.00),
('A', 3, '15L', 45.00),
('A', 3, '20L', 60.00),
('A', 4, '5L', 30.00),
('A', 4, '10L', 45.00),
('A', 4, '15L', 60.00),
('A', 4, '20L', 80.00),
('A', 5, '5L', 35.00),
('A', 5, '10L', 55.00),
('A', 5, '15L', 75.00),
('A', 5, '20L', 100.00),

-- Group B (Medium rarity)
('B', 1, '5L', 25.00),
('B', 1, '10L', 35.00),
('B', 1, '15L', 45.00),
('B', 1, '20L', 55.00),
('B', 2, '5L', 35.00),
('B', 2, '10L', 50.00),
('B', 2, '15L', 65.00),
('B', 2, '20L', 85.00),
('B', 3, '5L', 45.00),
('B', 3, '10L', 65.00),
('B', 3, '15L', 85.00),
('B', 3, '20L', 115.00),
('B', 4, '5L', 55.00),
('B', 4, '10L', 80.00),
('B', 4, '15L', 105.00),
('B', 4, '20L', 140.00),
('B', 5, '5L', 65.00),
('B', 5, '10L', 95.00),
('B', 5, '15L', 125.00),
('B', 5, '20L', 170.00),

-- Group C (Rare varieties)
('C', 1, '5L', 40.00),
('C', 1, '10L', 60.00),
('C', 1, '15L', 80.00),
('C', 1, '20L', 100.00),
('C', 2, '5L', 60.00),
('C', 2, '10L', 90.00),
('C', 2, '15L', 120.00),
('C', 2, '20L', 160.00),
('C', 3, '5L', 80.00),
('C', 3, '10L', 120.00),
('C', 3, '15L', 160.00),
('C', 3, '20L', 220.00),
('C', 4, '5L', 100.00),
('C', 4, '10L', 150.00),
('C', 4, '15L', 200.00),
('C', 4, '20L', 280.00),
('C', 5, '5L', 120.00),
('C', 5, '10L', 180.00),
('C', 5, '15L', 240.00),
('C', 5, '20L', 340.00)

ON CONFLICT (price_group, age_years, pot_size) DO NOTHING;

-- Step 6: Create function to calculate plant price
CREATE OR REPLACE FUNCTION calculate_plant_price(
    cultivar_price_group CHAR(1),
    plant_age_years INTEGER,
    plant_pot_size VARCHAR(50)
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    calculated_price DECIMAL(10,2);
BEGIN
    -- Try to get exact match from pricing matrix
    SELECT base_price_euros INTO calculated_price
    FROM pricing_matrix
    WHERE price_group = cultivar_price_group
      AND age_years = plant_age_years
      AND pot_size = plant_pot_size
      AND is_available = true;
    
    -- If no exact match, use fallback calculation
    IF calculated_price IS NULL THEN
        CASE cultivar_price_group
            WHEN 'A' THEN calculated_price := 25.00;
            WHEN 'B' THEN calculated_price := 45.00;
            WHEN 'C' THEN calculated_price := 75.00;
            ELSE calculated_price := 25.00;
        END CASE;
        
        -- Apply age multiplier
        CASE 
            WHEN plant_age_years <= 2 THEN calculated_price := calculated_price * 1.0;
            WHEN plant_age_years <= 5 THEN calculated_price := calculated_price * 1.5;
            WHEN plant_age_years <= 10 THEN calculated_price := calculated_price * 2.0;
            ELSE calculated_price := calculated_price * 2.5;
        END CASE;
        
        -- Apply size multiplier
        CASE plant_pot_size
            WHEN '5L' THEN calculated_price := calculated_price * 1.0;
            WHEN '10L' THEN calculated_price := calculated_price * 1.3;
            WHEN '15L' THEN calculated_price := calculated_price * 1.6;
            WHEN '20L' THEN calculated_price := calculated_price * 2.0;
            ELSE calculated_price := calculated_price * 1.0;
        END CASE;
    END IF;
    
    RETURN calculated_price;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create function to get price range for a cultivar
CREATE OR REPLACE FUNCTION get_cultivar_price_range(
    cultivar_price_group CHAR(1)
) RETURNS TABLE(
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    available_sizes TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        MIN(pm.base_price_euros) as min_price,
        MAX(pm.base_price_euros) as max_price,
        ARRAY_AGG(DISTINCT pm.pot_size ORDER BY pm.pot_size) as available_sizes
    FROM pricing_matrix pm
    WHERE pm.price_group = cultivar_price_group
      AND pm.is_available = true;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Add comments for documentation
COMMENT ON TABLE pricing_matrix IS 'Pricing matrix for camellia plants based on price group (A/B/C), age, and pot size';
COMMENT ON COLUMN cultivars.price_group IS 'Price group: A=Common, B=Medium rarity, C=Rare varieties';
COMMENT ON FUNCTION calculate_plant_price IS 'Calculates plant price based on cultivar price group, age, and pot size';
COMMENT ON FUNCTION get_cultivar_price_range IS 'Returns price range and available sizes for a cultivar price group';
