import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('/opt/zufek-media/node_modules/sharp');}catch{sharp=require('sharp');}
const basePage=p=>p.replace(/^\/(de|es|fr|it|zh)(?=\/)/,'');
const family=p=>p.replace(/-small(?=\.[^.]+$)/,'');
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function createMediaService({db,data,publicRoot,index}){
 await db.prepare('CREATE TABLE IF NOT EXISTS media_versions (id TEXT PRIMARY KEY, asset TEXT NOT NULL, scope TEXT NOT NULL, created_at TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, alt TEXT NOT NULL, fit TEXT NOT NULL)').run();
 await db.prepare('CREATE TABLE IF NOT EXISTS media_active (asset TEXT NOT NULL, scope TEXT NOT NULL, version TEXT, revision INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(asset,scope))').run();
 const directory=path.join(data,'media');await fs.mkdir(directory,{recursive:true});
 const catalog=new Map(index.map(x=>[x.asset,x]));
 const active=async()=> (await db.prepare('SELECT a.*,v.width,v.height,v.alt,v.fit FROM media_active a LEFT JOIN media_versions v ON a.version=v.id WHERE a.version IS NOT NULL').all()).results;
 const url=(id,small=false)=>'/media/'+id+(small?'-small':'')+'.webp';
 async function list(){
  const extra=await db.prepare("SELECT html FROM article_publications WHERE state='published' UNION ALL SELECT html FROM article_translations WHERE state='published'").all().catch(()=>({results:[]}));
  for(const row of extra.results)for(const match of (row.html||'').matchAll(/(?:src|href)=["'](\/[^"'?#]+\.(?:webp|png|jpe?g|svg|avif|ico))["']/gi)){const asset=family(match[1]);if(!catalog.has(asset))catalog.set(asset,{asset,pages:[],title:path.basename(asset)});}
  const versions=(await db.prepare('SELECT * FROM media_versions ORDER BY created_at DESC').all()).results;
  const states=(await db.prepare('SELECT * FROM media_active').all()).results;
  return {items:[...catalog.values()].map(item=>({...item,inline:undefined,versions:versions.filter(v=>v.asset===item.asset).map(v=>({...v,url:url(v.id)})),states:states.filter(s=>s.asset===item.asset)}))};
 }
 async function handle(request,action){
  if(request.method==='GET'&&action==='media-list')return json(await list());
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Forbidden'},403);
  try{
   await list();
   const upload=action==='media-upload';
   const form=upload?await request.formData():await request.json();
   const get=k=>upload?form.get(k):form[k];
   const asset=family(String(get('asset')||'')),scope=String(get('scope')||'*');
   const item=catalog.get(asset);if(!item)throw Error('请选择图片目录中的图片');
   const [scopePage,scopeLocale]=scope.split('|');if(scope.split('|').length>2||(scopeLocale&&!['en','de','es','fr','it','zh'].includes(scopeLocale)))throw Error('语言设置无效');
   if(scopePage!=='*'&&!item.pages.some(p=>basePage(p.path)===scopePage))throw Error('请选择对应的页面');
   const previous=await db.prepare('SELECT revision FROM media_active WHERE asset=? AND scope=?').bind(asset,scope).first();
   const revision=Number(get('revision')||0);if((previous?.revision||0)!==revision)return json({error:'图片已被其他操作修改，请刷新后重试'},409);
   let id=null;
   if(upload){
    const file=get('file');if(!file||typeof file.arrayBuffer!=='function'||file.size>20*1024*1024)throw Error('请上传不超过20MB的图片');
    const input=Buffer.from(await file.arrayBuffer());
    const image=sharp(input,{limitInputPixels:40000000,animated:false});const meta=await image.metadata();
    if(!['jpeg','png','webp','avif','heif','tiff','gif','svg'].includes(meta.format))throw Error('图片格式无法转换，请使用JPG、PNG、WebP、AVIF或SVG');
    const fit=get('fit')==='cover'?'cover':'inside';
    const position=['centre','north','south','east','west'].includes(get('position'))?get('position'):'centre';
    let target={};if(fit==='cover'){const original=await sharp(item.inline?Buffer.from(item.inline[0]):path.join(publicRoot,asset)).metadata();target={width:Math.min(original.width||1600,2400),height:Math.min(original.height||1200,2400),fit:'cover',position};}else target={width:2400,height:2400,fit:'inside',withoutEnlargement:true};
    const large=await image.rotate().resize(target).webp({quality:88}).toBuffer({resolveWithObject:true});
    const small=await sharp(large.data).resize({width:640,withoutEnlargement:true}).webp({quality:84}).toBuffer();
    id=randomUUID();await fs.writeFile(path.join(directory,id+'.webp'),large.data,{flag:'wx'});await fs.writeFile(path.join(directory,id+'-small.webp'),small,{flag:'wx'});
    await db.prepare('INSERT INTO media_versions VALUES (?,?,?,?,?,?,?,?)').bind(id,asset,scope,new Date().toISOString(),large.info.width,large.info.height,String(get('alt')||'').slice(0,500),fit).run();
   }else if(action==='media-restore'){
    id=get('version')||null;
    if(id&&!await db.prepare('SELECT id FROM media_versions WHERE id=? AND asset=?').bind(id,asset).first())throw Error('历史图片不存在');
   }else return json({error:'Unknown action'},404);
   const result=await db.prepare('INSERT INTO media_active(asset,scope,version,revision) VALUES (?,?,?,1) ON CONFLICT(asset,scope) DO UPDATE SET version=excluded.version,revision=media_active.revision+1 WHERE media_active.revision=?').bind(asset,scope,id,revision).run();
   if(!result.meta.changes)return json({error:'图片已被其他操作修改，请刷新后重试'},409);
   return json({ok:true});
  }catch(error){return json({error:error.message||'图片处理失败'},400);}
 }
 async function serve(request){
  const pathname=new URL(request.url).pathname;
  const global=(await active()).find(s=>s.asset===family(pathname)&&s.scope==='*');if(global)return new Response(null,{status:302,headers:{Location:url(global.version,pathname!==family(pathname)),'Cache-Control':'no-cache'}});
  const source=catalog.get(pathname);if(source?.inline)return new Response(source.inline[0],{headers:{'Content-Type':'image/svg+xml','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'",'Cache-Control':'no-cache'}});
  const match=pathname.match(/^\/media\/([a-f0-9-]{36})(-small)?\.webp$/);if(!match)return null;
  try{const bytes=await fs.readFile(path.join(directory,match[1]+(match[2]||'')+'.webp'));return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':'image/webp','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Not found',{status:404});}
 }
 async function transform(response,pathname){
  if(response.status!==200||!response.headers.get('Content-Type')?.includes('text/html')||pathname.startsWith('/admin')||pathname.startsWith('/api')||pathname.startsWith('/auth'))return response;
  const states=await active();if(!states.length)return response;
  const selected=new Map();const locale=pathname.match(/^\/(de|es|fr|it|zh)(?=\/)/)?.[1]||'en';for(const scope of ['*','*|'+locale,basePage(pathname),basePage(pathname)+'|'+locale])for(const state of states)if(state.scope===scope)selected.set(state.asset,state);
  let html=await response.text();
  for(const [asset,state]of selected){const item=catalog.get(asset);if(item?.inline){for(const svg of item.inline)html=html.replaceAll(svg,'<img src="'+url(state.version)+'" alt="'+String(state.alt||item.title).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;')+'">');}const variants=[asset,asset.replace(/(\.[^.]+)$/,'-small$1')];for(const source of variants){const escaped=source.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');html=html.replace(new RegExp(escaped+'(?=["\\\'\\s,)<?#]|$)','g'),url(state.version,source!==asset));}}
  // Preserve translated alternative text unless the administrator supplied a replacement.
  html=html.replace(/<img\b[^>]*>/gi,tag=>{const state=[...selected.values()].find(s=>tag.includes(url(s.version))||tag.includes(url(s.version,true)));if(!state)return tag;tag=tag.replace(/\s(?:width|height)=["'][^"']*["']/gi,'');tag=tag.replace(/<img\b/i,'<img width="'+state.width+'" height="'+state.height+'"');if(state.alt){const alt=state.alt.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');tag=tag.replace(/\salt=["'][^"']*["']/i,'') .replace(/<img\b/i,'<img alt="'+alt+'"');}return tag;});
  const headers=new Headers(response.headers);headers.delete('Content-Length');headers.set('Cache-Control','no-cache');return new Response(html,{status:response.status,headers});
 }
 return {handle,serve,transform};
}
