-- Remove pot_size columns from plant-related tables
-- This script removes pot_size references that are no longer needed
-- since pricing is now based only on age and price group (A/B/C)

-- Step 1: Remove pot_size column from plants table
ALTER TABLE plants DROP COLUMN IF EXISTS pot_size;

-- Step 2: Remove plant_pot_size column from order_items table
ALTER TABLE order_items DROP COLUMN IF EXISTS plant_pot_size;

-- Step 3: Remove pot_size column from pricing_matrix table (if it exists)
-- Note: This should already be done by the pricing-migration.sql script
ALTER TABLE pricing_matrix DROP COLUMN IF EXISTS pot_size;

-- Step 4: Update any indexes that might reference pot_size
-- (These will be automatically dropped when the columns are dropped)

-- Step 5: Add comments for documentation
COMMENT ON TABLE plants IS 'Individual plants inventory - pricing based on age and cultivar price group only';
COMMENT ON TABLE order_items IS 'Order items - plant details stored without pot size';

-- Step 6: Verify the changes
-- This query will show the current structure of the main tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('plants', 'order_items', 'pricing_matrix')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
