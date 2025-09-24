-- Restore script for after plants table removal
-- Run this in Supabase SQL Editor to restore from backup

-- Drop current tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS pricing_matrix CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS cultivars CASCADE;
DROP TABLE IF EXISTS species CASCADE;

-- Restore from backup tables
CREATE TABLE plants AS SELECT * FROM plants_backup;
CREATE TABLE cultivars AS SELECT * FROM cultivars_backup;
CREATE TABLE species AS SELECT * FROM species_backup;
CREATE TABLE pricing_matrix AS SELECT * FROM pricing_matrix_backup;
CREATE TABLE orders AS SELECT * FROM orders_backup;
CREATE TABLE order_items AS SELECT * FROM order_items_backup;

-- Restore primary keys and constraints (you may need to adjust these based on your schema)
ALTER TABLE plants ADD PRIMARY KEY (id);
ALTER TABLE cultivars ADD PRIMARY KEY (id);
ALTER TABLE species ADD PRIMARY KEY (id);
ALTER TABLE pricing_matrix ADD PRIMARY KEY (id);
ALTER TABLE orders ADD PRIMARY KEY (id);
ALTER TABLE order_items ADD PRIMARY KEY (id);

-- Restore foreign key constraints (adjust as needed)
ALTER TABLE plants ADD CONSTRAINT plants_cultivar_id_fkey FOREIGN KEY (cultivar_id) REFERENCES cultivars(id);
ALTER TABLE cultivars ADD CONSTRAINT cultivars_species_id_fkey FOREIGN KEY (species_id) REFERENCES species(id);
ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);

-- Restore RLS policies (you may need to recreate these based on your current policies)
-- This is a template - you'll need to add your actual RLS policies here

-- Verify restore
SELECT 
  'plants' as table_name, COUNT(*) as count FROM plants
UNION ALL
SELECT 
  'cultivars' as table_name, COUNT(*) as count FROM cultivars
UNION ALL
SELECT 
  'species' as table_name, COUNT(*) as count FROM species
UNION ALL
SELECT 
  'pricing_matrix' as table_name, COUNT(*) as count FROM pricing_matrix
UNION ALL
SELECT 
  'orders' as table_name, COUNT(*) as count FROM orders
UNION ALL
SELECT 
  'order_items' as table_name, COUNT(*) as count FROM order_items;
