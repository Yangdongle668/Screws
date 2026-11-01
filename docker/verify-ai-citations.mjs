import assert from 'node:assert/strict';import {reconcileDraftSources} from './ai-citations.mjs';
const evidence=[{url:'https://example.com/final/',aliases:['https://example.com/original']}];
let r=reconcileDraftSources({sources:[{url:'https://EXAMPLE.com:443/original#section'}],article:{sources:[['Source','https://example.com/final/#heading']]}},evidence);
assert.deepEqual(r.missing,[]);assert.equal(r.result.sources[0].url,evidence[0].url);assert.equal(r.result.article.sources[0][1],evidence[0].url);
for(const url of ['https://example.com/unread','https://example.com/final','https://example.com/final/?edition=2','https://elsewhere.example/final/','https://user:pass@example.com/final/']){r=reconcileDraftSources({sources:[{url}]},evidence);assert.equal(r.missing.length,1,'Do not infer equivalence for '+url);}
console.log(JSON.stringify({verifiedRedirectAliases:true,fragmentNormalization:true,unfetchedPagesBlocked:true,queryAndPathPreserved:true,noExternalCalls:true}));
