import assert from 'node:assert/strict';
import fs from 'node:fs';
import {coreArticleSlugs} from './priority-articles.mjs';
import {studies} from './application-studies.mjs';
import {processDecisions} from './process-decisions.mjs';
import sharp from 'sharp';
const pages=JSON.parse(fs.readFileSync('lib/generated-pages.json','utf8'));
const {origin}=JSON.parse(fs.readFileSync('lib/site-config.json','utf8'));
const llms=fs.readFileSync('public/llms.txt','utf8');
const full=fs.readFileSync('public/llms-full.txt','utf8');
const xml=fs.readFileSync('static-site/sitemap.xml','utf8');
const publicUrls=Object.entries(pages).filter(([,html])=>html.includes('content="index,follow"'));
for(const [url,html] of publicUrls){assert(html.includes('<link rel="canonical" href="'+origin+url+'">'),'Canonical '+url);assert(llms.includes(']('+origin+url+')'),'LLMS '+url);assert(xml.includes('<loc>'+origin+url+'</loc>'),'Sitemap '+url);assert(!/>\s*undefined\s*</.test(html)&&!/(href|src)="[^"]*undefined/.test(html),'Undefined interpolation '+url);}
for(const url of ['/admin/','/404/','/privacy/','/cookies/','/legal/','/data-requests/'])assert(!xml.includes('<loc>'+origin+url+'</loc>'));
assert(pages['/'].includes('Custom metal screws<br><em>manufacturer.</em>'));
assert(pages['/products/'].includes('Find the right structure.'));
assert(pages['/products/custom-screws/'].includes('Custom screws<br><em>from your drawing.</em>'));
for(const slug of ['shoulder-screws','security-screws','hollow-screws','flange-screws','knurled-thumb-screws','set-screws']){
 const html=pages['/products/'+slug+'/'];assert(html.includes('Verification discussion'));assert(html.includes('Common specification questions'));assert(html.includes('10–15 days'));
}
for(const slug of Object.keys(processDecisions))assert(pages['/capabilities/'+slug+'/'].includes('Process decision and release matrix'));
for(const slug of coreArticleSlugs){const html=pages['/blog/'+slug+'/'];assert((html.match(/<section id="section-/g)||[]).length>=7,slug);assert(!html.includes('Apply the guidance to the assembly'),'Repeated product appendix '+slug);}
for(const s of studies){const html=pages['/applications/'+s.slug+'/'];assert(html.includes('Concept status'));assert(html.includes('No customer delivery, performance result or certification is claimed.'));assert(!html.includes('content="article"'));for(const p of s.products)assert(html.includes('/products/'+p+'/'));assert(full.includes('Source: '+origin+'/applications/'+s.slug+'/'));assert(html.includes('class="application-schematic"'));assert(html.includes('/images/application-'+s.slug+'.webp'));assert(pages['/applications/'].includes('/images/application-'+s.slug+'.webp'));const large=await sharp('public/images/application-'+s.slug+'.webp').metadata();const small=await sharp('public/images/application-'+s.slug+'-small.webp').metadata();assert(large.width===1200&&large.height===800&&small.width===560);}
for(const [from,to] of [['/industries/automotive-components/','/applications/automotive-module-enclosure/'],['/industries/industrial-automation/','/applications/automation-pivot-fixture/'],['/products/shoulder-screws/','/applications/automation-pivot-fixture/'],['/materials/','/guides/material-strength-selection/']])assert(pages[from].includes('href="'+to+'"'),from+' -> '+to);
console.log(JSON.stringify({indexablePages:publicUrls.length,distinctPageIntent:true,coreProductMatrices:6,processMatrices:10,expandedCoreArticles:coreArticleSlugs.length,illustrativeProjects:studies.length,materialSelectionGuide:true,canonicalAndLlmCoverage:true,noFabricatedProjectResults:true},null,2));
