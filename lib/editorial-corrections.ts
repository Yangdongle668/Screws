import {env} from 'cloudflare:workers';
import {validate,renderArticle,type Article} from './editorial-api';
import {translatedSeed,fingerprint} from './translation-api';
import {assertArticleTranslation} from './translation-contract.mjs';
import {translate} from './i18n/runtime';
import packages from './editorial-corrections.json';

export async function correctionFingerprint(html:string){
 const header=html.match(/<header class="article-heading">([\s\S]*?)<\/header>/)?.[1]||'';
 const parts=[header.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]||'',header.match(/<p>([\s\S]*?)<\/p>/)?.[1]||'',...[...html.matchAll(/<section id="section-\d+">[\s\S]*?<\/section>/g)].map(m=>m[0])];
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(parts.map(s=>s.replace(/\s+/g,' ').trim()).join('\n'))))].map(n=>n.toString(16).padStart(2,'0')).join('');
}
type Correction={id:string;slug:string;expectedFingerprint:string;article:Article};
type Publication={slug:string;html:string;metadata:string;state:string;published_at:string};
type Translation={locale:string;payload:string;revision:number;published_revision:number;state:string;html:string;source_fingerprint:string;published_at:string};
export async function applyEditorialCorrections(corrections:Correction[]=packages as Correction[]){
 const db=env.DB!;await db.prepare('CREATE TABLE IF NOT EXISTS editorial_corrections(id TEXT PRIMARY KEY,slug TEXT NOT NULL,status TEXT NOT NULL,detail TEXT NOT NULL,updated_at TEXT NOT NULL)').run();
 const results=[];
 for(const pack of corrections){
  const logged=await db.prepare('SELECT status FROM editorial_corrections WHERE id=?').bind(pack.id).first<{status:string}>();if(logged?.status==='applied'){results.push({id:pack.id,status:'already_applied'});continue;}
  const pub=await db.prepare("SELECT * FROM article_publications WHERE slug=? AND state='published'").bind(pack.slug).first<Publication>();if(!pub){results.push({id:pack.id,status:'not_present'});continue;}
  const draft=await db.prepare('SELECT payload,revision,published_revision FROM article_drafts WHERE slug=?').bind(pack.slug).first<{payload:string;revision:number;published_revision:number}>();
  const oldTranslations=(await db.prepare('SELECT * FROM article_translations WHERE slug=?').bind(pack.slug).all<Translation>()).results;
  const matches=await correctionFingerprint(pub.html)===pack.expectedFingerprint;
  const untouched=draft&&draft.revision===draft.published_revision&&JSON.stringify(validate(JSON.parse(draft.payload)))===JSON.stringify(validate(JSON.parse(pub.metadata)))&&oldTranslations.every(t=>t.revision===t.published_revision&&t.state==='published');
  if(!matches||!untouched){const detail=!matches?'线上内容与已核对版本不同，保留当前文章，请人工比对校订稿。':'存在未发布的人工修改或译稿，保留当前版本，请先处理草稿。';await db.prepare("INSERT INTO editorial_corrections VALUES(?,?,'needs_review',?,?) ON CONFLICT(id) DO UPDATE SET status='needs_review',detail=excluded.detail,updated_at=excluded.updated_at").bind(pack.id,pack.slug,detail,new Date().toISOString()).run();results.push({id:pack.id,status:'needs_review',detail});continue;}
  const now=new Date().toISOString(),locales=['de','es','it','zh','fr'],a=validate({...pack.article,publicationOrigin:'manual',schemaContent:{type:'BlogPosting',topics:pack.article.keywords||[]},social:{title:pack.article.metaTitle||pack.article.title,description:pack.article.description}}),source=await fingerprint(a);
  const translations=locales.map(locale=>{const t=(s:string)=>translate(s,locale),translated=validate({...translatedSeed(a,locale),description:t(a.description),social:{title:t(a.metaTitle||a.title),description:t(a.description)},schemaContent:{type:'BlogPosting',topics:(a.keywords||[]).map(t)}});assertArticleTranslation(a,translated);if(translated.title===a.title||translated.intro===a.intro||translated.sections.some(([h,b],i)=>h===a.sections[i][0]||b===a.sections[i][1]))throw Error('校订包译文不完整，未发布：'+locale);return {locale,article:translated};});
  const oldArticle=JSON.parse(pub.metadata),releaseId=crypto.randomUUID(),snapshot={article:oldArticle,html:pub.html,state:pub.state,publishedAt:pub.published_at,translations:oldTranslations.map(t=>({locale:t.locale,article:JSON.parse(t.payload),html:t.html,state:t.state,publishedAt:t.published_at}))};
  await db.prepare('CREATE TABLE IF NOT EXISTS article_release_history(id TEXT PRIMARY KEY,slug TEXT NOT NULL,snapshot TEXT NOT NULL,created_at TEXT NOT NULL,created_by TEXT)').run();
  const first=pub.html.match(/"datePublished":"([^"]+)"/)?.[1],revision=draft!.revision+1;
  const statements=[
   db.prepare("INSERT INTO article_versions(id,slug,payload,created_at,created_by) SELECT 'guard/'||?,NULL,'{}',?,'correction-conflict' WHERE NOT EXISTS(SELECT 1 FROM article_drafts WHERE slug=? AND revision=? AND published_revision=? AND payload=?)").bind(pack.slug,now,pack.slug,draft!.revision,draft!.published_revision,draft!.payload),
   db.prepare("INSERT INTO article_versions(id,slug,payload,created_at,created_by) SELECT 'guard/'||?,NULL,'{}',?,'correction-conflict' WHERE NOT EXISTS(SELECT 1 FROM article_publications WHERE slug=? AND html=? AND state='published')").bind(pack.slug,now,pack.slug,pub.html),
   db.prepare('INSERT INTO article_release_history VALUES(?,?,?,?,?)').bind(releaseId,pack.slug,JSON.stringify(snapshot),now,'editorial-correction'),
   db.prepare('UPDATE article_drafts SET payload=?,revision=?,published_revision=?,updated_at=?,updated_by=? WHERE slug=?').bind(JSON.stringify(a),revision,revision,now,'editorial-correction',pack.slug),
   db.prepare("UPDATE article_publications SET html=?,metadata=?,published_at=? WHERE slug=?").bind(renderArticle(a,now,false,'en',['en',...locales],first),JSON.stringify(a),now,pack.slug)
  ];
  for(const locale of locales){const t=oldTranslations.find(r=>r.locale===locale);statements.unshift(t?db.prepare("INSERT INTO article_versions(id,slug,payload,created_at,created_by) SELECT 'guard/'||?,NULL,'{}',?,'correction-translation-conflict' WHERE NOT EXISTS(SELECT 1 FROM article_translations WHERE slug=? AND locale=? AND revision=? AND published_revision=? AND state=? AND html=? AND payload=? AND source_fingerprint=?)").bind(pack.slug,now,pack.slug,locale,t.revision,t.published_revision,t.state,t.html,t.payload,t.source_fingerprint):db.prepare("INSERT INTO article_versions(id,slug,payload,created_at,created_by) SELECT 'guard/'||?,NULL,'{}',?,'correction-translation-conflict' WHERE EXISTS(SELECT 1 FROM article_translations WHERE slug=? AND locale=?)").bind(pack.slug,now,pack.slug,locale));}
  for(const {locale,article}of translations){const old=oldTranslations.find(t=>t.locale===locale),next=(old?.revision||0)+1,date=old?.html?.match(/"datePublished":"([^"]+)"/)?.[1]||(!old?now:first);statements.push(db.prepare("INSERT INTO article_translations(slug,locale,payload,revision,published_revision,source_fingerprint,state,html,updated_at,published_at) VALUES(?,?,?,?,?,?,'published',?,?,?) ON CONFLICT(slug,locale) DO UPDATE SET payload=excluded.payload,revision=excluded.revision,published_revision=excluded.published_revision,source_fingerprint=excluded.source_fingerprint,state='published',html=excluded.html,updated_at=excluded.updated_at,published_at=excluded.published_at").bind(pack.slug,locale,JSON.stringify(article),next,next,source,renderArticle(article,now,false,locale,['en',...locales],date),now,now));}
  statements.push(db.prepare('INSERT INTO article_versions VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),pack.slug,JSON.stringify(a),now,'editorial-correction'),db.prepare("INSERT INTO editorial_corrections VALUES(?,?,'applied',?,?) ON CONFLICT(id) DO UPDATE SET status='applied',detail=excluded.detail,updated_at=excluded.updated_at").bind(pack.id,pack.slug,JSON.stringify({releaseId,revision,locales:['en',...locales]}),now));
  await db.batch(statements);results.push({id:pack.id,status:'applied',releaseId});
 }
 return results;
}
