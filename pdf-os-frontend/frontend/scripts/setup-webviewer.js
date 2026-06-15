const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, '../node_modules/@pdftron/webviewer/public');
const destPath = path.resolve(__dirname, '../public/webviewer');

try {
  console.log('Copying WebViewer binaries from node_modules to public folder...');
  fs.cpSync(sourcePath, destPath, { recursive: true });
  console.log('✅ WebViewer files copied successfully.');
} catch (err) {
  console.error('❌ Error copying WebViewer files:', err);
  process.exit(1);
}
