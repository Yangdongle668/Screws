// Authoring-only translation helper. Never invoked by a build or a visitor.
// Public website copy only; do not pass inquiries, credentials or private data.
import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync('translations/source.json','utf8'));
const selected=process.argv.slice(2).length?process.argv.slice(2):['de','es','it','zh','fr'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const protectedPattern=/DONGGUAN ZUFEK TECHNOLOGY CO\.,?\s*LTD\.?|ZUFEK|Theo Wan|Mercedes-Benz|BMW|engineer@zufek\.com|\{[a-z]+\}|\b(?:SUS\s?\d+(?:\/\d+)?|ISO\s?\d+(?:[-:]\d+)?|VDA\s?\d+|[A-Z]\d+(?:[-×x]\d+(?:\.\d+)*)?|\d+(?:[.,]\d+)*(?:[–/-]\d+(?:\.\d+)*)?(?:PH)?|g6|h7|6g|6H|PTFE|CNC|CCD|CMM|HV|HRC|MPa|NPT|MJ|R2|D1)\b/g;
function protect(text){const tokens=[];return {text:text.replace(protectedPattern,v=>{tokens.push(v);return '⟦T'+String(tokens.length-1).padStart(4,'0')+'⟧';}),tokens};}
async function translateBatch(locale,batch){
 const protectedTexts=batch.map(protect),joined=protectedTexts.map((p,i)=>'[[['+String(i).padStart(6,'0')+']]]\n'+p.text).join('\n\n');
 const url=new URL('https://translate.googleapis.com/translate_a/single');url.search=new URLSearchParams({client:'gtx',sl:'en',tl:locale==='zh'?'zh-CN':locale,dt:'t',q:joined});
 let translated;
 for(let attempt=0;attempt<5;attempt++){try{const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Translation HTTP '+response.status);const json=await response.json();translated=json[0].map(x=>x[0]??'').join('');break;}catch(error){if(attempt===4)throw error;await sleep(2000*(attempt+1));}}
 const markers=[...translated.matchAll(/\[\s*\[\s*\[\s*(\d{6})\s*\]\s*\]\s*\]/g)];
 if(markers.length!==batch.length||markers.some((m,i)=>Number(m[1])!==i)){
  if(batch.length>1){const result=[];for(const value of batch)result.push(...await translateBatch(locale,[value]));return result;}throw Error('Translation boundary lost: '+batch[0].slice(0,80));
 }
 try{return batch.map((original,i)=>{let value=translated.slice(markers[i].index+markers[i][0].length,markers[i+1]?.index??translated.length).trim();for(const [n,token]of protectedTexts[i].tokens.entries()){const pattern=new RegExp('⟦T\\s*'+String(n).padStart(4,'0')+'\\s*⟧','gi');if(!pattern.test(value))throw Error('Protected term lost: '+token);value=value.replace(pattern,()=>token);}if(/⟦T\s*\d/.test(value))throw Error('Unresolved protected term');return value;});}catch(error){if(batch.length>1){const result=[];for(const value of batch)result.push(...await translateBatch(locale,[value]));return result;}throw Error(error.message+" / "+locale+" / "+batch[0]);}
}
let active=0;const queue=[];async function limited(fn){if(active>=3)await new Promise(r=>queue.push(r));active++;try{return await fn();}finally{active--;queue.shift()?.();}}
await Promise.all(selected.map(async locale=>{
 const file='translations/'+locale+'.json';const dictionary=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};const missing=source.filter(s=>dictionary[s]===undefined||(process.env.REPAIR_IDENTICAL==="1"&&dictionary[s]===s&&s.split(/\\s+/).length>4&&!s.includes("DONGGUAN ZUFEK")));const batches=[];let batch=[],size=0;for(const text of missing){const length=encodeURIComponent(protect(text).text).length+60;if(batch.length&&(size+length>6500||process.env.REPAIR_IDENTICAL==="1")){batches.push(batch);batch=[];size=0;}batch.push(text);size+=length;}if(batch.length)batches.push(batch);
 let done=0;for(const group of batches){await limited(async()=>{const result=await translateBatch(locale,group);group.forEach((text,i)=>dictionary[text]=result[i]);const temporary=file+'.tmp';fs.writeFileSync(temporary,JSON.stringify(dictionary,null,2)+'\n');for(let retry=0;;retry++){try{fs.renameSync(temporary,file);break;}catch(error){if(retry>=8)throw error;await sleep(250*(retry+1));}}});done+=group.length;console.log(locale,done+'/'+missing.length);await sleep(100);}
}));
