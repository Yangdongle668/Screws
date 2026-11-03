import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {practicalCopy} from './practical-content.mjs';
import {localePath} from '../lib/i18n/core.mjs';
import {materialFamilies} from './industry-material-content.mjs';
import {gradeDetails} from './material-grade-content.mjs';
import {materialSelectionMetadata} from './material-selection-content.mjs';
const pages=JSON.parse(fs.readFileSync('lib/generated-pages.json','utf8')),pack=JSON.parse(fs.readFileSync('lib/editorial-corrections.json','utf8'))[0];
for(const locale of ['en','de','es','it','fr','zh']){const prefix=locale==='en'?'':'/'+locale;for(const slug of ['set-screw-tip-selection','custom-screw-inspection-plan']){const page=pages[prefix+'/blog/'+slug+'/'];assert(page.includes('<caption>'),'Accessible comparison table '+locale);assert(page.includes('quality-table-scroll'));assert(page.includes('/downloads/'));assert(!page.includes('<h3>Technical references</h3><ul></ul>'));}assert(pages[prefix+'/about/'].includes('/photos/sample-display.jpg'));assert(pages[prefix+'/products/custom-screws/'].includes('/photos/stepped-components.jpg'));}
const en=pages['/blog/set-screw-tip-selection/'];for(const point of ['Flat point','Cone point','Dog point','Cup point'])assert(en.includes(point));assert(en.includes('Concept sketches only'));assert(pages['/blog/custom-screw-inspection-plan/'].includes('not measured results'));assert(pages['/zh/products/shoulder-screws/'].includes('确认检测与验收范围'));assert(!pages['/zh/products/shoulder-screws/'].includes('同意检查范围'));
for(const file of ['inspection-plan-example.csv','inspection-plan-blank.csv','set-screw-selection.csv']){assert(fs.existsSync('public/downloads/'+file));assert.equal(fs.readFileSync('public/downloads/'+file,'utf8'),fs.readFileSync('static-site/downloads/'+file,'utf8'));}
for(const name of ['sample-display.jpg','stepped-components.jpg'])assert(createHash('sha256').update(fs.readFileSync('public/photos/'+name)).digest('hex')===createHash('sha256').update(fs.readFileSync('static-site/photos/'+name)).digest('hex'));
assert(/^[a-f0-9]{64}$/.test(pack.expectedFingerprint));assert(!pack.article.sections.some(([h])=>h==='Give runout a datum and a reference axis'));assert(pack.article.sections.some(([,b])=>b.includes('is not a circular-runout tolerance')));
for(const locale of ['de','es','it','fr','zh']){const d=JSON.parse(fs.readFileSync('translations/'+locale+'.json','utf8'));for(const [h,b]of pack.article.sections){assert(d[h]&&d[b]);assert.notEqual(d[b],b);}const dogParagraph=Object.keys(d).find(k=>k.startsWith('If a cylindrical dog'));assert(!/Hundespitze|perro cilíndrico|cane cilindrico|chien cylindrique/.test(d[dogParagraph]));}
const interfaces=[['knurled-thumb-screws','thumb','knurled-thumb-screw-grip-design'],['t-slot-bolts','slot','t-slot-bolt-head-fit'],['double-ended-studs','stud','double-ended-stud-thread-identification'],['eccentric-screws','eccentric','eccentric-screw-datum-drawing']];
for(const [slug,key,reading]of interfaces)for(const locale of ['en','de','es','it','zh','fr']){
 const html=pages[localePath('/products/'+slug+'/',locale)],block=html.match(/<section class="section compact engineering-depth practical-section"[\s\S]*?<\/section>/)?.[0];assert(block,'Product interface '+slug+' '+locale);
 assert.equal((html.match(/id="practical-interface"/g)||[]).length,1);assert.equal((block.match(/<li>/g)||[]).length,3);assert(block.includes('<svg')&&block.includes('role="img"'));assert(block.includes('href="'+localePath('/blog/'+reading+'/',locale)+'"'));
 const dictionary=locale==='en'?null:JSON.parse(fs.readFileSync('translations/'+locale+'.json','utf8')),description=locale==='en'?practicalCopy[key+'Meta']:dictionary[practicalCopy[key+'Meta']];
 const graph=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));assert(graph.some(n=>n['@type']==='WebPage'&&n.description===description));
}
for(const material of materialFamilies)for(const locale of ['en','de','es','it','zh','fr']){
 const path='/materials/'+material.slug+'/',html=pages[localePath(path,locale)];
 for(const id of ['material-grades','material-strength','material-decisions','material-request','material-questions']){assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Unique material anchor '+id);assert(html.includes('href="#'+id+'"'));}
 const faq=html.match(/<section class="section compact material-questions"[\s\S]*?<\/section>/)[0];assert.equal((faq.match(/<details>/g)||[]).length,2);assert.equal((faq.match(/<summary>/g)||[]).length,2);
 const grade=html.match(/<section class="section compact material-grade-selection"[\s\S]*?<\/section>/)[0];assert.equal((grade.match(/<th scope="row">/g)||[]).length,gradeDetails[material.slug].rows.length);assert(grade.includes('<caption>'));
 const description=materialSelectionMetadata[path][1],dictionary=locale==='en'?null:JSON.parse(fs.readFileSync('translations/'+locale+'.json','utf8'));const graph=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));assert(graph.some(n=>n['@type']==='WebPage'&&n.description===(dictionary?dictionary[description]:description)));
 for(const product of material.products)assert(html.includes('href="'+localePath('/products/'+product+'/',locale)+'"'));
 for(const process of material.processes)assert(html.includes('href="'+localePath('/capabilities/'+process+'/',locale)+'"'));
}
assert(pages['/materials/titanium-alloys/'].includes('895 minimum'));assert(pages['/materials/titanium-alloys/'].includes('828 minimum'));assert(!pages['/materials/titanium-alloys/'].includes('Carpenter minimum specified material data'));
console.log(JSON.stringify({materialFamiliesReviewed:materialFamilies.length,materialLanguagePages:materialFamilies.length*6,additionalProductInterfaces:interfaces.length,sixLanguageDecisionAids:true,selectionComparison:true,filledInspectionExample:true,downloadableWorksheets:true,referencePhotos:true,noInventedMeasurementResults:true,runoutTermsSeparated:true,contextualTranslations:true}));
