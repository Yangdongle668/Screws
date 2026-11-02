import {articlePath} from './article-path.mjs';
import {assertArticleTranslation} from './translation-contract.mjs';
export const publicationLocales=['de','es','it','zh','fr'];
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
export const articleContentKey=a=>{const {sourceJobId,publicationOrigin,...rest}=a;return JSON.stringify(canonical({...rest,path:articlePath(a)}));};
const digest=async a=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(a))))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function inspectPublishedArticle(db,expected,normalize=x=>x){
 const row=await db.prepare('SELECT state,metadata,html FROM article_publications WHERE slug=?').bind(expected.slug).first();
 let source=null,matches=false,fingerprint=null;try{source=JSON.parse(row?.metadata||'null');if(source){fingerprint=await digest(source);const a=normalize(source),b=normalize(expected);matches=articleContentKey(a)===articleContentKey(b)&&(!a.sourceJobId||!b.sourceJobId||a.sourceJobId===b.sourceJobId);}}catch{}
 const english={published:row?.state==='published'&&!!row.html,matchesApproved:matches};
 const records=(await db.prepare('SELECT * FROM article_translations WHERE slug=?').bind(expected.slug).all()).results;
 const languages=publicationLocales.map(locale=>{const r=records.find(x=>x.locale===locale);let valid=false;try{if(source&&r?.state==='published'&&r.html&&r.published_revision===r.revision&&r.source_fingerprint===fingerprint){assertArticleTranslation(normalize(source),normalize(JSON.parse(r.payload)));valid=true;}}catch{}return {locale,published:r?.state==='published'&&!!r.html,matchesApproved:!!english.published&&matches&&valid,revision:r?.published_revision||0};});
 return {english,languages,complete:!!english.published&&matches&&languages.every(x=>x.matchesApproved)};
}
