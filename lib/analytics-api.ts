import {adminAuthorized} from './admin-auth';
import {env} from 'cloudflare:workers';
import {publicPaths,splitLocale} from './i18n/runtime';
const paths=publicPaths;
const isPublicPath=async(path:string)=>{if(paths.has(path))return true;const parsed=splitLocale(path);if(!/^\/blog\/[a-z0-9-]{1,120}\/$/.test(parsed.path))return false;return !!await (parsed.locale==='en'?env.DB?.prepare("SELECT slug FROM article_publications WHERE slug=? AND state='published'").bind(parsed.path.split('/')[2]):env.DB?.prepare("SELECT slug FROM article_translations WHERE slug=? AND locale=? AND state='published'").bind(parsed.path.split('/')[2],parsed.locale))?.first();};
export const hasAnalyticsConsent=(r:Request)=>/(?:^|;\s*)zufek_analytics=1(?:;|$)/.test(r.headers.get('Cookie')??'');
export function cleanAttribution(raw:unknown){
 if(!raw||typeof raw!=='object')return null;const r=raw as Record<string,unknown>;
 const label=(v:unknown)=>typeof v==='string'?v.replace(/[^a-zA-Z0-9._ -]/g,'').trim().slice(0,80):'';
 let referrer='';try{if(typeof r.referrer==='string'&&r.referrer)referrer=new URL(r.referrer.includes('://')?r.referrer:'https://'+r.referrer).hostname.slice(0,180);}catch{}
 return {landing:typeof r.landing==='string'&&(paths.has(r.landing)||/^\/(?:(?:de|es|it|zh|fr)\/)?blog\/[a-z0-9-]{1,120}\/$/.test(r.landing))?r.landing:'/',referrer,source:label(r.source),medium:label(r.medium),campaign:label(r.campaign)};
}
export async function countAnalytics(request:Request,path:string,event='pageview',source='Direct / unknown'){
 if(!env.DB||!hasAnalyticsConsent(request)||adminAuthorized(request)||!await isPublicPath(path))return;
 const country=request.headers.get('CF-IPCountry')??'Unknown';const safeCountry=/^[A-Z]{2}$/.test(country)?country:'Unknown';
 const day=new Date().toISOString().slice(0,10);const id=JSON.stringify([day,path,source,safeCountry,event]);
 await env.DB.batch([env.DB.prepare('INSERT INTO analytics_daily (id,day,path,source,country,event,count) VALUES (?,?,?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET count=count+1').bind(id,day,path,source,safeCountry,event),env.DB.prepare("DELETE FROM analytics_daily WHERE day < date('now','-90 days')"),env.DB.prepare('DELETE FROM rate_limits WHERE expires < ?').bind(Date.now())]);
}
export async function analyticsEvent(request:Request){
 const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
 if(request.headers.get('Origin')!==new URL(request.url).origin)return respond({error:'Invalid origin'},403);
 if(!hasAnalyticsConsent(request)||adminAuthorized(request))return respond({recorded:false});
 if(Number(request.headers.get('Content-Length')??0)>4096)return respond({error:'Request too large'},413);
 try{const text=await request.text();if(text.length>4096)return respond({error:'Request too large'},413);const body=JSON.parse(text);if(typeof body.path!=='string'||!await isPublicPath(body.path))return respond({error:'Unknown page'},400);
 if(/bot|crawler|spider|headless/i.test(request.headers.get('User-Agent')??''))return respond({recorded:false});
 // Short-lived pseudonymous key is used only for abuse limiting; never stored with statistics.
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('analytics:'+(request.headers.get('CF-Connecting-IP')??'local')+':'+Math.floor(Date.now()/3600000)));const key=Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(!env.DB)return respond({error:'Unavailable'},503);const limit=await env.DB.prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+7200000).first<{count:number}>();if((limit?.count??0)>120)return respond({recorded:false},429);
 const a=cleanAttribution(body.attribution);await countAnalytics(request,body.path,'pageview',a?.source||a?.referrer||'Direct / unknown');return respond({recorded:true});
 }catch{return respond({error:'Could not record visit'},503);}
}
