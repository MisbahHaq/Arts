const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = './Images';
const compressedDir = './CompressedImages';

fs.mkdirSync(compressedDir, { recursive: true });

fs.readdirSync(imagesDir).forEach(file => {
  const filePath = path.join(imagesDir, file);
  const compressedFilePath = path.join(compressedDir, file);

  sharp(filePath)
   .jpeg({ quality: 80 })
   .toFile(compressedFilePath, (err, info) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Compressed ${file} to ${compressedFilePath}`);
      }
    });
});