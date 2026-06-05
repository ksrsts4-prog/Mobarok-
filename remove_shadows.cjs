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
    
    // Replace heavy shadows with lighter ones
    content = content.replace(/shadow-2xl/g, 'shadow-md');
    content = content.replace(/shadow-xl/g, 'shadow-sm');
    
    if (content !== original) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log('Fixed ' + filepath);
    }
  }
});
