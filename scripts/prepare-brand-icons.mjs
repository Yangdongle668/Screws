import sharp from 'sharp';
import fs from 'node:fs';
// Trim only the supplied logo's outer whitespace; keep the artwork and colors.
const symbol=await sharp('public/brand/zufek-symbol.webp').trim({background:'#ffffff',threshold:25}).png().toBuffer();
for(const size of [32,48,180])await sharp(symbol).resize(size,size,{fit:'contain',background:'#ffffff'}).png().toFile(`public/favicon-${size}.png`);
const png=fs.readFileSync('public/favicon-48.png');
const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=48;header[7]=48;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
fs.writeFileSync('public/favicon.ico',Buffer.concat([header,png]));
const legacy=await sharp(symbol).resize(128,128,{fit:'contain',background:'#ffffff'}).png().toBuffer();
fs.writeFileSync('public/favicon.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><image width="128" height="128" href="data:image/png;base64,${legacy.toString('base64')}"/></svg>`);
console.log('Prepared approved ZUFEK PNG, ICO and legacy SVG icons.');
