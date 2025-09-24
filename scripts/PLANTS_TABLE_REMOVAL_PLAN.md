# Plants Table Removal Migration Plan

## Restore Points Created

### 1. Git Tag
- **Tag**: `before-plants-table-removal`
- **Description**: Working system with plants table
- **Restore Command**: `git checkout before-plants-table-removal`

### 2. Database Backup
- **Method**: Run SQL script in Supabase SQL Editor
- **Script**: `backup-before-plants-removal.sql`
- **Tables Backed Up**: plants, cultivars, species, pricing_matrix, orders, order_items
- **Note**: Creates backup tables with `_backup` suffix

### 3. Database Restore
- **Method**: Run SQL script in Supabase SQL Editor
- **Script**: `restore-from-plants-removal.sql`
- **Use if**: Migration goes wrong and you need to restore database
- **Note**: Restores from backup tables with `_backup` suffix

## Migration Steps

### Phase 1: Database Changes
1. Remove plants table
2. Update order_items to reference cultivars instead of plants
3. Update pricing to work with cultivars + age
4. Update RLS policies

### Phase 2: Code Changes
1. Remove Plant interface and related types
2. Update all components to work with cultivars
3. Remove mock plant objects
4. Update cart to work with cultivar + age
5. Update favourites to work with cultivars
6. Update pricing calculations

### Phase 3: Testing
1. Test catalog functionality
2. Test cart functionality
3. Test favourites functionality
4. Test order creation
5. Test admin functionality

## Rollback Procedure

If migration fails:

### Option 1: Git Rollback
```bash
git checkout before-plants-table-removal
git push --force origin main
```

### Option 2: Database Restore
1. Run `restore-from-plants-removal.sql` in Supabase SQL Editor
2. Verify data is restored correctly
3. Check that all tables have correct row counts

## Current System Status
- ✅ Working system with plants table
- ✅ All functionality working
- ✅ Restore points created
- ✅ Ready for migration

## Next Steps
1. Run `backup-before-plants-removal.sql` in Supabase SQL Editor
2. Verify backup counts look correct
3. Start Phase 1 migration
4. Test thoroughly at each step
5. Keep restore points available
