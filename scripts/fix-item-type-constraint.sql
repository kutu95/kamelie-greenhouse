-- Fix the item_type check constraint to allow 'cultivar' in addition to 'plant' and 'product'

-- First, drop the existing constraint
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_item_type_check;

-- Create a new constraint that allows 'plant', 'product', and 'cultivar'
ALTER TABLE order_items ADD CONSTRAINT order_items_item_type_check 
CHECK (item_type IN ('plant', 'product', 'cultivar'));

-- Verify the constraint was created
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'order_items'::regclass 
AND conname = 'order_items_item_type_check';
