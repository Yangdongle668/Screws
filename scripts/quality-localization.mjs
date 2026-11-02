import fs from 'node:fs';
import {collectStrings,translatable} from '../lib/i18n/core.mjs';
import {qualityRevisions,runoutCorrection,qualityAids,referenceGallery} from './quality-content.mjs';
const file='translations/source.json',source=new Set(JSON.parse(fs.readFileSync(file,'utf8')));
for(const article of [...Object.values(qualityRevisions),runoutCorrection.article])for(const key of ['title','metaTitle','description','category','intro','example','keywords','checklist','sections','sources','relatedLinks']){
 const walk=value=>{if(typeof value==='string'&&!value.startsWith('/')&&!value.startsWith('https://')&&translatable(value))source.add(value);else if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')Object.values(value).forEach(walk);};walk(article[key]);
}
for(const fragment of [...Object.values(qualityAids()),referenceGallery()])for(const text of collectStrings(fragment))source.add(text);
fs.writeFileSync(file,JSON.stringify([...source].sort(),null,2)+'\n');
const review=JSON.parse(fs.readFileSync('translations/quality-review.json','utf8'));
for(const locale of ['de','es','it','zh','fr']){const path='translations/'+locale+'.json',dictionary=JSON.parse(fs.readFileSync(path,'utf8'));for(const [key,values]of Object.entries(review))if(values[locale])dictionary[key]=values[locale];fs.writeFileSync(path,JSON.stringify(dictionary,null,2)+'\n');}
console.log('Prepared quality revision strings and reviewed terminology.');
