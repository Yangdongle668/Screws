import fs from 'node:fs';
import {languages,splitLocale,decode} from '../lib/i18n/core.mjs';
const plain=html=>decode(html.replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
export function writeLanguageLlms(pages,origin){
 const entries=Object.entries(pages).filter(([,html])=>html.includes('content="index,follow"'));
 let root='\n\n## Language editions\n';
 for(const locale of Object.keys(languages)){
  const prefix=locale==='en'?'':'/'+locale;
  root+='- ['+languages[locale].name+']('+origin+prefix+'/llms.txt)\n';if(locale==='en')continue;
  const selected=entries.filter(([url])=>splitLocale(url).locale===locale);
  const header='# ZUFEK — '+languages[locale].name+'\n\n'+origin+prefix+'/\n\n';
  const index=selected.map(([url,html])=>'- ['+plain(html.match(/<title>(.*?)<\/title>/s)?.[1]??url)+']('+origin+url+'): '+decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1]??'')).join('\n');
  const full=selected.map(([url,html])=>'\n\n# '+plain(html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]??url)+'\n'+origin+url+'\n\n'+plain(html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]??'')).join('');
  for(const base of ['public','static-site']){fs.mkdirSync(base+prefix,{recursive:true});fs.writeFileSync(base+prefix+'/llms.txt',header+index+'\n');fs.writeFileSync(base+prefix+'/llms-full.txt',header+full+'\n');}
 }
 fs.appendFileSync('public/llms.txt',root);
}
