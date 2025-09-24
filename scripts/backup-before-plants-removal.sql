-- Backup script for before plants table removal
-- Run this in Supabase SQL Editor to create a backup of current data

-- Create backup tables
CREATE TABLE IF NOT EXISTS plants_backup AS SELECT * FROM plants;
CREATE TABLE IF NOT EXISTS cultivars_backup AS SELECT * FROM cultivars;
CREATE TABLE IF NOT EXISTS species_backup AS SELECT * FROM species;
CREATE TABLE IF NOT EXISTS pricing_matrix_backup AS SELECT * FROM pricing_matrix;
CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;
CREATE TABLE IF NOT EXISTS order_items_backup AS SELECT * FROM order_items;

-- Add backup timestamp
ALTER TABLE plants_backup ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE cultivars_backup ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE species_backup ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE pricing_matrix_backup ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE orders_backup ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE order_items_backup ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW();

-- Verify backup counts
SELECT 
  'plants' as table_name, COUNT(*) as count FROM plants_backup
UNION ALL
SELECT 
  'cultivars' as table_name, COUNT(*) as count FROM cultivars_backup
UNION ALL
SELECT 
  'species' as table_name, COUNT(*) as count FROM species_backup
UNION ALL
SELECT 
  'pricing_matrix' as table_name, COUNT(*) as count FROM pricing_matrix_backup
UNION ALL
SELECT 
  'orders' as table_name, COUNT(*) as count FROM orders_backup
UNION ALL
SELECT 
  'order_items' as table_name, COUNT(*) as count FROM order_items_backup;
