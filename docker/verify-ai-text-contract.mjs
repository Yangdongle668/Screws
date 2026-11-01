import assert from 'node:assert/strict';
import {parseTextContract} from './ai-text-contract.mjs';
export function fixedFields(value){const lines=['ZUFEK_FIELDS_V1'];function walk(v,path){const type=v===null?'null':Array.isArray(v)?'array':typeof v;lines.push('@@FIELD '+type+' '+path);if(!['object','array','null'].includes(type))lines.push(String(v));lines.push('@@END');if(v&&typeof v==='object')for(const [k,x]of Object.entries(v))walk(x,(path==='/'?'':path)+'/'+k.replaceAll('~','~0').replaceAll('/','~1'));}walk(value,'/');lines.push('ZUFEK_FIELDS_END');return lines.join('\n');}
const article={status:'READY_FOR_REVIEW',article:{intro:'Use "g6" and \u2300.\n\nKeep C:\\drawings unchanged.',sections:[['Bearing face','Paragraph one.\n\nParagraph two with "quotes".']],checklist:[],sources:[]},ok:true,n:2,empty:null};
assert.deepEqual(parseTextContract(fixedFields(article)),article);
assert.throws(()=>parseTextContract(fixedFields(article).replace('ZUFEK_FIELDS_END','')));
assert.throws(()=>parseTextContract('ZUFEK_FIELDS_V1\n@@FIELD object /\n@@END\n@@FIELD string /__proto__\nx\n@@END\nZUFEK_FIELDS_END'));
assert.throws(()=>parseTextContract(fixedFields(article).replace('/article/sections/0','/article/sections/2')));
console.log(JSON.stringify({fixedTextRoundTrip:true,paragraphsAndQuotesPreserved:true,truncationRejected:true,unsafePathsRejected:true}));
