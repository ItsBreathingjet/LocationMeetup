
// Script to prepare the build for Capacitor
const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy index.html to dist root
fs.copyFileSync('dist/public/index.html', 'dist/index.html');

// Copy all assets folders
const assetsDir = path.join('dist/public/assets');
const targetAssetsDir = path.join('dist/assets');

if (!fs.existsSync(targetAssetsDir)) {
  fs.mkdirSync(targetAssetsDir, { recursive: true });
}

// Copy all files from assets directory
const assetFiles = fs.readdirSync(assetsDir);
assetFiles.forEach(file => {
  fs.copyFileSync(path.join(assetsDir, file), path.join(targetAssetsDir, file));
});

console.log('Build prepared for Capacitor!');
