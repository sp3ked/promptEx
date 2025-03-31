const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function convertSvgToPng(svgPath, outputPath, size) {
    // Read SVG file
    const svg = fs.readFileSync(svgPath, 'utf8');

    // Create canvas
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create a data URL from the SVG
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

    // Load the SVG as an image
    const img = await loadImage(svgDataUrl);

    // Draw the image
    ctx.drawImage(img, 0, 0, size, size);

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}

async function generateIcons() {
    const sizes = [16, 48, 128];
    const svgPath = 'icon.svg';

    for (const size of sizes) {
        const outputPath = `icon${size}.png`;
        await convertSvgToPng(svgPath, outputPath, size);
        console.log(`Generated ${outputPath}`);
    }
}

generateIcons().catch(console.error); 