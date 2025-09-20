#!/usr/bin/env node

/**
 * Script to help download images from the legacy Kamelie website
 * Run with: node scripts/download-images.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Sample image URLs from the legacy website (replace with actual URLs)
const imageUrls = [
  {
    url: 'https://www.kamelie.net/images/hero-camellia.jpg',
    filename: 'hero-camellia.jpg',
    category: 'hero'
  },
  {
    url: 'https://www.kamelie.net/images/greenhouse-interior.jpg',
    filename: 'greenhouse-interior.jpg',
    category: 'gallery'
  },
  {
    url: 'https://www.kamelie.net/images/camellia-blooms.jpg',
    filename: 'camellia-blooms.jpg',
    category: 'gallery'
  },
  {
    url: 'https://www.kamelie.net/images/plants-collection.jpg',
    filename: 'plants-collection.jpg',
    category: 'plants'
  }
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filepath)}`);
          resolve();
        });
      } else {
        console.log(`❌ Failed to download: ${url} (Status: ${response.statusCode})`);
        resolve(); // Continue with other downloads
      }
    }).on('error', (err) => {
      console.log(`❌ Error downloading ${url}:`, err.message);
      resolve(); // Continue with other downloads
    });
  });
}

async function downloadAllImages() {
  console.log('🚀 Starting image download from legacy website...\n');
  
  for (const image of imageUrls) {
    const categoryDir = path.join(imagesDir, image.category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    const filepath = path.join(categoryDir, image.filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping existing file: ${image.filename}`);
      continue;
    }
    
    await downloadImage(image.url, filepath);
  }
  
  console.log('\n✨ Image download completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Check the downloaded images in public/images/');
  console.log('2. Replace placeholder images in the app with real ones');
  console.log('3. Update the image paths in your components');
}

// Run the script
downloadAllImages().catch(console.error);
