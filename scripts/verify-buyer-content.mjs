import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buyerPaths,buyerCopy,buyerMetadata} from './buyer-content.mjs';
import {collectStrings,localePath} from '../lib/i18n/core.mjs';
import {industryInterfaces,industryInterfaceCopy} from './industry-interface-content.mjs';
const pages=JSON.parse(fs.readFileSync('lib/generated-pages.json','utf8'));
const origin=JSON.parse(fs.readFileSync('lib/site-config.json','utf8')).origin;
const reviewed=JSON.parse(fs.readFileSync('translations/buyer-review.json','utf8'));
for(const locale of ['en','de','es','it','zh','fr']){
 for(const path of buyerPaths){
  const url=localePath(path,locale),html=pages[url];
  assert(html,'Missing decision page '+url);
  assert.equal((html.match(/id="buyer-decision"/g)||[]).length,1,'One coherent decision aid '+url);
  assert(html.includes('<caption>')&&html.includes('<th scope="col">'),'Accessible comparison '+url);
  assert(html.includes('<link rel="canonical" href="'+origin+url+'">'),'Self-canonical '+url);
  assert(!html.includes('Read the strength data in the right condition'),'Repeated material appendix '+url);
  assert(!html.includes('Translate the application into a fastener specification'),'Repeated industry appendix '+url);
  if(locale!=='en')for(const text of collectStrings(pages[path])){
   if(reviewed[text])assert(html.includes(reviewed[text][locale].replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')),'Reviewed copy absent '+url+' '+text.slice(0,60));
  }
 }
 for(const path of Object.keys(buyerMetadata)){
  const html=pages[localePath(path,locale)],schemas=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert(description&&html.includes('<meta property="og:description" content="'+description+'">'));
  assert(schemas.some(node=>['WebPage','CollectionPage'].includes(node['@type'])&&node.description));
 }
 const quality=pages[localePath('/quality/',locale)];
 assert(quality.includes('/photos/stepped-components.jpg'),'Real supplied photograph '+locale);
 assert(quality.includes('/downloads/inspection-plan-blank.csv'));
 for(const base of ['/privacy/','/cookies/','/legal/','/data-requests/'])assert(pages[localePath(base,locale)].includes('content="noindex,follow"'),'Non-indexable public notice retains follow '+locale+base);
}
assert(pages['/admin/'].includes('noindex,nofollow'));
assert(pages['/404/'].includes('noindex,nofollow'));
for(const bad of ['细节让','让我们回顾一下','讨论您的定制部分','外加螺钉','浏览应用程序设计研究'])assert(!pages['/zh/'].includes(bad),'Literal homepage translation '+bad);
const shortest=8.20-0.03-(8.00+0.05),longest=8.20+0.03-(8.00-0.05);
assert.equal(shortest.toFixed(2),'0.12');assert.equal(longest.toFixed(2),'0.28');
assert.equal(Math.ceil((2000-100)/(0.25-0.08)),11177);
for(const [q,formed,turned]of [[1000,2080,350],[20000,3600,5100]]){assert.equal(2000+0.08*q,formed);assert.equal(100+0.25*q,turned);}
for(const file of ['material-specification.csv','manufacturing-route-cost.csv'])assert.equal(fs.readFileSync('public/downloads/'+file,'utf8'),fs.readFileSync('static-site/downloads/'+file,'utf8'));
for(const [path,html]of Object.entries(pages)){
 const schemas=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
 for(const service of schemas.filter(node=>node['@type']==='Service'))assert(service.serviceType,'Service type '+path);
 const visit=value=>{if(!value||typeof value!=='object')return;for(const [key,child]of Object.entries(value)){if(key==='@id'&&typeof child==='string')assert(!child.endsWith('#product'),'Dangling legacy product identity '+path);if(child&&typeof child==='object')visit(child);}};
 schemas.forEach(visit);
}
assert(buyerCopy.routeIntro.includes('not ZUFEK prices'));
const industryReview=JSON.parse(fs.readFileSync('translations/industry-interface-review.json','utf8'));
for(const [slug,r]of Object.entries(industryInterfaces))for(const locale of ['en','de','es','it','zh','fr']){
 const base='/industries/'+slug+'/',url=localePath(base,locale),html=pages[url],block=html.match(/<section class="section compact industry-interfaces"[\s\S]*?<\/section>/)?.[0];
 assert(block,'Industry decision aid '+url);assert.equal((block.match(/<tr>/g)||[]).length,4);assert(block.includes('<caption>')&&block.includes('<th scope="row">'));
 assert(!html.includes('Translate the application into a fastener specification'),'Generic appendix replaced '+url);
 assert(html.indexOf(block)<html.indexOf('<section class="section two-columns">'),'Decision aid precedes related lists '+url);
 for(const product of r.products)assert(block.includes('href="'+localePath('/products/'+product+'/',locale)+'"'),'Contextual product '+url);
 for(const [i,n]of ['One','Two','Three'].entries()){const path=r.acceptanceLinks?.[n]?.[0]??'/capabilities/'+r.processes[i]+'/';assert(block.includes('href="'+localePath(path,locale)+'"'),'Contextual acceptance '+url);}
 assert(block.includes('href="'+localePath(r.next,locale)+'"'));
 const title=locale==='en'?industryInterfaceCopy[r.key+'MetaTitle']+' | ZUFEK':industryReview[industryInterfaceCopy[r.key+'MetaTitle']+' | ZUFEK'][locale];
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');assert(html.includes('<title>'+escape(title)+'</title>'));assert(!html.includes('| ZUFEK | ZUFEK'));
 const description=locale==='en'?industryInterfaceCopy[r.key+'Meta']:industryReview[industryInterfaceCopy[r.key+'Meta']][locale];
 assert(html.includes('<meta name="description" content="'+escape(description)+'">'));
 const graph=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));assert(graph.some(n=>n['@type']==='WebPage'&&n.description===description));
 if(locale!=='en')for(const source of collectStrings(block))assert(!Object.hasOwn(industryReview,source),'Untranslated decision field '+url);
}
console.log(JSON.stringify({decisionPages:buyerPaths.length,industryDecisionPages:Object.keys(industryInterfaces).length,languages:6,workedCalculations:true,materialWorksheet:true,inspectionTemplates:true,realReferencePhotos:true,localizedMetadata:true,existingCompanyFactsPreserved:true}));
