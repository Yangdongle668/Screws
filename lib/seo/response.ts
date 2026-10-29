import config from '../site-config.json';
import texts from './texts.json';
import {crawlRecords} from './snapshot';
import {readSeoPolicy} from './settings';
import {sitemapXml,robotsText,llmsText,portalHtml,sections} from './templates.mjs';
const mapPath=/^\/(page|product|post|process|material|industry|application|guide)-sitemap\.xml$/;
const llmPath=/^\/(?:(de|es|it|zh|fr)\/)?llms(-full)?\.txt$/;
export const isCrawlPath=(path:string)=>['/sitemap','/sitemap/','/sitemap.xml','/sitemap_index.xml','/robots.txt'].includes(path)||mapPath.test(path)||llmPath.test(path);
export async function crawlResponse(request:Request):Promise<Response|null>{
 const url=new URL(request.url);if(!isCrawlPath(url.pathname))return null;
 try{
  const origin=config.origin,headers={'Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, follow'};
  if(url.pathname==='/robots.txt'){const {policy}=await readSeoPolicy();return new Response(robotsText(policy.robots,origin),{headers:{...headers,'Content-Type':'text/plain; charset=utf-8'}});}
  const records=await crawlRecords();
  if(url.pathname==='/sitemap.xml'||url.pathname==='/sitemap_index.xml'||mapPath.test(url.pathname)){const section=url.pathname.match(mapPath)?.[1]??'index';return new Response(sitemapXml(records,origin,section),{headers:{...headers,'Content-Type':'application/xml; charset=utf-8'}});}
  const {policy}=await readSeoPolicy();const llm=url.pathname.match(llmPath);
  if(llm)return new Response(llmsText(records,origin,llm[1]??'en',policy.llmsNote,!!llm[2],texts),{headers:{...headers,'Content-Type':'text/plain; charset=utf-8'}});
  const section=sections.some(s=>s.id===url.searchParams.get('section'))?url.searchParams.get('section')!:'',view=['maps','robots','llms'].includes(url.searchParams.get('view')??'')?url.searchParams.get('view')!:'maps',locale=['en','zh','de','es','it','fr'].includes(url.searchParams.get('lang')??'')?url.searchParams.get('lang')!:'en';
  return new Response(portalHtml(records,origin,{section,view,locale,robots:robotsText(policy.robots,origin),note:policy.llmsNote}),{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
 }catch{return new Response('Crawl resources temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'}});}
}
