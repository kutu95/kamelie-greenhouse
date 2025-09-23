#!/usr/bin/env node

/**
 * Migration script to update cultivar price groups based on kamelienliste_data.json
 * This script reads the PDF data and updates the cultivars table with price groups
 */

const fs = require('fs');
const path = require('path');

// Read the kamelienliste data
const kamelienDataPath = path.join(__dirname, '../../kamelienliste_data.json');
const kamelienData = JSON.parse(fs.readFileSync(kamelienDataPath, 'utf8'));

console.log(`Found ${kamelienData.length} cultivars in kamelienliste data`);

// Create SQL update statements
const updateStatements = [];

// Group by cultivar name and price group
const cultivarMap = new Map();

kamelienData.forEach(item => {
  const cultivarName = item.cultivar_name;
  const priceGroup = item.price_group;
  
  if (cultivarName && priceGroup) {
    // Use the first occurrence or prefer 'A' over 'B' over 'C' if there are duplicates
    if (!cultivarMap.has(cultivarName) || 
        (priceGroup === 'A' && cultivarMap.get(cultivarName) !== 'A') ||
        (priceGroup === 'B' && cultivarMap.get(cultivarName) === 'C')) {
      cultivarMap.set(cultivarName, priceGroup);
    }
  }
});

console.log(`Found ${cultivarMap.size} unique cultivars with price groups`);

// Generate SQL statements
cultivarMap.forEach((priceGroup, cultivarName) => {
  // Escape single quotes in cultivar names
  const escapedName = cultivarName.replace(/'/g, "''");
  
  const updateSQL = `UPDATE cultivars 
SET price_group = '${priceGroup}', updated_at = NOW() 
WHERE cultivar_name = '${escapedName}';`;
  
  updateStatements.push(updateSQL);
});

// Write the migration file
const migrationPath = path.join(__dirname, 'update-cultivar-price-groups.sql');
const migrationContent = `-- Update cultivar price groups based on kamelienliste_data.json
-- Generated on ${new Date().toISOString()}

-- Update existing cultivars with price groups from PDF data
${updateStatements.join('\n')}

-- Verify the updates
SELECT 
  price_group,
  COUNT(*) as cultivar_count
FROM cultivars 
WHERE price_group IS NOT NULL
GROUP BY price_group
ORDER BY price_group;

-- Show some examples
SELECT 
  cultivar_name,
  price_group,
  flower_color,
  flower_form
FROM cultivars 
WHERE price_group IS NOT NULL
ORDER BY price_group, cultivar_name
LIMIT 10;
`;

fs.writeFileSync(migrationPath, migrationContent);

console.log(`Generated migration file: ${migrationPath}`);
console.log(`Total update statements: ${updateStatements.length}`);

// Show summary statistics
const priceGroupStats = {};
cultivarMap.forEach((priceGroup) => {
  priceGroupStats[priceGroup] = (priceGroupStats[priceGroup] || 0) + 1;
});

console.log('\nPrice group distribution:');
Object.entries(priceGroupStats).forEach(([group, count]) => {
  console.log(`  Group ${group}: ${count} cultivars`);
});

console.log('\nSample updates:');
Array.from(cultivarMap.entries()).slice(0, 5).forEach(([name, group]) => {
  console.log(`  ${name} -> Group ${group}`);
});
