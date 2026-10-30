import fs from 'node:fs';
import {sitemapXml,robotsText,textOf,sections,readableText} from '../lib/seo/templates.mjs';
export function writeSeoResources(pages,origin){
 const records=Object.entries(pages).filter(([,html])=>html.includes('content="index,follow"')).map(([path,html])=>{
  const main=html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]??'';
  let lastmod=null;for(const s of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{const schema=JSON.parse(s[1]);if(['BlogPosting','TechArticle'].includes(schema['@type']))lastmod=schema.dateModified??schema.datePublished??null;}catch{}}
  return {path,title:textOf(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]??path).replace(/ \| ZUFEK$/,''),description:textOf(html.match(/name="description" content="([^"]*)"/)?.[1]??''),lastmod,images:[...new Set([...main.matchAll(/<img[^>]+src="([^"?]+)(?:\?[^\"]*)?"/g)].map(m=>m[1]).filter(s=>s.startsWith('/images/')))]};
 });
 fs.mkdirSync('lib/seo',{recursive:true});fs.writeFileSync('lib/seo/pages.json',JSON.stringify(records));
 fs.writeFileSync('lib/seo/texts.json',JSON.stringify(Object.fromEntries(Object.entries(pages).filter(([,html])=>html.includes('content="index,follow"')).map(([path,html])=>[path,readableText(html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]??'')]))));
 for(const root of ['static-site']){for(const s of sections)fs.writeFileSync(root+'/'+s.id+'-sitemap.xml',sitemapXml(records,origin,s.id));fs.writeFileSync(root+'/sitemap.xml',sitemapXml(records,origin));fs.writeFileSync(root+'/sitemap_index.xml',sitemapXml(records,origin));fs.writeFileSync(root+'/robots.txt',robotsText('',origin));}
}
