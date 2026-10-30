import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {localizeHtml} from '../lib/i18n/core.mjs';
const pages=JSON.parse(fs.readFileSync('lib/generated-pages.json','utf8'));
for(const [url,html]of Object.entries(pages)){if(url==='/admin/')continue;assert(/class="topbar-tools">[\s\S]*?mailto:info@zufek.net[\s\S]*?class="language-switcher"[\s\S]*?<\/nav><\/div><\/div><header/.test(html),url+' topbar language placement');assert.equal((html.match(/class="language-flag"/g)||[]).length,7);}
const twice=localizeHtml(pages['/'],{locale:'en',base:'/',origin:'https://example.invalid',paths:new Set(Object.keys(pages)),dictionary:{},strict:false});assert.equal((twice.match(/class="language-switcher"/g)||[]).length,1);
const script=fs.readFileSync('public/i18n.js','utf8');
function run({locale='en',languages=['de-DE'],stored='',visited=false,referrer='',blocked=false}={}){const values=new Map([['zufek_language',stored]]),session=new Map(visited?[['zufek_language_visit','1']]:[]),links=['en','de','es','it','zh','fr'].map(l=>({dataset:{language:l},href:'https://example.invalid/'+(l==='en'?'':l+'/')+'products/',addEventListener(name,fn){this[name]=fn;}}));let redirect;const details={open:false},menu={querySelector:()=>details,querySelectorAll:()=>links,contains:()=>true};const storage=map=>({getItem:k=>{if(blocked)throw Error();return map.get(k);},setItem:(k,v)=>{if(blocked)throw Error();map.set(k,v);}});vm.runInNewContext(script,{URL,window:{},document:{referrer,getElementById:()=>({textContent:JSON.stringify({locale,messages:{}})}),querySelector:()=>menu,querySelectorAll:()=>[],addEventListener(){}},location:{origin:'https://example.invalid',search:'?product=test',hash:'#spec',replace:url=>redirect=url},navigator:{languages,language:languages[0],userAgent:'Mozilla'},localStorage:storage(values),sessionStorage:storage(session)});return {redirect,links,values};}
assert.equal(run().redirect,'https://example.invalid/de/products/?product=test#spec');
assert.equal(run({languages:['pt-BR','fr-CA']}).redirect,'https://example.invalid/fr/products/?product=test#spec');
assert.equal(run({languages:['zh-CN']}).redirect,'https://example.invalid/zh/products/?product=test#spec');
assert.equal(run({stored:'it'}).redirect,'https://example.invalid/it/products/?product=test#spec');
for(const options of [{locale:'es'},{visited:true},{referrer:'https://example.invalid/about/'},{languages:['ja']}])assert.equal(run(options).redirect,undefined);
assert(run({blocked:true}).redirect);const manual=run();manual.links[4].click();assert.equal(manual.values.get('zufek_language'),'zh');
console.log('Language preference: topbar placement, flags, browser matching, manual priority, stable localized URLs, query/hash and blocked storage passed.');
