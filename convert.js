const fs = require('fs');
const path = require('path');

function getBase64(file) {
    const filePath = path.join(__dirname, 'assets', file);
    if (!fs.existsSync(filePath)) {
        console.warn('File not found:', filePath);
        return '';
    }
    return 'data:image/png;base64,' + fs.readFileSync(filePath).toString('base64');
}

const assets = {
    bg1: getBase64('bg-original.png'),
    bg2: getBase64('bg-thumbnail.png'),
    bg3: getBase64('bg-reels.png'),
    bg4: getBase64('bg-dungeon.png'),
    back: getBase64('card-back.png'),
    face1: getBase64('card-face-1.png')
};

fs.writeFileSync(path.join(__dirname, 'assets-data.js'), 'const ASSETS = ' + JSON.stringify(assets) + ';');
console.log('Conversion complete!');
