import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {splitPath,textOf} from '../lib/seo/templates.mjs';
const directory='docs/content-operations';
const hash=value=>createHash('sha256').update(value).digest('hex');
const inputs=['lib/generated-pages.json','scripts/content/manifest.json'];
const sourceHashes=Object.fromEntries(inputs.map(file=>[file,hash(fs.readFileSync(file))]));
const pages=JSON.parse(fs.readFileSync(inputs[0],'utf8'));
const manifest=JSON.parse(fs.readFileSync(inputs[1],'utf8'));
const english=Object.entries(pages).filter(([url])=>splitPath(url).locale==='en'&&url!=='/admin/');
const kind=url=>url.startsWith('/industry-insights/')&&url!=='/industry-insights/'?'industry_insight':url.startsWith('/blog/')&&url!=='/blog/'?'technical_blog':url.startsWith('/guides/')&&url!=='/guides/'?'engineering_guide':url.startsWith('/products/')?'product':url.startsWith('/materials/')?'material':url.startsWith('/capabilities/')?'process':url.startsWith('/industries/')?'industry':'core_or_hub';
const records=english.map(([url,html])=>{
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]??'';
 const deep=manifest.find(item=>url===(item.kind==='insights'?'/industry-insights/':'/guides/')+item.slug+'/');
 const sources=deep?.sources.map(([title,url])=>({title,url,verificationStatus:'recorded_not_reverified'}))??[];
 return {id:url,path:url,type:kind(url),status:'present_in_repository',productionPublication:'not_verified',title:textOf(html.match(/<title>(.*?)<\/title>/)?.[1]??''),description:html.match(/<meta name="description" content="([^"]*)"/)?.[1]??'',indexable:html.includes('content="index,follow"'),englishBodyHash:hash(main),headings:[...main.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m=>({level:Number(m[1]),text:textOf(m[2])})),internalLinks:[...new Set([...main.matchAll(/href="(\/[^"#]*)/g)].map(m=>m[1]))],externalLinks:[...new Set([...main.matchAll(/href="(https?:\/\/[^"#]*)/g)].map(m=>m[1]))],recordedSources:sources,sourceLocations:deep?['scripts/content/'+deep.kind+'/'+deep.slug+'.md','scripts/content/manifest.json']:['scripts/ (locate the matching route or title before editing)','lib/generated-pages.json (generated snapshot; do not edit directly)'],bodyText:textOf(main),translations:Object.fromEntries(['de','es','it','zh','fr'].map(locale=>{const translated=pages['/'+locale+url];return [locale,{exists:!!translated,repositoryHash:translated?hash(translated):null,approval:'not_recorded',englishRevisionAlignment:'not_verified'}]}))};
});
const counts=records.reduce((all,row)=>(all[row.type]=(all[row.type]??0)+1,all),{});
const result={schemaVersion:1,scope:'Repository snapshot of English public pages and corresponding translation presence. No production or technical approval is implied.',sourceHashes,counts,pages:records};
fs.mkdirSync(directory,{recursive:true});
const filename=path.join(directory,'inventory.json');
if(process.argv.includes('--check')){
 const current=JSON.parse(fs.readFileSync(filename,'utf8'));
 if(JSON.stringify(current)!==JSON.stringify(result))throw Error('Content inventory is stale. Regenerate before planning.');
 console.log('Content inventory matches source snapshots.');
}else{
 const temporary=filename+'.tmp';fs.writeFileSync(temporary,JSON.stringify(result,null,2)+'\n');fs.renameSync(temporary,filename);
 console.log(JSON.stringify({pages:records.length,counts,ledgerUntouched:true},null,2));
}
