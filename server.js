const express = require('express');
const cloudinary = require('cloudinary').v2;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Store submissions in memory (will reset when server restarts)
let submissions = [];

// Endpoint to get all submissions (for downloading later)
app.get('/submissions', (req, res) => {
  res.json(submissions);
});

// Get all image URLs from Cloudinary
app.get('/image-urls', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'poetry-project/',
      max_results: 500
    });
    
    res.json({
      images: result.resources.map(img => ({
        url: img.secure_url,
        public_id: img.public_id,
        filename: img.public_id.split('/').pop() + '.jpg'
      }))
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Store submissions
app.post('/submit', async (req, res) => {
  try {
    const { name, photo, poetry, words } = req.body;
    
    // Upload photo to Cloudinary
    const photoResult = await cloudinary.uploader.upload(photo, {
      folder: 'poetry-project',
      public_id: `${name.replace(/[^a-z0-9]/gi, '_')}_photo`
    });
    
    // Upload poetry to Cloudinary
    const poetryResult = await cloudinary.uploader.upload(poetry, {
      folder: 'poetry-project',
      public_id: `${name.replace(/[^a-z0-9]/gi, '_')}_poetry`
    });
    
    // Store submission data
    submissions.push({ 
      name, 
      photoUrl: photoResult.secure_url,
      poetryUrl: poetryResult.secure_url,
      words 
    });
    
    console.log('Submission saved:', name);
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});