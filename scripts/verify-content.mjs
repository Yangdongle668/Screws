import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {expandedArticles} from './blog-expansion.mjs';
import {processArticles} from './blog-expansion-processes.mjs';
const pages=JSON.parse(readFileSync('lib/generated-pages.json','utf8'));
const blogPages=Object.entries(pages).filter(([u])=>u.startsWith('/blog/')&&u!=='/blog/');
assert.equal(blogPages.length,42);
const titles=new Set();
for(const [url,html] of Object.entries(pages)){
 assert.equal((html.match(/<h1[ >]/g)??[]).length,1,'Main heading '+url);
 assert(!html.includes('About ZUFEK'),'Old navigation label '+url);
 const title=html.match(/<title>(.*?)<\/title>/)[1];assert(!titles.has(title),'Duplicate title '+title);titles.add(title);
 for(const m of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g))if(m[1].endsWith('/'))assert(pages[m[1]],url+' missing target '+m[1]);
 for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))JSON.parse(m[1]);
}
for(const [url,html] of blogPages){
 assert(html.includes('By Theo Wan')&&html.includes('rel="author"'),'Visible author '+url);
 const schemas=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m=>JSON.parse(m[1]));const article=schemas.find(x=>x['@type']==='BlogPosting');
 assert(article&&article.author.name==='Theo Wan'&&article.author.url.endsWith('/authors/theo-wan/'),'Article author schema '+url);
 assert(article.publisher.name.includes('ZUFEK'));
 assert(html.includes('Continue exploring')&&html.includes('/request-a-quote/'),'Related reading and RFQ '+url);
 assert(pages['/blog/'].includes(url),'Article missing from index '+url);
}
for(const a of [...expandedArticles,...processArticles]){
 assert.equal(a.sections.length,4);assert.equal(a.checklist.length,5);assert(a.example.length>100);
 const html=pages[`/blog/${a.slug}/`];assert(html.includes('RFQ checklist')&&html.includes('Specification example'));
 assert(pages['/products/'+a.product+'/'],'Missing related product '+a.slug);
 for(const p of a.processes)assert(pages['/capabilities/'+p+'/'],'Missing process '+a.slug);
}
const about=pages['/about/'];for(const phrase of ['2005','Dalang','Dongguan','Millions of parts','Mercedes-Benz','BMW','vehicle applications served through component supply-chain projects'])assert(about.includes(phrase),'Company statement '+phrase);
assert(pages['/authors/theo-wan/'].includes('editorial pen name'));
const reached=new Set(['/']),pending=['/'];while(pending.length){const u=pending.shift();for(const m of pages[u].matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g))if(pages[m[1]]&&!reached.has(m[1])){reached.add(m[1]);pending.push(m[1]);}}
for(const u of Object.keys(pages))if(!['/404/','/admin/'].includes(u))assert(reached.has(u),'Orphan page '+u);
console.log(JSON.stringify({pages:Object.keys(pages).length,blogArticles:blogPages.length,newArticles:expandedArticles.length+processArticles.length,visibleAuthors:true,authorSchema:true,companyFacts:true,internalLinks:true,reachableFromHome:true},null,2));
