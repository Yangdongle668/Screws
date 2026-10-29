import sharp from 'sharp';
import {existsSync,mkdirSync,renameSync,readFileSync,writeFileSync} from 'node:fs';
const briefs=JSON.parse(readFileSync('scripts/image-briefs.json','utf8'));
mkdirSync('outputs/generated-images',{recursive:true});
const manifest=[];
for(const [slug,kind,brief] of briefs){
 const input=existsSync(`public/images/${slug}.png`)?`public/images/${slug}.png`:`outputs/generated-images/${slug}.png`;
 if(!existsSync(input)){if(process.argv.includes('--partial'))continue;throw new Error('Missing image: '+slug);}
 const metadata=await sharp(input).metadata();
 await sharp(input).resize({width:1100,withoutEnlargement:true}).webp({quality:84}).toFile(`public/images/${slug}.webp`);
 await sharp(input).resize({width:560,withoutEnlargement:true}).webp({quality:80}).toFile(`public/images/${slug}-small.webp`);
 if(input.startsWith('public/')){const target=`outputs/generated-images/${slug}.png`;if(existsSync(target))renameSync(target,`outputs/generated-images/${slug}-previous-${Date.now()}.png`);renameSync(input,target);}
 manifest.push({slug,kind,brief,width:metadata.width,height:metadata.height,full:`/images/${slug}.webp`,thumbnail:`/images/${slug}-small.webp`,provenance:'AI-generated illustrative visualization; not a dimensionally verified supplied part or factory photograph'});
}
writeFileSync('outputs/generated-images/manifest.json',JSON.stringify(manifest,null,2));
writeFileSync('public/images/manifest.json',JSON.stringify(manifest.map(({slug,kind,width,height,full,thumbnail})=>({slug,kind,width,height,full,thumbnail})),null,2));
console.log(`Optimized ${manifest.length} images into responsive WebP pairs. Originals retained in outputs/generated-images.`);
