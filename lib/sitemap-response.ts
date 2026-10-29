import {env} from 'cloudflare:workers';
import pages from './generated-pages.json';
import config from './site-config.json';
export async function sitemapResponse(_request:Request){
 try{
  const urls=new Map<string,string|null>(Object.entries(pages).filter(([url,html])=>url!=='/resources/visual-library/'&&/<meta name="robots" content="index,follow">/.test(html)).map(([url])=>[url,null]));
  if(!env.DB)return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
  const posts=await env.DB.prepare('SELECT slug,state,published_at FROM article_publications').all<{slug:string;state:string;published_at:string}>();
  for(const a of posts.results){const url='/blog/'+a.slug+'/';if(a.state==='published')urls.set(url,Number.isNaN(Date.parse(a.published_at))?null:new Date(a.published_at).toISOString());else urls.delete(url);}
  const escape=(v:string)=>v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...urls].sort(([a],[b])=>a.localeCompare(b)).map(([url,date])=>'<url><loc>'+escape(config.origin+url)+'</loc>'+(date?'<lastmod>'+date+'</lastmod>':'')+'</url>').join('')+'</urlset>';
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
}
