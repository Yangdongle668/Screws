import dictionaries from './dictionaries.json';
import ui from './ui.json';
import routes from './routes.json';
import config from '../site-config.json';
import {splitLocale,localePath,localizeHtml,locales,languageLinks,languages,languageMenu} from './core.mjs';
export {splitLocale,localePath,locales,languageLinks,languages};
export const knownLocale=(value:unknown)=>typeof value==='string'&&locales.includes(value)?value:'en';
export const baselineExists=(base:string,locale:string)=>!!(routes as Record<string,Record<string,string>>)[base]?.[locale];
export const publicPaths=new Set(Object.values(routes).flatMap(row=>Object.values(row)).filter(path=>!path.endsWith('/404/')));
export const translate=(key:string,locale='en',values:Record<string,string|number>={})=>{const dictionary=(dictionaries as Record<string,Record<string,string>>)[locale];let value=dictionary?.[key]??key;for(const [k,v]of Object.entries(values))value=value.replaceAll('{'+k+'}',String(v));return value;};
export function updateLanguageLinks(html:string,base:string,locale:string,available:string[]){return html.replace(/<link rel="alternate"[^>]*>/g,'').replace('</head>',languageLinks(base,config.origin,available)+'</head>').replace(/<nav class="language-switcher"[\s\S]*?<\/nav>/,languageMenu(base,locale,available));}
export function localizedArticleHtml(html:string,base:string,locale:string,available:string[]){
 const paths=new Set(Object.keys(routes));paths.add(base);
 let localized=localizeHtml(html,{locale,base,origin:config.origin,dictionary:(dictionaries as Record<string,Record<string,string>>)[locale]??{},paths,available,strict:false});
 localized=localized.replace(/<script id="locale-ui"[\s\S]*?<\/script>/g,'').replace('</head>','<script id="locale-ui" type="application/json">'+JSON.stringify({locale,messages:(ui as Record<string,Record<string,string>>)[locale]??{}}).replaceAll('<','\\u003c')+'</script></head>');
 return localized;
}
