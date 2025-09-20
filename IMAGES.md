# Adding Images from Legacy Website

This guide will help you integrate real images from the Kamelie legacy website into your new app.

## Quick Start

1. **Download Images from Legacy Site**
   ```bash
   # Run the download script
   node scripts/download-images.js
   ```

2. **Manual Download** (if script doesn't work)
   - Visit https://www.kamelie.net
   - Right-click on images and "Save image as..."
   - Save to appropriate folders in `public/images/`

## Image Organization

```
public/images/
├── hero/           # Hero section images
├── gallery/        # Gallery and showcase images
├── plants/         # Individual plant photos
└── icons/          # Icons and logos
```

## Recommended Images to Download

### Hero Section
- Main greenhouse exterior
- Camellia blooms in greenhouse
- Owner with plants

### Gallery
- Greenhouse interior shots
- Different camellia varieties
- Seasonal blooming photos
- Plant care activities

### Plants
- Individual camellia species photos
- Close-up flower shots
- Plant size comparisons

## Updating Components

After adding images, update these files:

1. **Home Page** (`src/app/page.tsx`)
   - Replace placeholder divs with `<Image>` components
   - Add proper alt text and sizing

2. **Header** (`src/components/layout/header.tsx`)
   - Add logo image if available

3. **Footer** (`src/components/layout/footer.tsx`)
   - Add any additional images

## Image Optimization

For best performance:

1. **Resize images** to appropriate dimensions:
   - Hero images: 1200x800px
   - Gallery images: 800x600px
   - Plant photos: 600x600px

2. **Compress images** using tools like:
   - [TinyPNG](https://tinypng.com/)
   - [ImageOptim](https://imageoptim.com/)
   - [Squoosh](https://squoosh.app/)

3. **Use Next.js Image component**:
   ```jsx
   import Image from 'next/image'
   
   <Image
     src="/images/hero/camellia-hero.jpg"
     alt="Kamelie Greenhouse"
     width={1200}
     height={800}
     priority
   />
   ```

## Example Integration

```jsx
// Before (placeholder)
<div className="aspect-[4/3] bg-gradient-to-br from-green-200 to-green-300 flex items-center justify-center">
  <Leaf className="h-32 w-32 text-green-600" />
</div>

// After (real image)
<Image
  src="/images/gallery/greenhouse-interior.jpg"
  alt="Interior view of Kamelie Greenhouse"
  width={800}
  height={600}
  className="w-full h-full object-cover"
/>
```

## Current Placeholder Images

The app currently uses:
- Gradient backgrounds with icons
- Placeholder text
- CSS-generated patterns

Replace these with real photos for a professional look!
