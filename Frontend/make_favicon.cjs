const sharp = require('sharp');

async function createFavicon() {
  try {
    const inputPath = 'public/SMCS_logo_nobg.png';
    // Trim transparent edges first
    const trimmed = sharp(inputPath).trim();
    const metadata = await trimmed.metadata();
    
    // Determine max dimension of the trimmed image
    const size = Math.max(metadata.width, metadata.height);

    // Create a square container with the trimmed image centered
    await sharp(await trimmed.toBuffer())
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile('public/favicon.png');
    
    console.log('Large Favicon created successfully.');
  } catch (err) {
    console.error('Error creating favicon:', err);
  }
}

createFavicon();
