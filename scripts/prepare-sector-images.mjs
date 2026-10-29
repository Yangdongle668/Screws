import fs from 'node:fs';
import sharp from 'sharp';
const briefs=JSON.parse(fs.readFileSync('scripts/sector-visuals.json','utf8'));
const report=[];
for(const b of briefs){const source='outputs/sector-images/'+b.slug+'.png';if(!fs.existsSync(source))throw Error('Missing selected image '+b.slug);const full='public/images/'+b.slug+'.webp',small='public/images/'+b.slug+'-small.webp';await sharp(source).resize(1100,734,{fit:'cover'}).webp({quality:84}).toFile(full);await sharp(source).resize(560,374,{fit:'cover'}).webp({quality:80}).toFile(small);report.push({...b,full:'/'+full.slice(7),thumbnail:'/'+small.slice(7)});}
fs.writeFileSync('public/images/sector-manifest.json',JSON.stringify(report.map(({slug,kind,title,full,thumbnail})=>({slug,kind,title,full,thumbnail})),null,2)+'\n');console.log('Prepared '+report.length+' responsive image pairs.');
