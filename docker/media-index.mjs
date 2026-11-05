import {createHash} from 'node:crypto';
import fs from 'node:fs';
const pages=JSON.parse(fs.readFileSync('lib/runtime-pages.json','utf8'));
const items=new Map();
for(const [pathname,html]of Object.entries(pages)){
 if(/^\/(?:admin|404)(?:\/|$)/.test(pathname))continue;
 const page=pathname.replace(/^\/(de|es|fr|it|zh)(?=\/)/,'');
 let diagram=0;for(const svg of html.matchAll(/<svg\b[^>]*role=["']img["'][^>]*>[\s\S]*?<\/svg>/gi)){const asset='/media-source/'+createHash('sha256').update(page+':'+diagram++).digest('hex').slice(0,20)+'.svg';if(!items.has(asset))items.set(asset,{asset,title:'工程示意图 '+page+' #'+diagram,pages:[{path:page,title:page}],inline:[]});if(!items.get(asset).inline.includes(svg[0]))items.get(asset).inline.push(svg[0]);}
 const title=html.match(/<title>([^<]*)<\/title>/)?.[1]||page;
 for(const match of html.matchAll(/(?:\/[^\s"'<>(),?#]+\.(?:webp|png|jpe?g|svg|avif|ico))(?=[\s"'<>(),?#]|$)/gi)){
  let asset=match[0].replace(/-small(?=\.[^.]+$)/,'');
  if(!fs.existsSync('public'+asset)||asset.includes('admin-'))continue;
  if(!items.has(asset))items.set(asset,{asset,title:asset.split('/').pop(),pages:[]});
  const item=items.get(asset);const existing=item.pages.find(p=>p.path===page);if(!existing)item.pages.push({path:page,title});else if(pathname.startsWith('/zh/'))existing.title=title;
 }
}
fs.mkdirSync('dist/docker',{recursive:true});fs.writeFileSync('dist/docker/media-index.json',JSON.stringify([...items.values()]));
console.log('Media index:',items.size,'assets');
