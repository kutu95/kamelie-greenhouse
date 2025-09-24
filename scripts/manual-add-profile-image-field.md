# Manual Database Update: Add Profile Image Field

Since the automated SQL execution didn't work, please manually add the `profile_image_url` field to the `user_profiles` table in your Supabase dashboard:

## Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the "Table Editor" section

2. **Find the user_profiles table**
   - Look for the `user_profiles` table in the list

3. **Add the new column**
   - Click on the table to open it
   - Click the "+" button to add a new column
   - Set the following properties:
     - **Column name**: `profile_image_url`
     - **Type**: `text`
     - **Default value**: `null`
     - **Allow nullable**: ✅ Yes
     - **Is unique**: ❌ No

4. **Save the changes**
   - Click "Save" to apply the changes

## Alternative: SQL Editor Method

If you prefer using the SQL Editor:

1. Go to the "SQL Editor" in your Supabase dashboard
2. Run this SQL command:

```sql
ALTER TABLE user_profiles 
ADD COLUMN profile_image_url TEXT;
```

3. Click "Run" to execute the command

## Verification

After adding the field, you can verify it was added correctly by running this query in the SQL Editor:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'profile_image_url';
```

This should return one row showing the new column details.

## Next Steps

Once the field is added:
1. The profile image upload functionality will work
2. Users can upload and manage their profile images
3. The profile page will display the user's profile image


