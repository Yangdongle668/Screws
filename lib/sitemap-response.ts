import {env} from 'cloudflare:workers';
import pages from './generated-pages.json';
export async function sitemapResponse(request:Request){
 try{const origin=new URL(request.url).origin;const urls=new Set(Object.keys(pages).filter(u=>!['/admin/','/privacy/','/cookies/','/legal/','/data-requests/','/404/','/resources/visual-library/'].includes(u)));if(env.DB){const posts=await env.DB.prepare('SELECT slug,state FROM article_publications').all<{slug:string;state:string}>();for(const a of posts.results){const url='/blog/'+a.slug+'/';if(a.state==='published')urls.add(url);else urls.delete(url);}}
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...urls].map(u=>'<url><loc>'+origin+u+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=60'}});
 }catch{return new Response('Sitemap temporarily unavailable',{status:503});}
}
