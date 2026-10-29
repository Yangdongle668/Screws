import assert from 'node:assert/strict';
import fs from 'node:fs';
import {textOf,splitPath,sections,validatePolicy} from '../lib/seo/templates.mjs';
const pages=JSON.parse(fs.readFileSync('lib/generated-pages.json'));
const indexed=Object.entries(pages).filter(([,h])=>h.includes('content="index,follow"'));
const rows=[],totals={};
for(const [path,h]of indexed){
 const meta=k=>h.match(new RegExp('<meta (?:name|property)="'+k+'" content="([^"]*)"'))?.[1];
 const canonical=h.match(/rel="canonical" href="([^"]*)"/)?.[1];
 assert(canonical&&new URL(canonical).pathname===path,'Canonical '+path);
 const title=textOf(h.match(/<title>(.*?)<\/title>/)?.[1]??'');assert(title&&meta('description'),'Title/description '+path);
 assert.equal((h.match(/<h1[ >]/g)||[]).length,1,'H1 '+path);
 for(const key of ['og:title','og:description','og:url','og:image','og:image:alt','og:locale','twitter:card','twitter:title','twitter:description','twitter:image'])assert(meta(key),'Missing '+key+' '+path);
 assert.equal(meta('og:url'),canonical,'OG URL '+path);
 assert.equal((h.match(/rel="alternate" hreflang=/g)||[]).length,7,'Language alternatives '+path);
 const graph=[...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].flatMap(m=>{const g=JSON.parse(m[1]);return g['@graph']??(Array.isArray(g)?g:[g]);});
 const types=graph.map(g=>g['@type']);for(const t of new Set(types))totals[t]=(totals[t]??0)+1;
 const org=graph.find(g=>g['@type']==='Organization');assert(org?.logo&&org?.address&&org?.contactPoint,'Company entity '+path);
 const page=graph.find(g=>['WebPage','CollectionPage','ProfilePage'].includes(g['@type']));assert(page?.url===canonical&&page?.description&&page?.inLanguage&&page?.isPartOf&&page?.primaryImageOfPage,'Page entity '+path);
 const {base,locale}=splitPath(path);if(base!=='/')assert(types.includes('BreadcrumbList'),'Breadcrumb '+path);
 const product=graph.find(g=>g['@type']==='Product');if(product)assert(product.image&&product.name&&product.description&&product.manufacturer&&!product.offers&&!product.aggregateRating,'Product '+path);
 const article=graph.find(g=>g['@type']==='BlogPosting');if(article)assert(article.author?.url&&article.image&&article.datePublished&&article.dateModified&&article.mainEntityOfPage?.['@id']===page['@id'],'Article '+path);
 const main=h.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]??'';
 rows.push({path,locale,title,description:textOf(meta('description')),titleCharacters:title.length,descriptionCharacters:textOf(meta('description')).length,bodyWords:textOf(main).split(/\s+/).length,types});
}
for(const locale of ['en','de','es','it','zh','fr']){const local=rows.filter(r=>r.locale===locale);assert.equal(new Set(local.map(r=>r.title)).size,local.length,'Duplicate titles '+locale);assert.equal(new Set(local.map(r=>r.description)).size,local.length,'Duplicate descriptions '+locale);}
const paths=[];for(const s of sections){const xml=fs.readFileSync('static-site/'+s.id+'-sitemap.xml','utf8');for(const m of xml.matchAll(/<loc>(.*?)<\/loc>/g))paths.push(new URL(m[1]).pathname);}
assert.equal(paths.length,indexed.length);assert.equal(new Set(paths).size,indexed.length);for(const [p]of indexed)assert(paths.includes(p),'Sitemap '+p);
assert.throws(()=>validatePolicy('User-agent: *\n<script>'));assert(validatePolicy('User-agent: *\nDisallow: /').rootBlock);
const summary={generatedPages:Object.keys(pages).length,indexablePages:rows.length,metadataComplete:rows.length,uniqueTitlesAndDescriptionsPerLanguage:true,languageAlternates:7,schemas:totals,sitemapSections:sections.length,sitemapURLs:paths.length,descriptionOver200:rows.filter(r=>r.descriptionCharacters>200).length};
fs.mkdirSync('docs/reports',{recursive:true});fs.writeFileSync('docs/reports/seo-audit.json',JSON.stringify({summary,pages:rows},null,2)+'\n');
fs.writeFileSync('docs/reports/SEO-AUDIT.md','# ZUFEK metadata and Schema audit\n\nSource audit, not a search-engine indexing or rich-result validation.\n\n```json\n'+JSON.stringify(summary,null,2)+'\n```\n\nAll indexable baseline pages have unique titles and descriptions within their language, self canonical, seven hreflang alternatives, one H1, Open Graph and Twitter image metadata, a company entity and a page entity. Product pages omit unverified prices, reviews and inventory. Articles include editorial authorship, image, dates and page relationships. Non-content/admin/legal pages remain intentionally noindex.\n\nDescriptions above 200 characters are editorial review candidates, not technical errors: Google has no fixed character requirement and may rewrite snippets. Body word counts in the JSON are descriptive, not a quality score; Chinese text is not whitespace segmented. Content quality, engineering accuracy, language fluency and real evidence require editorial review.\n\nSitemap index is split into eight topics; public XML is valid crawler input, /sitemap is the readable directory. robots.txt is not authorization. llms.txt is optional and does not guarantee AI citations or ranking.\n');
console.log(JSON.stringify(summary,null,2));
