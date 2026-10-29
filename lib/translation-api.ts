import {env} from 'cloudflare:workers';
import {seedArticles,validate,renderArticle,type Article} from './editorial-api';
import dictionaries from './i18n/dictionaries.json';
import {knownLocale,translate,localePath} from './i18n/runtime';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
export async function sourceArticle(slug:string){const row=await env.DB!.prepare('SELECT payload FROM article_drafts WHERE slug=?').bind(slug).first<{payload:string}>();return row?JSON.parse(row.payload) as Article:seedArticles.find(a=>a.slug===slug);}
export async function fingerprint(article:Article){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(article))));return Array.from(bytes).map(n=>n.toString(16).padStart(2,'0')).join('');}
export function translatedSeed(article:Article,locale:string):Article{const t=(s:string)=>translate(s,locale);return {...article,title:t(article.title),description:t(article.intro).slice(0,320),category:t(article.category),intro:t(article.intro),sections:article.sections.map(([h,b])=>[t(h),t(b)]),checklist:article.checklist.map(t),example:t(article.example),sources:article.sources?.map(([n,u])=>[t(n),u])};}
export async function translationAPI(request:Request,action:string){try{
 if(!env.DB)return json({error:'Database unavailable'},503);const url=new URL(request.url);
 const input=request.method==='GET'?null:await request.json() as {slug:string;locale:string;article:Article;revision:number;sourceFingerprint:string};
 const slug=String(input?.slug??url.searchParams.get('slug')??''),locale=knownLocale(input?.locale??url.searchParams.get('locale'));
 if(!/^[a-z0-9-]{1,120}$/.test(slug)||locale==='en')return json({error:'请选择文章及翻译语言'},400);
 const source=await sourceArticle(slug);if(!source)return json({error:'Article not found'},404);const currentFingerprint=await fingerprint(source);
 const row=await env.DB.prepare('SELECT * FROM article_translations WHERE slug=? AND locale=?').bind(slug,locale).first<{payload:string;revision:number;published_revision:number;source_fingerprint:string;state:string;html:string;updated_at:string}>();
 if(action==='article-translations'&&request.method==='GET')return json({article:row?JSON.parse(row.payload):translatedSeed(source,locale),revision:row?.revision??0,sourceFingerprint:currentFingerprint,needsSync:!!row&&row.source_fingerprint!==currentFingerprint,state:row?.state??(seedArticles.some(a=>a.slug===slug)?'baseline':'untranslated'),publishedRevision:row?.published_revision??0});
 if(action==='article-translation-preview'&&request.method==='GET'){const article=row?JSON.parse(row.payload):translatedSeed(source,locale);return new Response(renderArticle(article,new Date().toISOString(),true,locale,[locale]),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow'}});}
 if(!input||input.sourceFingerprint!==currentFingerprint)return json({error:'英文原文已更新，请重新加载并核对译文'},409);
 if(!Number.isInteger(input.revision)||input.revision<0||input.revision!==(row?.revision??0))return json({error:'译文已被其他操作修改，请重新加载'},409);
 const now=new Date().toISOString();
 if(action==='article-translation-save'&&request.method==='POST'){
  const article=validate(input.article);if(article.slug!==slug)return json({error:'译文必须关联同一篇原文'},400);
  const result=row?await env.DB.prepare('UPDATE article_translations SET payload=?,revision=revision+1,source_fingerprint=?,updated_at=? WHERE slug=? AND locale=? AND revision=?').bind(JSON.stringify(article),currentFingerprint,now,slug,locale,input.revision).run():await env.DB.prepare('INSERT INTO article_translations (slug,locale,payload,source_fingerprint,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(slug,locale) DO NOTHING').bind(slug,locale,JSON.stringify(article),currentFingerprint,now).run();return result.meta.changes?json({saved:true,revision:input.revision+1}):json({error:'译文已变更，请重新加载'},409);
 }
 if(['article-translation-publish','article-translation-withdraw'].includes(action)&&request.method==='POST'){
  if(action==='article-translation-publish'&&row?.source_fingerprint!==currentFingerprint)return json({error:'原文已变化，请核对并保存译文后再发布'},409);
  if(!row)return json({error:'请先保存译文草稿'},400);const published=action==='article-translation-publish';const article=validate(JSON.parse(row.payload));const html=published?renderArticle(article,now,false,locale,[locale]):'';
  if(published&&article.title===source.title&&article.intro===source.intro)return json({error:'请完成该语言的标题和正文翻译后发布'},400);
  const result=await env.DB.prepare('UPDATE article_translations SET state=?,html=?,published_revision=?,published_at=?,updated_at=? WHERE slug=? AND locale=? AND revision=?').bind(published?'published':'withdrawn',html,published?row.revision:0,now,now,slug,locale,row.revision).run();return result.meta.changes?json({saved:true,url:localePath('/blog/'+slug+'/',locale)}):json({error:'译文已变更'},409);
 }
 return json({error:'Unsupported operation'},405);
}catch(error){return json({error:error instanceof Error?error.message:'译文操作失败'},400);}}
