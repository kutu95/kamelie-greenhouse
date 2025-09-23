# Pricing Structure Migration Guide

This guide walks you through implementing the new A/B/C pricing structure for the Kamelie catalog.

## Overview

The new pricing system replaces the simple single-price model with a sophisticated matrix-based approach that considers:
- **Price Groups**: A (Common), B (Medium rarity), C (Rare varieties)
- **Age**: 1-5+ years with different multipliers
- **Size**: 5L, 10L, 15L, 20L pot sizes
- **Dynamic Pricing**: Real-time calculation based on cultivar characteristics

## Migration Steps

### 1. Run Database Migration

Execute the pricing structure migration:

```bash
# Apply the main pricing schema changes
psql -h your-supabase-host -U postgres -d postgres -f scripts/pricing-migration.sql
```

This will:
- Add `price_group` column to `cultivars` table
- Create `pricing_matrix` table with 60 price combinations
- Add pricing calculation functions
- Create necessary indexes

### 2. Update Cultivar Price Groups

Run the cultivar price group migration:

```bash
# Update existing cultivars with price groups from PDF data
psql -h your-supabase-host -U postgres -d postgres -f scripts/update-cultivar-price-groups.sql
```

This will update 201 cultivars with their correct price groups (A/B/C) based on the kamelienliste.pdf data.

### 3. Verify Migration

Check that the migration was successful:

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
SELECT calculate_plant_price('B', 3, '15L') as price_b_3y_15l;
SELECT calculate_plant_price('C', 5, '20L') as price_c_5y_20l;
```

Expected results:
- Group A: ~100 cultivars
- Group B: ~66 cultivars  
- Group C: ~35 cultivars
- 60 total pricing combinations (20 per group)

## Price Matrix Overview

### Group A (Common Varieties)
- Base price range: €15-€100
- 1-2 years: €15-€45
- 3-5 years: €25-€100

### Group B (Medium Rarity)
- Base price range: €25-€170
- 1-2 years: €25-€85
- 3-5 years: €45-€170

### Group C (Rare Varieties)
- Base price range: €40-€340
- 1-2 years: €40-€160
- 3-5 years: €80-€340

## Frontend Changes

The catalog now displays:
- **Price ranges** instead of single prices (e.g., "€25 - €100")
- **Price group badges** (Common/Medium/Rare varieties)
- **Dynamic loading** of pricing information
- **Fallback pricing** when database functions are unavailable

## Admin Interface

The new structure supports:
- Easy price adjustments via the `pricing_matrix` table
- Bulk price updates by group
- Seasonal pricing (via `is_available` flag)
- Price history tracking

## Rollback Plan

If you need to rollback:

```sql
-- Remove pricing matrix
DROP TABLE IF EXISTS pricing_matrix;

-- Remove price group column
ALTER TABLE cultivars DROP COLUMN IF EXISTS price_group;

-- Remove functions
DROP FUNCTION IF EXISTS calculate_plant_price(CHAR(1), INTEGER, VARCHAR(50));
DROP FUNCTION IF EXISTS get_cultivar_price_range(CHAR(1));
```

## Next Steps

1. **Test the catalog** to ensure price ranges display correctly
2. **Update admin interface** to manage pricing matrix
3. **Consider seasonal pricing** for different times of year
4. **Add bulk import** for new cultivars with price groups
5. **Implement price alerts** for low stock or price changes

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Verify database functions are working with test queries
3. Ensure all TypeScript types are updated
4. Check that the pricing API endpoints are accessible

The new system provides much more flexibility and accuracy in pricing while maintaining backward compatibility with existing plant records.
