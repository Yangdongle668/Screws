import fs from 'node:fs';
import path from 'node:path';
import {locales,localePath,localizeHtml,collectStrings} from '../lib/i18n/core.mjs';
export function generateLanguages(pages,origin){
 const base=Object.entries(pages).filter(([url])=>url!=='/admin/');const paths=new Set(base.map(([url])=>url));
 const dictionaries=Object.fromEntries(locales.filter(l=>l!=='en').map(l=>[l,JSON.parse(fs.readFileSync('translations/'+l+'.json','utf8'))]));
 const clientSource=JSON.parse(fs.readFileSync('translations/client-source.json','utf8'));const ui={en:Object.fromEntries(clientSource.map(s=>[s,s]))};for(const l of locales.filter(l=>l!=='en'))ui[l]=Object.fromEntries(clientSource.map(s=>{if(dictionaries[l][s]===undefined)throw Error('Missing UI translation '+l+': '+s);return [s,dictionaries[l][s]];}));
 const routeMap={};for(const [url]of base)routeMap[url]=Object.fromEntries(locales.map(l=>[l,localePath(url,l)]));
 for(const [url,html]of base)for(const locale of locales){let translated=localizeHtml(html,{locale,base:url,origin,dictionary:dictionaries[locale],paths,strict:true});
  translated=translated.replace('</head>','<script id="locale-ui" type="application/json">'+JSON.stringify({locale,messages:ui[locale]}).replaceAll('<','\\u003c')+'</script></head>');
  if(url==='/request-a-quote/')translated=translated.replace('<form id="quote-form"','<form data-locale="'+locale+'" id="quote-form"');
  const localized=localePath(url,locale);pages[localized]=translated;const output=path.join('static-site',localized,'index.html');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,translated);
 }
 fs.writeFileSync('lib/i18n/routes.json',JSON.stringify(routeMap));fs.writeFileSync('lib/i18n/ui.json',JSON.stringify(ui));
 fs.writeFileSync('lib/runtime-pages.json',JSON.stringify(Object.fromEntries(Object.entries(pages).filter(([url])=>!/^\/(de|es|it|zh|fr)\//.test(url)))));
 fs.writeFileSync('lib/i18n/indexable.json',JSON.stringify(Object.entries(pages).filter(([,html])=>html.includes('content="index,follow"')).map(([url])=>url)));
 // Only content data needed by the runtime editor is included in the bundle.
 fs.writeFileSync('lib/i18n/dictionaries.json',JSON.stringify(dictionaries));
 return {routeMap,locales};
}
