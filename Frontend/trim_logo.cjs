const sharp = require('sharp');
const path = require('path');

async function trimImage() {
  const inputPath = path.join(__dirname, 'public', 'SMCS_logo_nobg.png');
  const outputPath = path.join(__dirname, 'public', 'SMCS_logo_nobg_trimmed.png');
  
  try {
    await sharp(inputPath)
      .trim()
      .toFile(outputPath);
    console.log('Image trimmed successfully');
  } catch (error) {
    console.error('Error trimming image:', error);
  }
}

trimImage();
