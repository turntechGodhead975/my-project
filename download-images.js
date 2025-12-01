const https = require('https');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const RENDER_URL = 'https://proof-of-being.onrender.com/'; 
const PHOTOS_DIR = path.join(__dirname, 'photos');

// Create photos directory if it doesn't exist
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR);
}

// Download a single image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Main function to download all images
async function downloadAllImages() {
  try {
    console.log('Fetching image URLs from server...');
    
    // Fetch image URLs from your server
    const response = await fetch(`${RENDER_URL}/image-urls`);
    const data = await response.json();
    
    console.log(`Found ${data.images.length} images to download`);
    
    // Download each image
    for (const img of data.images) {
      const filepath = path.join(PHOTOS_DIR, img.filename);
      await downloadImage(img.url, filepath);
    }
    
    console.log('\nAll images downloaded successfully!');
    console.log(`Check the 'photos' folder: ${PHOTOS_DIR}`);
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadAllImages();