import sharp from 'sharp';
import path from 'path';

const SIZES = [192, 512];
const PUBLIC = 'public';

async function main() {
  for (const size of SIZES) {
    await sharp(path.join(PUBLIC, 'icon.svg'))
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
  console.log('Icons generated successfully');
}

main().catch(console.error);
