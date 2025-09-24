# Plants Table Removal Migration Plan

## Restore Points Created

### 1. Git Tag
- **Tag**: `before-plants-table-removal`
- **Description**: Working system with plants table
- **Restore Command**: `git checkout before-plants-table-removal`

### 2. Database Backup
- **Method**: Supabase Dashboard → Settings → Database → Backup
- **Backup Name**: `before-plants-table-removal`
- **Type**: Complete system backup (data + schema + policies + functions)

### 3. Database Restore
- **Method**: Supabase Dashboard → Settings → Database → Backup
- **Find Backup**: `before-plants-table-removal`
- **Action**: Click "Restore" button
- **Use if**: Migration goes wrong and you need to restore database

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
1. Go to Supabase Dashboard → Settings → Database → Backup
2. Find backup `before-plants-table-removal`
3. Click "Restore" button
4. Verify data is restored correctly

## Current System Status
- ✅ Working system with plants table
- ✅ All functionality working
- ✅ Restore points created
- ✅ Ready for migration

## Next Steps
1. Create Supabase backup: `before-plants-table-removal`
2. Start Phase 1 migration
3. Test thoroughly at each step
4. Keep restore points available
