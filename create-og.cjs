const sharp = require('sharp');

async function main() {
  await sharp('לוגו לרוחב.png')
    .resize({ width: 600, height: 315, fit: 'contain', background: { r: 253, g: 251, b: 247, alpha: 1 } })
    .jpeg({ quality: 85 })
    .toFile('public/og-image.jpg');
  
  console.log('Created og-image.jpg');
}

main().catch(console.error);
