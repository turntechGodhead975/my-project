const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Create directories if they don't exist
if (!fs.existsSync('photos')) {
  fs.mkdirSync('photos');
}
if (!fs.existsSync('submissions.json')) {
  fs.writeFileSync('submissions.json', '[]');
}

// Store submissions
app.post('/submit', (req, res) => {
  const { name, photo, poetry, words } = req.body;
  
  // Save photo
  const photoBase64 = photo.replace(/^data:image\/jpeg;base64,/, '');
  const photoFilename = `${name.replace(/[^a-z0-9]/gi, '_')}_photo.jpg`;
  fs.writeFileSync(path.join(__dirname, 'photos', photoFilename), photoBase64, 'base64');
  
  // Save poetry image
  const poetryBase64 = poetry.replace(/^data:image\/jpeg;base64,/, '');
  const poetryFilename = `${name.replace(/[^a-z0-9]/gi, '_')}_poetry.jpg`;
  fs.writeFileSync(path.join(__dirname, 'photos', poetryFilename), poetryBase64, 'base64');
  
  // Log to submissions.json
  const submissions = JSON.parse(fs.readFileSync('submissions.json', 'utf8') || '[]');
  submissions.push({ 
    name, 
    photoFilename, 
    poetryFilename,
    words 
  });
  fs.writeFileSync('submissions.json', JSON.stringify(submissions, null, 2));
  
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});