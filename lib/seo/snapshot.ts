import {env} from 'cloudflare:workers';
import baseline from './pages.json';
import {localePath,locales} from '../i18n/runtime';
import {readableText,validDate} from './templates.mjs';
export type CrawlRecord={path:string;title:string;description:string;lastmod:string|null;images:string[];text?:string};
export async function crawlRecords():Promise<CrawlRecord[]>{
 if(!env.DB)throw Error('Public content database unavailable');
 const urls=new Map<string,CrawlRecord>(baseline.map(r=>[r.path,r]));
 const posts=await env.DB.prepare('SELECT slug,state,published_at,metadata,html FROM article_publications').all<{slug:string;state:string;published_at:string;metadata:string;html:string}>();
 const translated=await env.DB.prepare("SELECT slug,locale,state,published_at,payload,html FROM article_translations WHERE state IN ('published','withdrawn')").all<{slug:string;locale:string;state:string;published_at:string;payload:string;html:string}>();
 const update=(a:{slug:string;state:string;published_at:string;html:string},locale:string,payload:string)=>{const path=localePath('/blog/'+a.slug+'/',locale);if(a.state!=='published'){urls.delete(path);return;}const data=JSON.parse(payload);urls.set(path,{path,title:String(data.title??a.slug),description:String(data.intro??''),lastmod:validDate(a.published_at),text:readableText(a.html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]??a.html),images:[...new Set([...a.html.matchAll(/<img[^>]+src="([^"?]+)(?:\?[^\"]*)?"/g)].map(m=>m[1]).filter(s=>s.startsWith('/images/')))]});};
 for(const a of posts.results)update(a,'en',a.metadata||'{}');for(const a of translated.results)if(locales.includes(a.locale))update(a,a.locale,a.payload||'{}');
 const overrides=await env.DB.prepare("SELECT key,value FROM site_settings WHERE key LIKE 'seo:page:%'").all<{key:string;value:string}>();for(const row of overrides.results){const item=urls.get(row.key.slice(9));if(item){const value=JSON.parse(row.value);item.title=value.title||item.title;item.description=value.description||item.description;}}
 return [...urls.values()].sort((a,b)=>a.path.localeCompare(b.path));
}
