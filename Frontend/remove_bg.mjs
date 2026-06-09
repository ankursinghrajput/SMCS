import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';

async function main() {
    const inputPath = './public/SMCS_logo.png';
    const outputPath = './public/SMCS_logo_nobg.png';

    console.log('Reading image...');
    const blob = new Blob([fs.readFileSync(inputPath)], { type: 'image/png' });

    console.log('Removing background...');
    const resultBlob = await removeBackground(blob);
    
    console.log('Saving result...');
    const arrayBuffer = await resultBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    
    console.log('Done!');
}

main().catch(console.error);
