import sharp from 'sharp';
import fs from 'node:fs';
// The SVG master keeps the approved symbol and outlined lettering together.
const source='public/brand/zufek-logo-aligned.svg';
await sharp(source).resize({width:2400}).flatten({background:'#ffffff'}).png().toFile('public/brand/zufek-logo-aligned.png');
// Keep the master/export margin; remove it from the web artboard so the mark
// aligns with the surrounding page content rather than an invisible border.
const master=fs.readFileSync(source,'utf8'),box=master.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number),width=box[2]+2*box[0],height=box[3]+2*box[1];
const web=master.replace(/<svg\b[^>]*>/,tag=>tag.replace(/width="[^"]+"/,'width="'+width+'"').replace(/height="[^"]+"/,'height="'+height+'"').replace(/viewBox="[^"]+"/,'viewBox="0 0 '+width+' '+height+'"'));
await sharp(Buffer.from(web)).resize({width:800}).flatten({background:'#ffffff'}).webp({quality:94}).toFile('public/brand/zufek-logo-aligned.webp');
console.log('Prepared aligned ZUFEK website lockup and white-background PNG export.');
