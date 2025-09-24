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
    base_price_euros DECIMAL(10,2) NOT NULL CHECK (base_price_euros >= 0),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(price_group, age_years)
);

-- Step 3: Add pricing_matrix_id to plants table (optional reference)
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS pricing_matrix_id UUID REFERENCES pricing_matrix(id);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cultivars_price_group ON cultivars(price_group);
CREATE INDEX IF NOT EXISTS idx_pricing_matrix_lookup ON pricing_matrix(price_group, age_years);
CREATE INDEX IF NOT EXISTS idx_pricing_matrix_available ON pricing_matrix(is_available);

-- Step 5: Insert default pricing matrix data
-- Based on the PDF structure, these are reasonable starting prices
-- Group A: Common varieties (easier to cultivate)
-- Group B: Medium rarity/difficulty
-- Group C: Rare varieties (harder to cultivate)

INSERT INTO pricing_matrix (price_group, age_years, base_price_euros) VALUES
-- Real pricing data from Kamelienliste.pdf
-- 3 years
('A', 3, 21.00),
('B', 3, 28.00),
('C', 3, 37.00),

-- 4 years
('A', 4, 32.00),
('B', 4, 39.00),
('C', 4, 53.00),

-- 5 years
('A', 5, 47.00),
('B', 5, 59.00),
('C', 5, 69.00),

-- 6 years
('A', 6, 59.00),
('B', 6, 69.00),
('C', 6, 79.00);

-- Step 6: Drop existing function if it exists (to handle parameter change)
DROP FUNCTION IF EXISTS calculate_plant_price(CHAR(1), INTEGER, VARCHAR(50));
DROP FUNCTION IF EXISTS calculate_plant_price(CHAR(1), INTEGER);

-- Step 7: Create function to calculate plant price
CREATE OR REPLACE FUNCTION calculate_plant_price(
    cultivar_price_group CHAR(1),
    plant_age_years INTEGER
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    calculated_price DECIMAL(10,2);
BEGIN
    -- Try to get exact match from pricing matrix
    SELECT base_price_euros INTO calculated_price
    FROM pricing_matrix
    WHERE price_group = cultivar_price_group
      AND age_years = plant_age_years
      AND is_available = true;
    
    -- If no exact match, use fallback calculation based on PDF data
    IF calculated_price IS NULL THEN
        CASE cultivar_price_group
            WHEN 'A' THEN 
                CASE 
                    WHEN plant_age_years <= 3 THEN calculated_price := 21.00;
                    WHEN plant_age_years <= 4 THEN calculated_price := 32.00;
                    WHEN plant_age_years <= 5 THEN calculated_price := 47.00;
                    ELSE calculated_price := 59.00;
                END CASE;
            WHEN 'B' THEN 
                CASE 
                    WHEN plant_age_years <= 3 THEN calculated_price := 28.00;
                    WHEN plant_age_years <= 4 THEN calculated_price := 39.00;
                    WHEN plant_age_years <= 5 THEN calculated_price := 59.00;
                    ELSE calculated_price := 69.00;
                END CASE;
            WHEN 'C' THEN 
                CASE 
                    WHEN plant_age_years <= 3 THEN calculated_price := 37.00;
                    WHEN plant_age_years <= 4 THEN calculated_price := 53.00;
                    WHEN plant_age_years <= 5 THEN calculated_price := 69.00;
                    ELSE calculated_price := 79.00;
                END CASE;
            ELSE calculated_price := 21.00;
        END CASE;
    END IF;
    
    RETURN COALESCE(calculated_price, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Step 8: Drop existing function if it exists (to handle return type change)
DROP FUNCTION IF EXISTS get_cultivar_price_range(CHAR(1));

-- Step 9: Create function to get price range for a cultivar
CREATE OR REPLACE FUNCTION get_cultivar_price_range(
    cultivar_price_group CHAR(1)
) RETURNS TABLE(
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    available_ages INTEGER[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        MIN(pm.base_price_euros) as min_price,
        MAX(pm.base_price_euros) as max_price,
        ARRAY_AGG(DISTINCT pm.age_years ORDER BY pm.age_years) as available_ages
    FROM pricing_matrix pm
    WHERE pm.price_group = cultivar_price_group
      AND pm.is_available = true;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Add comments for documentation
COMMENT ON TABLE pricing_matrix IS 'Pricing matrix for camellia plants based on price group (A/B/C) and age (3-6 years)';
COMMENT ON COLUMN cultivars.price_group IS 'Price group: A=Common, B=Medium rarity, C=Rare varieties';
COMMENT ON FUNCTION calculate_plant_price IS 'Calculates plant price based on cultivar price group and age';
COMMENT ON FUNCTION get_cultivar_price_range IS 'Returns price range and available ages for a cultivar price group';
