# Manual Migration Guide - Pricing Structure

Since the database functions aren't available yet, here's how to apply the migrations manually:

## Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to your project
   - Go to "SQL Editor"

2. **Run the pricing migration**
   - Copy the contents of `scripts/pricing-migration.sql`
   - Paste it into the SQL Editor
   - Click "Run"

3. **Update cultivar price groups**
   - Copy the contents of `scripts/update-cultivar-price-groups.sql`
   - Paste it into the SQL Editor
   - Click "Run"

## Option 2: Using Supabase CLI

If you have your database URL:

```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/postgres"

# Run the migrations
psql "$DATABASE_URL" -f scripts/pricing-migration.sql
psql "$DATABASE_URL" -f scripts/update-cultivar-price-groups.sql
```

## Option 3: Quick Fix (Temporary)

If you want to test the frontend immediately without running migrations, the plant cards will now show fallback price ranges:

- **Group A**: €15 - €100
- **Group B**: €25 - €170  
- **Group C**: €40 - €340

The cards will automatically fall back to these mock prices when the database functions aren't available.

## Verification

After running the migrations, you can verify they worked by running this query in Supabase:

```sql
-- Check price group distribution
SELECT 
  price_group,
  COUNT(*) as cultivar_count
FROM cultivars 
WHERE price_group IS NOT NULL
GROUP BY price_group
ORDER BY price_group;

-- Check pricing matrix
SELECT 
  price_group,
  COUNT(*) as price_combinations
FROM pricing_matrix
GROUP BY price_group
ORDER BY price_group;

-- Test price calculation
SELECT calculate_plant_price('A', 2, '10L') as price_a_2y_10l;
```

Expected results:
- Group A: ~100 cultivars
- Group B: ~66 cultivars  
- Group C: ~35 cultivars
- 60 total pricing combinations (20 per group)
- Test price should return a number (e.g., 28.00 for Group A, 2 years, 10L)

## Current Status

✅ **Frontend Updated**: Plant cards now show price ranges and price group badges  
✅ **Fallback Pricing**: Mock prices display when database functions aren't available  
⏳ **Database Migration**: Ready to run when you have database access  

The catalog should now work without errors and show proper price ranges!
