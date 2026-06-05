import https from 'https';
import fs from 'fs';

const url = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/unhinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf';
const file = fs.createWriteStream("public/NotoSansBengali.ttf");

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed.');
  });
}).on('error', (err) => {
  fs.unlink("public/NotoSansBengali.ttf", () => {});
  console.error('Error:', err.message);
});
