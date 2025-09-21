# Image Upload Setup for Blog Posts

This guide explains how to set up image upload functionality for blog post featured images.

## Prerequisites

1. Supabase project with storage enabled
2. Admin access to your Supabase dashboard

## Setup Steps

### 1. Create Storage Bucket

Run the SQL script to create the storage bucket and set up permissions:

```sql
-- Run this in your Supabase SQL Editor
-- File: scripts/setup-storage.sql
```

This will:
- Create a public `images` bucket
- Set up RLS policies for authenticated users
- Allow read access for all users
- Allow upload/update/delete for authenticated users

### 2. Verify Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Verify the `images` bucket exists and is public
4. Test uploading a file manually to ensure it works

### 3. Test Image Upload

1. Go to the admin blog management page (`/admin/blog`)
2. Click "Create New Post"
3. Scroll down to the "Featured Image" section
4. Try uploading an image using the upload button
5. Verify the image preview appears
6. Save the blog post and check that the image displays correctly

## Features

### ImageUpload Component

The `ImageUpload` component provides:

- **Image Selector Modal**: Browse and select from existing uploaded images
- **Upload New Images**: Click to select files or drag and drop
- **Image Preview**: Shows a preview of the selected image
- **Manual URL Input**: Option to enter image URLs manually
- **File Validation**: Checks file type and size (max 5MB)
- **Error Handling**: Graceful error handling with user feedback
- **Loading States**: Shows upload progress
- **Remove Image**: Easy way to remove selected images

### ImageSelector Component

The `ImageSelector` modal provides:

- **Browse Existing Images**: View all previously uploaded images
- **Search Functionality**: Filter images by filename
- **Upload New Images**: Upload additional images directly from the modal
- **Image Grid**: Responsive grid layout with image previews
- **Selection Feedback**: Visual indication of selected image
- **Date Information**: Shows when each image was uploaded

### Supported Features

- **File Types**: JPG, PNG, GIF, WebP
- **Max File Size**: 5MB
- **Storage**: Supabase Storage with public URLs
- **Fallback**: API route fallback if direct upload fails
- **Responsive**: Works on desktop and mobile

## Troubleshooting

### Upload Fails

1. **Check Storage Bucket**: Ensure the `images` bucket exists and is public
2. **Check RLS Policies**: Verify the policies are correctly set up
3. **Check File Size**: Ensure file is under 5MB
4. **Check File Type**: Ensure it's a valid image format

### Images Not Displaying

1. **Check URL**: Verify the stored URL is correct
2. **Check CORS**: Ensure Supabase CORS settings allow your domain
3. **Check Bucket Public Access**: Ensure the bucket is public

### API Route Issues

If direct upload fails, the component will automatically try the API route (`/api/upload-image`). Check:

1. **Server Logs**: Look for errors in the API route
2. **Supabase Service Role**: Ensure the service role key is correct
3. **File Processing**: Check if the file is being processed correctly

## File Structure

```
kamelie-app/
├── src/
│   ├── components/ui/
│   │   └── image-upload.tsx          # Image upload component
│   ├── app/
│   │   ├── api/upload-image/
│   │   │   └── route.ts              # API route for uploads
│   │   └── [locale]/admin/blog/
│   │       └── page.tsx              # Blog management page
└── scripts/
    ├── setup-storage.sql             # Storage setup SQL
    └── README-image-upload.md        # This file
```

## Usage in Other Components

To use the ImageUpload component in other parts of your app:

```tsx
import { ImageUpload } from '@/components/ui/image-upload'

function MyComponent() {
  const [imageUrl, setImageUrl] = useState('')
  
  return (
    <ImageUpload
      value={imageUrl}
      onChange={setImageUrl}
      label="Profile Picture"
      className="my-custom-class"
    />
  )
}
```

To use the ImageSelector component directly:

```tsx
import { ImageSelector } from '@/components/ui/image-selector'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Choose Image
      </Button>
      
      <ImageSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={setSelectedImage}
        currentValue={selectedImage}
      />
    </>
  )
}
```

## Security Notes

- Images are stored in a public bucket
- File validation prevents malicious uploads
- RLS policies restrict upload access to authenticated users
- File size limits prevent abuse
- Unique filenames prevent conflicts
