import {readFileSync,existsSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const briefs=JSON.parse(readFileSync('scripts/image-briefs.json','utf8'));
const pages=JSON.parse(readFileSync('lib/generated-pages.json','utf8'));
const hashes=new Set();let totalBytes=0;
for(const [slug,kind] of briefs){
 const file=`public/images/${slug}.webp`,small=`public/images/${slug}-small.webp`;
 assert(existsSync(file)&&existsSync(small),'Missing responsive image pair '+slug);
 const metadata=await sharp(file).metadata();assert.equal(metadata.format,'webp');assert(metadata.width<=1100&&metadata.width>=1000);
 const smallMeta=await sharp(small).metadata();assert.equal(smallMeta.width,560);
 const hash=createHash('sha256').update(readFileSync(file)).digest('hex');assert(!hashes.has(hash),'Duplicate image '+slug);hashes.add(hash);
 const page=pages[`/${kind==='product'?'products':'capabilities'}/${slug}/`];assert(page,'Missing page '+slug);assert(page.includes(`/images/${slug}.webp`),'Wrong page image '+slug);assert(!page.includes('AI-generated'),'Removed generation wording remains on '+slug);
 totalBytes+=statSync(file).size+statSync(small).size;
}
assert(!pages['/resources/visual-library/'],'Removed gallery still generated');
for(const [url,html] of Object.entries(pages)){
 assert(!html.includes('AI-generated')&&!html.includes('/resources/visual-library/'),'Removed content remains on '+url);
 for(const m of html.matchAll(/<img[^>]+src="([^\"]+)"[^>]*>/g)){
  assert(existsSync('public'+m[1].split('?')[0]),url+' references missing '+m[1]);assert(/\balt="[^\"]+"/.test(m[0]),url+' image lacks alt text');assert(/width="\d+"/.test(m[0])&&/height="\d+"/.test(m[0]),url+' image lacks explicit dimensions');
 }
 assert(!html.includes('<svg viewBox="0 0 640 420"'),url+' still uses generic screw illustration');
}
console.log(JSON.stringify({distinctImages:briefs.length,responsiveFiles:briefs.length*2,matchedDetailPages:true,altText:true,customerFacingCopy:true,allImageReferencesExist:true,totalImageBytes:totalBytes},null,2));
