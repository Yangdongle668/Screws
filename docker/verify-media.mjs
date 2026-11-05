import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {openDatabase} from './storage.mjs';
import {createMediaService} from './media-service.mjs';
const data=await fs.mkdtemp(path.join(os.tmpdir(),'zufek-media-'));
const db=openDatabase(path.join(data,'test.sqlite'),'drizzle');
const index=[{asset:'/images/shoulder-screws.webp',title:'Shoulder screws',pages:[{path:'/products/shoulder-screws/',title:'Shoulder screws'}]}];
const options={db,data,publicRoot:path.resolve('public'),index};let media=await createMediaService(options);
async function upload(scope='*',revision=0){const form=new FormData();form.append('asset',index[0].asset);form.append('scope',scope);form.append('revision',String(revision));form.append('alt','Test & <image>');form.append('file',new Blob([await sharp({create:{width:100,height:80,channels:4,background:'#ff000080'}}).png().toBuffer()],{type:'image/png'}),'test.png');return media.handle(new Request('http://localhost/api/admin/media-upload',{method:'POST',headers:{Origin:'http://localhost'},body:form}),'media-upload');}
try{
 assert.equal((await upload()).status,200);
 let list=await (await media.handle(new Request('http://localhost/api/admin/media-list'),'media-list')).json();const id=list.items[0].states[0].version;
 const request=new Request('http://localhost/media/'+id+'.webp');let response=await media.serve(request);assert.equal(response.headers.get('Content-Type'),'image/webp');const metadata=await sharp(Buffer.from(await response.arrayBuffer())).metadata();assert.equal(metadata.format,'webp');assert.equal(metadata.hasAlpha,true);
 const html='<img src="/images/shoulder-screws.webp" srcset="/images/shoulder-screws-small.webp 640w" alt="old" width="100" height="80"><script type="application/ld+json">{"image":"https://zufek.net/images/shoulder-screws.webp"}</script>';
 const render=async(p)=>await (await media.transform(new Response(html,{headers:{'Content-Type':'text/html'}}),p)).text();assert.match(await render('/fr/products/shoulder-screws/'),new RegExp(id));assert.match(await render('/products/shoulder-screws/'),/-small.webp/);
 assert.equal((await upload()).status,409);
 assert.equal((await upload('*|fr')).status,200);const frenchList=await(await media.handle(new Request('http://localhost/api/admin/media-list'),'media-list')).json();const french=frenchList.items[0].states.find(x=>x.scope==='*|fr').version;assert.match(await render('/fr/products/shoulder-screws/'),new RegExp(french));assert.match(await render('/de/products/shoulder-screws/'),new RegExp(id));
 assert.equal((await upload('/products/shoulder-screws/')).status,200);
 list=await (await media.handle(new Request('http://localhost/api/admin/media-list'),'media-list')).json();const scoped=list.items[0].states.find(x=>x.scope==='/products/shoulder-screws/').version;assert.match(await render('/zh/products/shoulder-screws/'),new RegExp(scoped));assert.match(await render('/'),new RegExp(id));
 media=await createMediaService(options);assert.equal((await media.serve(request)).status,200);
 const restore=await media.handle(new Request('http://localhost/api/admin/media-restore',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify({asset:index[0].asset,scope:'*',revision:1,version:null})}),'media-restore');assert.equal(restore.status,200);assert.match(await render('/'),/\/images\/shoulder-screws.webp/);
 const forbidden=await media.handle(new Request('http://localhost/api/admin/media-restore',{method:'POST',headers:{Origin:'http://other'}}),'media-restore');assert.equal(forbidden.status,403);
 console.log('PASS WebP alpha, thumbnails, schema, locale scope, restore, concurrency, persistent restart, CSRF');
}finally{db.close();await fs.rm(data,{recursive:true,force:true});}
