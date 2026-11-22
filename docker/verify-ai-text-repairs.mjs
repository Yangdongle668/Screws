import assert from 'node:assert/strict';
import {parseTextContract} from './ai-text-contract.mjs';
const field=(type,pointer,body)=>['@@FIELD '+type+' '+pointer,...(body===undefined?[]:[body]),'@@END'];
const doc=(...fields)=>['ZUFEK_FIELDS_V1',...field('object','/'),field('string','/status','READY_FOR_REVIEW'),...fields,'ZUFEK_FIELDS_END'].flat().join('\n');
const parse=raw=>{const repairs=[];const value=parseTextContract(raw,{onDuplicate:d=>repairs.push(d.action)});return {value,repairs};};
// The production case: /article/relatedLinks/0 declared as an array, then named fields follow.
const prod=parse(doc(field('object','/article'),field('array','/article/relatedLinks'),field('array','/article/relatedLinks/0'),field('string','/article/relatedLinks/0/path','/products/set-screws/'),field('string','/article/relatedLinks/0/label','Tornillos prisioneros')));
assert.deepEqual(prod.value.article.relatedLinks,[{path:'/products/set-screws/',label:'Tornillos prisioneros'}]);assert(prod.repairs.includes('container_type_corrected'));
// A skipped array index is compacted.
const skipped=parse(doc(field('array','/items'),field('string','/items/0','a'),field('string','/items/2','b')));
assert.deepEqual(skipped.value.items,['a','b']);assert(skipped.repairs.includes('array_index_compacted'));
// A missing intermediate container is created.
const missing=parse(doc(field('object','/article'),field('array','/article/relatedLinks'),field('string','/article/relatedLinks/0/path','/x/'),field('string','/article/relatedLinks/0/label','X')));
assert.deepEqual(missing.value.article.relatedLinks,[{path:'/x/',label:'X'}]);assert(missing.repairs.includes('missing_container_created'));
// Real conflicts are still errors: a repeated index and a repeated field.
assert.throws(()=>parse(doc(field('array','/items'),field('string','/items/0','a'),field('string','/items/0','b'))));
assert.throws(()=>parse(doc(field('object','/a'),field('string','/a/x','1'),field('object','/a/x'))));
// A filled container is never re-typed.
assert.throws(()=>parse(doc(field('array','/items'),field('string','/items/0','a'),field('string','/items/name','b'))));
console.log(JSON.stringify({containerTypeCorrected:true,indexCompacted:true,missingContainerCreated:true,conflictsStillRejected:true}));
