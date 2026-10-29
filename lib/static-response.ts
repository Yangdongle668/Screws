import {env} from 'cloudflare:workers';
import {articleCard,type Article} from './editorial-api';
import pages from './generated-pages.json';
export async function staticResponse(request:Request,path?:string){
 const u=new URL(request.url);const pathname=path??u.pathname;
 const normalized=pathname==='/'?'/':pathname.replace(/\/$/,'')+'/';
 if(normalized==='/resources/visual-library/')return Response.redirect(u.origin+'/products/',308);
 let html=(pages as Record<string,string>)[normalized];
 if(normalized.startsWith('/blog/')){
  if(!env.DB)return new Response('Content temporarily unavailable',{status:503});
  try{
   if(normalized==='/blog/'){
    const changes=await env.DB.prepare('SELECT slug,metadata,state FROM article_publications ORDER BY published_at DESC').all<{slug:string;metadata:string;state:string}>();
    for(const change of changes.results){const url='/blog/'+change.slug+'/';const pattern=/<a class="article-card"[^>]*>[\s\S]*?<\/a>/g;let found=false;html=html.replace(pattern,card=>{if(!card.includes('href="'+url+'"'))return card;found=true;return change.state==='withdrawn'?'':articleCard(JSON.parse(change.metadata) as Article);});if(!found&&change.state==='published')html=html.replace(/(<div class="[^"]*filter-grid[^"]*">)/,(open)=>open+articleCard(JSON.parse(change.metadata) as Article));}
   }else{const slug=normalized.split('/')[2];const entry=await env.DB.prepare('SELECT html,state FROM article_publications WHERE slug=?').bind(slug).first<{html:string;state:string}>();if(entry)html=entry.state==='published'?entry.html:undefined as unknown as string;}
  }catch{return new Response('Content temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
 }

 if(html&&pathname!==normalized)return Response.redirect(u.origin+normalized+u.search,308);
 return new Response(html??pages['/404/'],{status:html && normalized!='/404/'?200:404,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com https://*.openai.com",...(normalized==='/admin/'?{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}:{})}});
}
