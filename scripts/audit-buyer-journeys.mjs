import fs from 'node:fs';
import assert from 'node:assert/strict';
import {splitLocale,localePath} from '../lib/i18n/core.mjs';
import {textOf,sections} from '../lib/seo/templates.mjs';
import {searchIntent} from '../lib/seo/search-intent.mjs';
import {buyerPaths} from './buyer-content.mjs';

const pages=JSON.parse(fs.readFileSync('lib/generated-pages.json','utf8'));
const records=JSON.parse(fs.readFileSync('lib/seo/pages.json','utf8'));
const origin=JSON.parse(fs.readFileSync('lib/site-config.json','utf8')).origin;
const indexed=new Set(records.map(r=>r.path));
const sourceNotes={
 '/products/shoulder-screws/':{primaryTopic:'custom shoulder screws',supportingTopics:['shoulder length tolerance stack','shoulder screw clearance'],role:'Specify a custom part and request a drawing review; the linked guide explains drawing preparation.'},
 '/products/hollow-screws/':{primaryTopic:'custom hollow screws',supportingTopics:['through-hole screw bore','hollow screw burr control'],role:'Specify a passage and its acceptance; do not imply a pressure rating.'},
 '/materials/stainless-steel-304-316/':{primaryTopic:'304 vs 316 stainless steel for screws',supportingTopics:['303 vs 304 screws','stainless fastener grade vs strength class'],role:'Choose a material basis; link to suitable parts and the material specification worksheet.'},
 '/capabilities/hybrid-manufacturing/':{primaryTopic:'cold heading with secondary machining',supportingTopics:['cold heading vs CNC cost','tooling cost for custom screws'],role:'Compare complete manufacturing routes and cost assumptions, then request a route review.'},
 '/industries/automotive-components/':{primaryTopic:'custom screws for automotive components',supportingTopics:['automotive bracket screws','module cover fasteners'],role:'Map assembly interfaces to relevant parts, documents and an illustrative design study.'},
 '/quality/':{primaryTopic:'custom screw inspection',supportingTopics:['fastener inspection records','custom screw inspection plan'],role:'Explain acceptance evidence and provide blank/example records; do not claim unverified equipment or tests.'}
};
let validatedLinks=0;
const rows=Object.entries(pages).filter(([path])=>splitLocale(path).locale==='en'&&path!=='/admin/').map(([path,html])=>{
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
 const links=[...new Set([...main.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)].map(m=>m[1]).filter(p=>p.endsWith('/')))];
 for(const link of links){assert(pages[link],path+' broken journey link '+link);validatedLinks++;}
 return {path,title:textOf(html.match(/<title>(.*?)<\/title>/)?.[1]),indexable:indexed.has(path),intent:searchIntent(path),...(sourceNotes[path]||{}),contextualDestinations:links,decisionAid:buyerPaths.includes(path),evidenceStatus:'Repository content only; production publication and customer performance are not asserted.'};
});
for(const locale of ['en','de','es','it','zh','fr'])for(const [path,html]of Object.entries(pages).filter(([p])=>splitLocale(p).locale==='en'&&indexed.has(p))){
 const local=localePath(path,locale),h=pages[local];assert(h.includes('href="'+origin+local+'"'),'Canonical '+local);
 for(const other of ['en','de','es','it','zh','fr'])assert(h.includes('href="'+origin+localePath(path,other)+'"'),'Canonical language alternate '+local);
}
const locs=sections.flatMap(s=>[...fs.readFileSync('static-site/'+s.id+'-sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname));
assert.equal(locs.length,indexed.size);assert.equal(new Set(locs).size,indexed.size);
for(const path of locs)assert(indexed.has(path)&&!path.includes('?'),'Sitemap excludes parameter/noindex URLs');
const report={scope:'Build-time content and crawl-hint review. Topic labels are editorial choices, not observed PAA, search volumes, ranking difficulty or guaranteed rankings.',baselineSource:'User-supplied full audit, 2026-11-03: 987 requests, 162 RFQ parameter variants, 825 paths including production database articles.',indexableBaselineURLs:indexed.size,sitemapGroups:sections.length,validatedContextLinks:validatedLinks,pages:rows};
fs.writeFileSync('docs/reports/buyer-journeys.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({indexableBaselineURLs:indexed.size,sitemapGroups:sections.length,validatedContextLinks:validatedLinks,focusedDecisionPages:buyerPaths.length,keywordMetricsInvented:false}));
