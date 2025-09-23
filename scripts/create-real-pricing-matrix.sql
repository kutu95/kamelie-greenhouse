-- Real Pricing Matrix based on actual PDF data
-- Extracted from Kamelienliste.pdf pricing table

-- Clear existing pricing matrix
DELETE FROM pricing_matrix;

-- Insert real pricing data from PDF
-- Age categories: 3, 4, 5, 6 years
-- Size: 20-30cm (standard size)
-- Price groups: A, B, C with exact prices from PDF

INSERT INTO pricing_matrix (price_group, age_years, pot_size, base_price_euros) VALUES
-- 3 years, 20-30cm
('A', 3, '20-30cm', 21.00),
('B', 3, '20-30cm', 28.00),
('C', 3, '20-30cm', 37.00),

-- 4 years, 20-30cm
('A', 4, '20-30cm', 32.00),
('B', 4, '20-30cm', 39.00),
('C', 4, '20-30cm', 53.00),

-- 5 years, 20-30cm
('A', 5, '20-30cm', 47.00),
('B', 5, '20-30cm', 59.00),
('C', 5, '20-30cm', 69.00),

-- 6 years, 20-30cm
('A', 6, '20-30cm', 59.00),
('B', 6, '20-30cm', 69.00),
('C', 6, '20-30cm', 79.00);

-- Update all entries to be available
UPDATE pricing_matrix SET is_available = true;
