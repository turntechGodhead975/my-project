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
  const { name, photo } = req.body;
  
  // Save photo as image file
  const base64Data = photo.replace(/^data:image\/jpeg;base64,/, '');
  const filename = `${name.replace(/[^a-z0-9]/gi, '_')}.jpg`;
  
  fs.writeFileSync(path.join(__dirname, 'photos', filename), base64Data, 'base64');
  
  // Log to submissions.json
  const submissions = JSON.parse(fs.readFileSync('submissions.json', 'utf8') || '[]');
  submissions.push({ name, filename });
  fs.writeFileSync('submissions.json', JSON.stringify(submissions, null, 2));
  
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});