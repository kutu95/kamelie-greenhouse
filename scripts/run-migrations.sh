#!/bin/bash

# Run Pricing Structure Migrations
# This script applies the database changes for the new A/B/C pricing system

echo "🚀 Starting Kamelie Pricing Migration..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the kamelie-app directory"
    exit 1
fi

echo "📋 Step 1: Applying pricing schema migration..."
echo "   - Adding price_group column to cultivars"
echo "   - Creating pricing_matrix table"
echo "   - Adding pricing calculation functions"
echo ""

# Run the main pricing migration
if supabase db push --db-url "$DATABASE_URL" --include-all; then
    echo "✅ Pricing schema migration completed successfully!"
else
    echo "❌ Error: Failed to apply pricing schema migration"
    echo "   Please check your DATABASE_URL and try again"
    exit 1
fi

echo ""
echo "📋 Step 2: Running SQL migrations..."
echo ""

# Apply the pricing migration SQL
echo "Applying pricing-migration.sql..."
if psql "$DATABASE_URL" -f scripts/pricing-migration.sql; then
    echo "✅ Pricing migration SQL applied successfully!"
else
    echo "❌ Error: Failed to apply pricing migration SQL"
    exit 1
fi

echo ""
echo "Applying cultivar price group updates..."
if psql "$DATABASE_URL" -f scripts/update-cultivar-price-groups.sql; then
    echo "✅ Cultivar price groups updated successfully!"
else
    echo "❌ Error: Failed to update cultivar price groups"
    exit 1
fi

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "📊 Summary:"
echo "   ✅ Added price_group column to cultivars table"
echo "   ✅ Created pricing_matrix table with 60 price combinations"
echo "   ✅ Added pricing calculation functions"
echo "   ✅ Updated 201 cultivars with price groups (A/B/C)"
echo ""
echo "🔍 Next steps:"
echo "   1. Refresh your catalog page to see the new price ranges"
echo "   2. Test the pricing functionality"
echo "   3. Update your Supabase types if needed"
echo ""
echo "📈 Price groups:"
echo "   Group A (Common): €15 - €100"
echo "   Group B (Medium): €25 - €170" 
echo "   Group C (Rare): €40 - €340"
echo ""
