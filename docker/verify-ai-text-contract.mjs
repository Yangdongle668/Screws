import assert from 'node:assert/strict';
import {parseTextContract} from './ai-text-contract.mjs';
export function fixedFields(value){const lines=['ZUFEK_FIELDS_V1'];function walk(v,path){const type=v===null?'null':Array.isArray(v)?'array':typeof v;lines.push('@@FIELD '+type+' '+path);if(!['object','array','null'].includes(type))lines.push(String(v));lines.push('@@END');if(v&&typeof v==='object')for(const [k,x]of Object.entries(v))walk(x,(path==='/'?'':path)+'/'+k.replaceAll('~','~0').replaceAll('/','~1'));}walk(value,'/');lines.push('ZUFEK_FIELDS_END');return lines.join('\n');}
const article={status:'READY_FOR_REVIEW',article:{intro:'Use "g6" and \u2300.\n\nKeep C:\\drawings unchanged.',sections:[['Bearing face','Paragraph one.\n\nParagraph two with "quotes".']],checklist:[],sources:[]},ok:true,n:2,empty:null};
assert.deepEqual(parseTextContract(fixedFields(article)),article);
assert.throws(()=>parseTextContract(fixedFields(article).replace('ZUFEK_FIELDS_END','')));
assert.throws(()=>parseTextContract('ZUFEK_FIELDS_V1\n@@FIELD object /\n@@END\n@@FIELD string /__proto__\nx\n@@END\nZUFEK_FIELDS_END'));
assert.throws(()=>parseTextContract(fixedFields(article).replace('/article/sections/0','/article/sections/2')));
console.log(JSON.stringify({fixedTextRoundTrip:true,paragraphsAndQuotesPreserved:true,truncationRejected:true,unsafePathsRejected:true}));

const original=fixedFields(article),duplicate='@@FIELD string /article/intro\n'+article.article.intro+'\n@@END\n',repairs=[];
assert.deepEqual(parseTextContract(original.replace('ZUFEK_FIELDS_END',duplicate+'ZUFEK_FIELDS_END'),{onDuplicate:d=>repairs.push(d)}),article);
assert.equal(repairs.length,1);
assert.throws(()=>parseTextContract(original.replace('ZUFEK_FIELDS_END','@@FIELD string /article/intro\nDifferent body\n@@END\nZUFEK_FIELDS_END')),/冲突/);
assert.deepEqual(parseTextContract(original.replace('ZUFEK_FIELDS_END','@@FIELD object /article\n@@END\nZUFEK_FIELDS_END')),article);
assert.deepEqual(parseTextContract(original.replace('ZUFEK_FIELDS_END','@@FIELD string /article/intro\n\n@@END\nZUFEK_FIELDS_END')),article);

const malformedExample='ZUFEK_FIELDS_V1\n@@FIELD object /\n@@END\n@@FIELD object /article\n@@END\n@@FIELD array /article/example\n@@END\n@@FIELD string /article/example\nOriginal example with "quotes".\n@@END\nFIELD string /article/intro\nOriginal introduction.\n@@END\n@@FIELD object /schema\n@@END\n@@FIELD array /schema/topics\n@@END\n@@FIELD string /schema/topics/0\nMating seat\n@@END\n@@FIELD array /schema/topics/1\n@@END\nZUFEK_FIELDS_END';
const actions=[];assert.deepEqual(parseTextContract(malformedExample,{onDuplicate:x=>actions.push(x)}),{article:{example:'Original example with "quotes".',intro:'Original introduction.'},schema:{topics:['Mating seat']}});assert.equal(actions.length,3);
assert.throws(()=>parseTextContract(malformedExample.replace('@@FIELD string /article/example','@@FIELD string /article/example/0\nNonempty container\n@@END\n@@FIELD string /article/example')),/冲突/);
