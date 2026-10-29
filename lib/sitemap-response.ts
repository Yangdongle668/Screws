import {env} from 'cloudflare:workers';
import indexable from './i18n/indexable.json';
import config from './site-config.json';
import {splitLocale,localePath,languages,locales} from './i18n/runtime';
export async function sitemapResponse(_request:Request){
 try{
  const urls=new Map<string,string|null>(indexable.map(url=>[url,null]));
  if(!env.DB)return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
  const posts=await env.DB.prepare('SELECT slug,state,published_at FROM article_publications').all<{slug:string;state:string;published_at:string}>();
  for(const a of posts.results){const url='/blog/'+a.slug+'/';if(a.state==='published')urls.set(url,Number.isNaN(Date.parse(a.published_at))?null:new Date(a.published_at).toISOString());else urls.delete(url);}
  const translations=await env.DB.prepare('SELECT slug,locale,state,published_at FROM article_translations').all<{slug:string;locale:string;state:string;published_at:string}>();for(const a of translations.results){const url=localePath('/blog/'+a.slug+'/',a.locale);if(a.state==='published')urls.set(url,Number.isNaN(Date.parse(a.published_at))?null:new Date(a.published_at).toISOString());else if(a.state==='withdrawn')urls.delete(url);}
  const escape=(v:string)=>v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+[...urls].sort(([a],[b])=>a.localeCompare(b)).map(([url,date])=>{const base=splitLocale(url).path;const available=locales.filter((l:string)=>urls.has(localePath(base,l)));return '<url><loc>'+escape(config.origin+url)+'</loc>'+(date?'<lastmod>'+date+'</lastmod>':'')+available.map((l:string)=>'<xhtml:link rel="alternate" hreflang="'+languages[l as keyof typeof languages].tag+'" href="'+escape(config.origin+localePath(base,l))+'"/>').join('')+'</url>';}).join('')+'</urlset>';
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
}
