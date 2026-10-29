import {env} from 'cloudflare:workers';
import {articleCard,type Article} from './editorial-api';
import pages from './runtime-pages.json';
import {splitLocale,localePath,locales,localizedArticleHtml,updateLanguageLinks,baselineExists} from './i18n/runtime';
import {sourceArticle} from './translation-api';
import {crawlResponse} from './seo/response';
export async function staticResponse(request:Request,path?:string){
 const crawl=await crawlResponse(request);if(crawl)return crawl;
 const u=new URL(request.url),pathname=path??u.pathname;
 const normalized=pathname==='/'?'/':pathname.replace(/\/$/,'')+'/';
 const {locale,path:base}=splitLocale(normalized);
 if(base==='/resources/visual-library/')return Response.redirect(u.origin+localePath('/products/',locale),308);
 let html=(pages as Record<string,string>)[base];if(locale!=='en'&&html)html=localizedArticleHtml(html,base,locale,locales);
 if(locale!=='en'&&!baselineExists(base,locale))html=undefined as unknown as string;
 if(base.startsWith('/blog/')){
  if(!env.DB)return new Response('Content temporarily unavailable',{status:503});
  try{
   if(base==='/blog/'){
    const changes=locale==='en'?await env.DB.prepare('SELECT slug,metadata,state FROM article_publications ORDER BY published_at DESC').all<{slug:string;metadata?:string;payload?:string;state:string}>():await env.DB.prepare("SELECT slug,payload,state FROM article_translations WHERE locale=? AND state IN ('published','withdrawn') ORDER BY published_at DESC").bind(locale).all<{slug:string;metadata?:string;payload?:string;state:string}>();
    for(const change of changes.results){const target=localePath('/blog/'+change.slug+'/',locale);const article=JSON.parse(change.metadata??change.payload??'{}') as Article;const english=locale==='en'?article:await sourceArticle(change.slug);const card=change.state==='published'?localizedArticleHtml(articleCard(article,english?.category??article.category),'/blog/'+change.slug+'/',locale,locales):'';let found=false;html=html.replace(/<a class="article-card"[^>]*>[\s\S]*?<\/a>/g,old=>{if(!old.includes('href="'+target+'"'))return old;found=true;return card;});if(!found&&card)html=html.replace(/(<div class="[^"]*filter-grid[^"]*">)/,open=>open+card);}
   }else{
    const slug=base.split('/')[2];
    const english=await env.DB.prepare('SELECT html,state FROM article_publications WHERE slug=?').bind(slug).first<{html:string;state:string}>();
    const translations=await env.DB.prepare('SELECT locale,html,state FROM article_translations WHERE slug=?').bind(slug).all<{locale:string;html:string;state:string}>();
    const selected=locale==='en'?english:translations.results.find(row=>row.locale===locale&&row.state!=='draft');
    if(selected)html=selected.state==='published'?selected.html:undefined as unknown as string;
    if(html){const available=locales.filter((l:string)=>{const row=l==='en'?english:translations.results.find(r=>r.locale===l&&r.state!=='draft');return row?row.state==='published':baselineExists(base,l);});html=updateLanguageLinks(html,base,locale,available);}
   }
  }catch{return new Response('Content temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
 }
 if(html&&pathname!==normalized)return Response.redirect(u.origin+normalized+u.search,308);
 const missing=!html||base==='/404/';
 return new Response(html??localizedArticleHtml(pages['/404/'],'/404/',locale,locales),{status:missing?404:200,headers:{'Content-Type':'text/html; charset=utf-8','Content-Language':locale==='zh'?'zh-Hans':locale,'Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com https://*.openai.com",...(normalized==='/admin/'?{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}:{})}});
}
