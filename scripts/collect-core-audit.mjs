import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {textOf} from '../lib/seo/templates.mjs';

export const isCorePath=p=>['/','/about/','/quality/'].includes(p)||/^\/(products|materials|industries|capabilities)\//.test(p);
const run=promisify(execFile),origin='https://zufek.net';
const decode=s=>textOf(s).replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&nbsp;',' ');
export function describeHtml(html){
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'';
 const bodyText=decode(main);
 const schemas=[];for(const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)){try{schemas.push(...[JSON.parse(m[1])].flat());}catch{}}
 return {title:decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),description:decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1]||''),canonical:html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]||null,robots:html.match(/<meta name="robots" content="([^"]+)"/)?.[1]||null,headings:[...main.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m=>({level:Number(m[1]),text:decode(m[2])})),links:[...new Set([...main.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')))],images:[...new Set([...main.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m=>m[1]))],schemaTypes:[...new Set(schemas.flatMap(s=>s['@type']||[]))],hreflang:[...html.matchAll(/<link[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"[^>]*>/g)].map(m=>({language:m[1],url:m[2]})),tables:(main.match(/<table\b/g)||[]).length,diagrams:(main.match(/<svg\b/g)||[]).length,bodyHash:createHash('sha256').update(bodyText).digest('hex'),bodyText};
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/collect-core-audit.mjs')){
 const inventory=JSON.parse(await fs.readFile('docs/content-operations/inventory.json','utf8'));
 const core=inventory.pages.filter(p=>isCorePath(p.path)).map(p=>p.path);
 const samples=['de','es','it','zh','fr'].flatMap(l=>['/'+l+'/','/'+l+'/products/shoulder-screws/']);
 const paths=[...core,...samples],results=new Array(paths.length);
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'zufek-public-audit-'));let next=0,complete=0;
 try{
  await Promise.all(Array.from({length:4},async()=>{
   while(next<paths.length){
    const i=next++,route=paths[i];
    const body=path.join(directory,String(i)+'.html'),headers=path.join(directory,String(i)+'.headers');
    const observedAt=new Date().toISOString();
    try{
     const {stdout}=await run(process.platform==='win32'?'curl.exe':'curl',['-sS','-L','--max-redirs','3','--max-time','18','-D',headers,'-o',body,'--write-out','%{http_code}\n%{url_effective}\n',origin+route],{maxBuffer:16384,windowsHide:true});
     const [status,url]=stdout.trim().split(/\r?\n/),html=await fs.readFile(body,'utf8');
     results[i]={path:route,url:origin+route,finalUrl:url,status:Number(status),observedAt,verification:'live_public_GET',...describeHtml(html)};
    }catch(error){results[i]={path:route,url:origin+route,observedAt,verification:'not_verified',error:String(error.message).slice(0,300)};}
    complete++;if(complete%16===0)console.log('Public pages checked: '+complete+'/'+paths.length);
   }
  }));
  const output={scope:'Read-only public GET observations. No RFQ submission, login, production database, server configuration, GSC or analytics access. Core English pages plus ten translation samples; not a full native-language review.',origin,corePaths:core,translationSamples:samples,observations:results};
  await fs.writeFile('docs/reports/core-live-observations.json',JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({corePages:core.length,translationSamples:samples.length,successfulGETs:results.filter(r=>r.status===200).length,unverified:results.filter(r=>r.verification==='not_verified').length}));
 }finally{
  if(path.dirname(directory)!==path.resolve(os.tmpdir())||!path.basename(directory).startsWith('zufek-public-audit-'))throw Error('Unexpected audit temporary directory');
  await fs.rm(directory,{recursive:true,force:true});
 }
}
