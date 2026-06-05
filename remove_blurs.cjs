const fs = require('fs');
const path = require('path');

function walkSync(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let dirPath = path.join(dir, file);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkSync(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkSync('src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;
    
    // Replace blur classes
    content = content.replace(/ backdrop-blur-[a-z0-9]+/g, '');
    content = content.replace(/ blur-[a-z0-9]+/g, '');
    content = content.replace(/backdropFilter:\s*['"]blur[^'"]*['"]/g, "backdropFilter: 'none'");
    
    if (content !== original) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log('Fixed ' + filepath);
    }
  }
});
