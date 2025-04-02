
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create empty directories for future implementation
const fs = require('fs');
const directories = [
  'src/frontend/Admin',
  'src/frontend/Researcher',
  'src/frontend/Reviewer',
  'src/frontend/Signup',
  'src/frontend/Login',
  'src/backend/routes',
  'src/backend/models',
  'src/backend/controllers',
  'src/backend/middleware'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    // Create a placeholder file so the directory isn't empty
    fs.writeFileSync(path.join(dir, 'placeholder.txt'), 'This directory is for future implementation.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});
