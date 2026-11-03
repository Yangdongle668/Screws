import assert from 'node:assert/strict';
import {requestCrawlHints} from '../lib/seo/request-hints.mjs';
for(const prefix of ['','/de','/es','/it','/zh','/fr']){
 const path=prefix+'/request-a-quote/';
 const html=`<html><head><link rel="canonical" href="https://zufek.net${path}"><link rel="alternate" hreflang="en" href="https://zufek.net/request-a-quote/"><meta name="robots" content="index,follow"></head><body><a hreflang="de" href="/de/request-a-quote/">Deutsch</a><select id="product"></select></body></html>`;
 assert.equal(requestCrawlHints(html,'https://zufek.net'+path),html);
 const result=requestCrawlHints(html,'https://zufek.net'+path+'?product=shoulder-screws');
 assert(!result.split('</head>')[0].includes('hreflang'));
 assert(result.includes('href="https://zufek.net'+path+'"'));
 assert(result.includes('<a hreflang="de"'));
 assert(result.includes('<select id="product">'));
 assert(result.includes('index,follow'));
 assert.equal(requestCrawlHints(html,'https://zufek.net'+prefix+'/products/shoulder-screws/?product=test'),html);
}
console.log('RFQ parameters preserve the canonical, form and language menu; only canonical form pages declare hreflang.');
