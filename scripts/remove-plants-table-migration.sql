-- Migration to remove plants table and update system to work with cultivars
-- Run this in Supabase SQL Editor after backup is complete

-- Step 1: Update order_items table to reference cultivars instead of plants
-- First, add a new column for cultivar_id
ALTER TABLE order_items ADD COLUMN cultivar_id UUID;

-- First, let's see what order_items exist and their item_ids
SELECT 'order_items with item_id' as info, COUNT(*) as count FROM order_items WHERE item_id IS NOT NULL;
SELECT 'plants table' as info, COUNT(*) as count FROM plants;

-- Update existing order_items to use cultivar_id from plants table
UPDATE order_items 
SET cultivar_id = p.cultivar_id 
FROM plants p 
WHERE order_items.item_id = p.id;

-- Check how many order_items now have cultivar_id
SELECT 'order_items with cultivar_id' as info, COUNT(*) as count FROM order_items WHERE cultivar_id IS NOT NULL;

-- For any order_items that don't have a corresponding plant, we need to handle them
-- Let's see what item_ids don't have plants
SELECT 'order_items without plants' as info, COUNT(*) as count 
FROM order_items oi 
LEFT JOIN plants p ON oi.item_id = p.id 
WHERE p.id IS NULL AND oi.item_id IS NOT NULL;

-- If there are order_items without plants, we need to either:
-- 1. Delete them (if they're test data)
-- 2. Or assign them to a default cultivar
-- For now, let's delete them since we're removing the plants table anyway
DELETE FROM order_items 
WHERE item_id IS NOT NULL 
AND item_id NOT IN (SELECT id FROM plants);

-- Now make cultivar_id NOT NULL after cleaning up
ALTER TABLE order_items ALTER COLUMN cultivar_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE order_items ADD CONSTRAINT order_items_cultivar_id_fkey 
FOREIGN KEY (cultivar_id) REFERENCES cultivars(id);

-- Step 2: Update order_items to include age_years for pricing
ALTER TABLE order_items ADD COLUMN age_years INTEGER;

-- Set default age to 3 years for existing orders
UPDATE order_items SET age_years = 3 WHERE age_years IS NULL;

-- Make age_years NOT NULL
ALTER TABLE order_items ALTER COLUMN age_years SET NOT NULL;

-- Step 3: Update item_description to include age information
-- This will be handled in the application code, but we can update existing ones
UPDATE order_items 
SET item_description = CONCAT(
  COALESCE(item_description, ''), 
  CASE 
    WHEN age_years IS NOT NULL THEN ' - ' || age_years || ' years'
    ELSE ''
  END
)
WHERE item_description NOT LIKE '%years%';

-- Step 4: Drop the old item_id column (which was referencing plants)
ALTER TABLE order_items DROP COLUMN item_id;

-- Step 5: Drop the plants table
DROP TABLE IF EXISTS plants CASCADE;

-- Step 6: Update RLS policies for order_items
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can update their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can delete their own order items" ON order_items;

-- Create new policies for cultivar-based order_items
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items" ON order_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own order items" ON order_items
  FOR UPDATE USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own order items" ON order_items
  FOR DELETE USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Step 7: Create a function to get cultivar price based on age
CREATE OR REPLACE FUNCTION get_cultivar_price(
  cultivar_price_group TEXT,
  age_years INTEGER
) RETURNS DECIMAL AS $$
DECLARE
  price DECIMAL;
BEGIN
  -- Get price from pricing_matrix based on price_group and age
  SELECT price INTO price
  FROM pricing_matrix 
  WHERE price_group = cultivar_price_group 
    AND age_years = get_cultivar_price.age_years;
  
  RETURN COALESCE(price, 0);
END;
$$ LANGUAGE plpgsql;

-- Step 8: Update the calculate_plant_price function to work with cultivars
CREATE OR REPLACE FUNCTION calculate_plant_price(
  cultivar_price_group TEXT,
  age_years INTEGER
) RETURNS DECIMAL AS $$
BEGIN
  RETURN get_cultivar_price(cultivar_price_group, age_years);
END;
$$ LANGUAGE plpgsql;

-- Step 9: Verify the migration
SELECT 
  'order_items' as table_name, 
  COUNT(*) as count,
  COUNT(DISTINCT cultivar_id) as unique_cultivars
FROM order_items
UNION ALL
SELECT 
  'cultivars' as table_name, 
  COUNT(*) as count,
  NULL as unique_cultivars
FROM cultivars
UNION ALL
SELECT 
  'species' as table_name, 
  COUNT(*) as count,
  NULL as unique_cultivars
FROM species;

-- Step 10: Test the new pricing function
SELECT 
  c.cultivar_name,
  c.price_group,
  calculate_plant_price(c.price_group, 3) as price_3_years,
  calculate_plant_price(c.price_group, 5) as price_5_years,
  calculate_plant_price(c.price_group, 10) as price_10_years
FROM cultivars c 
WHERE c.price_group IS NOT NULL 
LIMIT 5;
