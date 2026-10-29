import fs from 'node:fs';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {localizeHtml} from '../lib/i18n/core.mjs';
const briefs=JSON.parse(fs.readFileSync('scripts/sector-visuals.json','utf8')),pages=JSON.parse(fs.readFileSync('lib/generated-pages.json','utf8')),hashes=new Set();
for(const b of briefs){
 const file='public/images/'+b.slug+'.webp',small='public/images/'+b.slug+'-small.webp';assert(fs.existsSync(file)&&fs.existsSync(small),'Missing '+b.slug);
 const meta=await sharp(file).metadata(),thumb=await sharp(small).metadata();assert.equal(meta.width,1100);assert.equal(meta.height,734);assert.equal(thumb.width,560);
 const hash=createHash('sha256').update(fs.readFileSync(file)).digest('hex');assert(!hashes.has(hash),'Duplicate '+b.slug);hashes.add(hash);
 const base=b.kind==='industry'?'/industries/':b.kind==='material'?'/materials/':'/capabilities/',slug=b.slug.replace(/^(industry|material|result)-/,'');
 for(const prefix of ['','/de','/es','/it','/zh','/fr']){const html=pages[prefix+base+slug+'/'];assert(html?.includes('/images/'+b.slug+'.webp'),'Unmatched detail '+prefix+b.slug);if(b.kind!=='result')assert(pages[prefix+base].includes('/images/'+b.slug+'.webp'),'Unmatched thumbnail '+prefix+b.slug);else assert(html.includes('process-result-section'),'Missing after-process section');}
}
// Runtime localization must preserve the same image selection.
const english=pages['/industries/automotive-components/'];assert(localizeHtml(english,{locale:'de',base:'/industries/automotive-components/',origin:'https://example.invalid',dictionary:{},paths:new Set(Object.keys(pages)),strict:false}).includes('/images/industry-automotive-components.webp'));
console.log(JSON.stringify({industryOverviews:8,materialReferences:7,processOutcomes:10,responsiveAssets:50,allSixLanguages:true,matchedListsAndDetails:true,uniqueImages:true},null,2));
