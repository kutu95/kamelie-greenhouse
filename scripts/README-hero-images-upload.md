# Upload Hero Images to Supabase Storage

This guide will help you upload the hero images from `public/images/hero/` to Supabase storage for use in the blog post image selector.

## Prerequisites

1. **Supabase Storage Bucket**: The `images` bucket must be created in your Supabase project
2. **Environment Variables**: Make sure your `.env.local` file has the required Supabase credentials

## Step 1: Set Up Storage Bucket

Before uploading images, you need to create the storage bucket and set up the necessary policies.

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name: `images`
5. Make it **Public**
6. Click **Create bucket**

### Option B: Using SQL (Recommended)

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the images bucket
CREATE POLICY "Public read access for images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);
```

## Step 2: Upload Hero Images

Once the storage bucket is set up, run the upload script:

```bash
cd kamelie-app
node scripts/upload-hero-images.js
```

## What This Script Does

The script will:

1. **Scan** the `public/images/hero/` directory for image files
2. **Upload** each image to `blog-images/` folder in Supabase storage
3. **Generate** public URLs for each uploaded image
4. **Report** success/failure status for each file

## Expected Output

```
🚀 Starting upload of hero images to Supabase storage...
📁 Found 7 image files:
  - GreenhouseExterior.jpg
  - gaertnerei.jpg
  - quartier-grosspflanzen.jpg
  - schattiger-arbeitsplatz.jpg
  - schaugarten-sommer.jpg
  - schaugarten.jpg
  - schaugarten2.jpg
✅ Successfully uploaded GreenhouseExterior.jpg
✅ Successfully uploaded gaertnerei.jpg
✅ Successfully uploaded quartier-grosspflanzen.jpg
✅ Successfully uploaded schattiger-arbeitsplatz.jpg
✅ Successfully uploaded schaugarten-sommer.jpg
✅ Successfully uploaded schaugarten.jpg
✅ Successfully uploaded schaugarten2.jpg

📊 Upload Summary:
✅ Successful: 7
❌ Failed: 0

🔗 Public URLs:
  - GreenhouseExterior.jpg: https://your-project.supabase.co/storage/v1/object/public/images/blog-images/GreenhouseExterior.jpg
  - gaertnerei.jpg: https://your-project.supabase.co/storage/v1/object/public/images/blog-images/gaertnerei.jpg
  - quartier-grosspflanzen.jpg: https://your-project.supabase.co/storage/v1/object/public/images/blog-images/quartier-grosspflanzen.jpg
  - schattiger-arbeitsplatz.jpg: https://your-project.supabase.co/storage/v1/object/public/images/blog-images/schattiger-arbeitsplatz.jpg
  - schaugarten-sommer.jpg: https://your-project.supabase.co/storage/v1/object/public/images/blog-images/schaugarten-sommer.jpg
  - schaugarten.jpg: https://your-project.supabase.co/storage/v1/object/public/images/blog-images/schaugarten.jpg
  - schaugarten2.jpg: https://your-project.supabase.co/storage/v1/object/public/images/blog-images/schaugarten2.jpg

🎉 Upload process completed!
```

## After Upload

Once the images are uploaded, they will be available in the **Image Selector** modal when creating or editing blog posts in the admin dashboard. Users can:

- Browse all uploaded hero images
- Search for specific images by filename
- Select images for blog post featured images
- Upload additional images directly from the modal

## Troubleshooting

### "Bucket not found" Error
- Make sure you've run the storage setup SQL script first
- Verify the bucket name is exactly `images` (case-sensitive)

### "Missing Supabase environment variables" Error
- Check that your `.env.local` file exists and contains:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Permission Errors
- Ensure the service role key has the necessary permissions
- Check that the RLS policies are correctly set up

## Files Involved

- `scripts/upload-hero-images.js` - Upload script
- `scripts/setup-storage.sql` - Storage bucket setup SQL
- `public/images/hero/` - Source images directory
- `src/components/ui/image-selector.tsx` - Image selector component
- `src/components/ui/image-upload.tsx` - Image upload component
