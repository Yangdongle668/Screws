import {randomBytes,createCipheriv,createDecipheriv,hkdfSync} from 'node:crypto';
import {publicRequest} from './ai-network.mjs';
// Copyscape Premium API (https://www.copyscape.com/api-guide.php): checks article text against the public web.
// Each search is charged by Copyscape (3c for the first 200 words plus 1c per additional 100 words at the time
// of writing). The owner's own domain is excluded so a published article is not matched against itself.
const API='https://www.copyscape.com/api/';
export const COPYSCAPE_DEFAULTS={mode:'warn',threshold:20,spendLimit:0.5,ignoreDomains:['zufek.net']};

export function summarizeCopyscape(raw){
 if(!raw||typeof raw!=='object')throw Error('Copyscape返回格式错误');if(raw.error)throw Error('Copyscape：'+String(raw.error).slice(0,200));
 const words=Number(raw.querywords)||0,results=(Array.isArray(raw.result)?raw.result:raw.result?[raw.result]:[]).map(r=>({url:String(r.url||''),title:String(r.title||'').slice(0,200),minWordsMatched:Number(r.minwordsmatched)||0,wordsMatched:r.wordsmatched!==undefined?Number(r.wordsmatched):null,percentMatched:r.percentmatched!==undefined?Number(r.percentmatched):null,snippet:String(r.textsnippet||'').slice(0,300)}));
 // allpercentmatched is the share of the article found across the compared results; without it, use the largest single match.
 const fallback=words?Math.max(0,...results.map(r=>(r.wordsMatched??r.minWordsMatched)/words*100)):0;
 return {words,cost:Number(raw.cost)||0,count:Number(raw.count)||results.length,percent:Math.round(raw.allpercentmatched!==undefined?Number(raw.allpercentmatched):fallback),results:results.slice(0,10)};
}

export function createCopyscape({db,transport=publicRequest,clock=()=>new Date()}){
 const master=Buffer.from(process.env.MAIL_CONFIG_KEY||'','base64'),key=master.length===32?Buffer.from(hkdfSync('sha256',master,Buffer.from('zufek-copyscape-config'),Buffer.from('v1'),32)):null;
 const seal=v=>{if(!key)throw Error('服务器缺少配置加密密钥');const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key,iv),p=Buffer.concat([c.update(JSON.stringify(v),'utf8'),c.final()]);return JSON.stringify({iv:iv.toString('base64'),tag:c.getAuthTag().toString('base64'),payload:p.toString('base64')});};
 const open=raw=>{const x=JSON.parse(raw),d=createDecipheriv('aes-256-gcm',key,Buffer.from(x.iv,'base64'));d.setAuthTag(Buffer.from(x.tag,'base64'));return JSON.parse(Buffer.concat([d.update(Buffer.from(x.payload,'base64')),d.final()]).toString('utf8'));};
 const ready=db.prepare('CREATE TABLE IF NOT EXISTS copyscape_config(id INTEGER PRIMARY KEY,payload TEXT NOT NULL)').run();
 async function load(){await ready;const row=await db.prepare('SELECT payload FROM copyscape_config WHERE id=1').first();return {...COPYSCAPE_DEFAULTS,mode:'off',username:'',apiKey:'',...(row&&key?open(row.payload):{})};}
 async function save(input){const old=await load();const username=typeof input.username==='string'?input.username.trim().slice(0,80):old.username,apiKey=input.clearKey?'':typeof input.apiKey==='string'&&input.apiKey.trim()?input.apiKey.trim().slice(0,200):old.apiKey;
  if(/[\s&=]/.test(username+apiKey))throw Error('Copyscape用户名或密钥格式错误');const mode=['off','warn','block'].includes(input.mode)?input.mode:old.mode;if(mode!=='off'&&(!username||!apiKey))throw Error('启用前请填写Copyscape用户名和API密钥');
  const threshold=Number(input.threshold??old.threshold),spendLimit=Number(input.spendLimit??old.spendLimit);if(!(threshold>=1&&threshold<=100)||!(spendLimit>=0.05&&spendLimit<=5))throw Error('阈值应为1–100%，单次花费上限应为0.05–5美元');
  await db.prepare('INSERT INTO copyscape_config VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').bind(seal({username,apiKey,mode,threshold,spendLimit,ignoreDomains:old.ignoreDomains})).run();}
 const query=(c,extra)=>API+'?'+new URLSearchParams({u:c.username,k:c.apiKey,f:'json',...extra}).toString();
 async function request(url,options){const r=await transport(url,{timeout:60000,...options});let v;try{v=JSON.parse(r.text);}catch{throw Error('Copyscape返回HTTP '+r.status+'，不是有效JSON');}if(r.status!==200&&!v.error)throw Error('Copyscape返回HTTP '+r.status);return v;}
 async function balance(){const c=await load();if(!c.username||!c.apiKey)throw Error('请先保存Copyscape用户名和API密钥');const v=await request(query(c,{o:'balance'}),{method:'GET'});if(v.error)throw Error('Copyscape：'+String(v.error).slice(0,200));return {value:Number(v.value),today:Number(v.today)};}
 async function check(text){const c=await load();if(!c.username||!c.apiKey)throw Error('请先保存Copyscape用户名和API密钥');const raw=await request(query(c,{o:'csearch',e:'UTF-8',c:'3',i:c.ignoreDomains.join(','),l:String(c.spendLimit)}),{method:'POST',headers:{'Content-Type':'text/plain; charset=UTF-8'},body:String(text)});return {...summarizeCopyscape(raw),checkedAt:clock().toISOString()};}
 const publicState=async()=>{const c=await load();return {mode:c.mode,threshold:c.threshold,spendLimit:c.spendLimit,username:c.username,keySaved:!!c.apiKey,ignoreDomains:c.ignoreDomains};};
 return {load,save,balance,check,publicState};
}
