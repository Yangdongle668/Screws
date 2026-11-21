import {randomBytes,createCipheriv,createDecipheriv,hkdfSync,createSign,createPrivateKey} from 'node:crypto';
import {publicRequest} from './ai-network.mjs';
// Google Search Console (free Search Analytics API) for topic selection. Read-only scope; a service account
// is added as a user of the property in Search Console. Query data is stored locally and never published.
const SCOPE='https://www.googleapis.com/auth/webmasters.readonly',TOKEN_URL='https://oauth2.googleapis.com/token',API='https://searchconsole.googleapis.com/webmasters/v3/sites/';
const SYNC_EVERY_MS=3*86400000,RETRY_AFTER_MS=6*3600000,WINDOW_DAYS=90,PAGE_ROWS=5000,MAX_ROWS=25000;
const b64url=value=>Buffer.from(value).toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
const text=(v,max=400)=>typeof v==='string'?v.trim().slice(0,max):'';
const day=d=>d.toISOString().slice(0,10);

export function validateProperty(value){const v=text(value,300);if(/^sc-domain:[a-z0-9.-]+\.[a-z]{2,}$/i.test(v))return v.toLowerCase();let u;try{u=new URL(v);}catch{throw Error('资源格式应为 sc-domain:zufek.net 或 https://zufek.net/');}if(u.protocol!=='https:'&&u.protocol!=='http:'||u.search||u.hash)throw Error('资源格式应为 sc-domain:zufek.net 或 https://zufek.net/');return u.origin+(u.pathname.endsWith('/')?u.pathname:u.pathname+'/');}
export function parseServiceAccount(raw){let v;try{v=typeof raw==='string'?JSON.parse(raw):raw;}catch{throw Error('服务账号密钥不是有效的JSON');}
 if(v?.type!=='service_account'||!/^[^@\s]+@[^@\s]+\.iam\.gserviceaccount\.com$/.test(text(v.client_email,300))||typeof v.private_key!=='string')throw Error('请粘贴Google Cloud服务账号的JSON密钥（type为service_account）');
 try{createPrivateKey(v.private_key);}catch{throw Error('服务账号私钥无法读取');}
 return {client_email:v.client_email.trim(),private_key:v.private_key,private_key_id:text(v.private_key_id,100)};}
export function signedAssertion(account,now=Date.now()){const iat=Math.floor(now/1000),header=b64url(JSON.stringify({alg:'RS256',typ:'JWT',...(account.private_key_id?{kid:account.private_key_id}:{})})),claims=b64url(JSON.stringify({iss:account.client_email,scope:SCOPE,aud:TOKEN_URL,iat,exp:iat+3600}));const signer=createSign('RSA-SHA256');signer.update(header+'.'+claims);return header+'.'+claims+'.'+signer.sign(account.private_key).toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');}

const ARTICLE=/^\/(blog|guides|industry-insights)\/[^/]+\/$/,DETAIL=/^\/(products|capabilities|materials|industries|applications)\/[^/]+\/$/;
const INFORMATIONAL=/\b(how|what|why|which|when|vs|versus|difference|guide|standard|tolerance|size|sizes|dimension|dimensions|spec|specification|torque|strength|grade|grades|chart|calculate|calculation|material|materials|coating|plating|thread|threads|types?|design|drawing|inspection|hardness|din|iso|astm)\b/;
const pathOf=url=>{try{const u=new URL(url);return u.pathname.endsWith('/')?u.pathname:u.pathname+'/';}catch{return '/';}};
// Aggregate query rows and keep queries where zufek.net already appears but no page answers the query well.
export function gscOpportunities(rows,{limit=15,minImpressions=3}={}){
 const byQuery=new Map();
 for(const r of rows){const q=text(r.query,200).toLowerCase();if(!q||/zufek/.test(q))continue;const e=byQuery.get(q)||{query:q,impressions:0,clicks:0,weighted:0,pages:new Map()};const imp=Number(r.impressions)||0;e.impressions+=imp;e.clicks+=Number(r.clicks)||0;e.weighted+=(Number(r.position)||0)*imp;const path=pathOf(r.page);e.pages.set(path,(e.pages.get(path)||0)+imp);byQuery.set(q,e);}
 const out=[];
 for(const e of byQuery.values()){if(e.impressions<minImpressions)continue;const position=e.impressions?e.weighted/e.impressions:0,page=[...e.pages.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'/';
  const informational=INFORMATIONAL.test(e.query)||e.query.split(/\s+/).length>=4;let kind=null;
  if(informational&&!ARTICLE.test(page))kind='new_article';else if(position>10)kind=ARTICLE.test(page)||DETAIL.test(page)?'improve_page':'new_article';
  if(!kind)continue;out.push({query:e.query,impressions:e.impressions,clicks:e.clicks,position:Math.round(position*10)/10,page,kind,score:e.impressions*(kind==='new_article'?1.5:1)*(position>10?1.2:1)});}
 return out.sort((a,b)=>b.score-a.score||a.query.localeCompare(b.query)).slice(0,limit).map(({score,...x})=>x);
}
export async function readGSCOpportunities(db,{limit=15}={}){
 try{const table=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='gsc_queries'").first();if(!table)return {opportunities:[],status:'not_configured'};
  const rows=(await db.prepare('SELECT query,page,clicks,impressions,position FROM gsc_queries').all()).results;const meta=await db.prepare('SELECT MIN(start_date) AS startDate,MAX(end_date) AS endDate,MAX(fetched_at) AS fetchedAt FROM gsc_queries').first();
  return {opportunities:gscOpportunities(rows,{limit}),status:rows.length?'available':'empty',window:meta?.startDate?{startDate:meta.startDate,endDate:meta.endDate,fetchedAt:meta.fetchedAt}:null};}
 catch{return {opportunities:[],status:'unavailable'};}
}

export async function createGSCService({db,transport=publicRequest,clock=()=>new Date()}){
 await db.prepare('CREATE TABLE IF NOT EXISTS gsc_config(id INTEGER PRIMARY KEY,payload TEXT NOT NULL)').run();
 await db.prepare('CREATE TABLE IF NOT EXISTS gsc_queries(query TEXT NOT NULL,page TEXT NOT NULL,clicks REAL NOT NULL,impressions REAL NOT NULL,ctr REAL NOT NULL,position REAL NOT NULL,start_date TEXT NOT NULL,end_date TEXT NOT NULL,fetched_at TEXT NOT NULL)').run();
 const master=Buffer.from(process.env.MAIL_CONFIG_KEY||'','base64'),key=master.length===32?Buffer.from(hkdfSync('sha256',master,Buffer.from('zufek-gsc-config'),Buffer.from('v1'),32)):null;
 const seal=value=>{if(!key)throw Error('服务器缺少配置加密密钥');const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key,iv),p=Buffer.concat([c.update(JSON.stringify(value),'utf8'),c.final()]);return JSON.stringify({iv:iv.toString('base64'),tag:c.getAuthTag().toString('base64'),payload:p.toString('base64')});};
 const open=raw=>{if(!key)throw Error('服务器缺少配置加密密钥');const x=JSON.parse(raw),d=createDecipheriv('aes-256-gcm',key,Buffer.from(x.iv,'base64'));d.setAuthTag(Buffer.from(x.tag,'base64'));return JSON.parse(Buffer.concat([d.update(Buffer.from(x.payload,'base64')),d.final()]).toString('utf8'));};
 const load=async()=>{const row=await db.prepare('SELECT payload FROM gsc_config WHERE id=1').first();return {enabled:false,property:'',account:null,lastSync:null,lastAttempt:null,lastError:null,rowCount:0,...(row?open(row.payload):{})};};
 const save=async c=>db.prepare('INSERT INTO gsc_config VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').bind(seal(c)).run();
 let busy=false,closed=false;
 const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});

 async function token(account){const r=await transport(TOKEN_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:signedAssertion(account,+clock())}).toString(),timeout:30000});
  let v={};try{v=JSON.parse(r.text);}catch{}if(r.status!==200||typeof v.access_token!=='string')throw Error('Google授权失败（HTTP '+r.status+(v.error?'，'+text(v.error,80):'')+'）；请检查服务账号密钥');return v.access_token;}
 async function sync(){
  if(busy)throw Error('正在同步，请稍后');busy=true;const c=await load();const startedAt=clock();
  try{if(!c.account||!c.property)throw Error('请先保存资源和服务账号密钥');c.lastAttempt=startedAt.toISOString();
   const access=await token(c.account),end=new Date(+startedAt-3*86400000),start=new Date(+end-(WINDOW_DAYS-1)*86400000),rows=[];
   for(let startRow=0;startRow<MAX_ROWS;startRow+=PAGE_ROWS){const r=await transport(API+encodeURIComponent(c.property)+'/searchAnalytics/query',{method:'POST',headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:JSON.stringify({startDate:day(start),endDate:day(end),dimensions:['query','page'],rowLimit:PAGE_ROWS,startRow}),timeout:60000,limit:20000000});
    let v={};try{v=JSON.parse(r.text);}catch{}if(r.status===403)throw Error('没有该资源的访问权限：请在Search Console把服务账号邮箱添加为用户');if(r.status!==200)throw Error('Search Console返回HTTP '+r.status+(v.error?.message?'：'+text(v.error.message,160):''));
    const page=Array.isArray(v.rows)?v.rows:[];for(const x of page)if(Array.isArray(x.keys)&&x.keys.length===2)rows.push({query:text(x.keys[0],300),page:text(x.keys[1],600),clicks:Number(x.clicks)||0,impressions:Number(x.impressions)||0,ctr:Number(x.ctr)||0,position:Number(x.position)||0});if(page.length<PAGE_ROWS)break;}
   const fetchedAt=clock().toISOString(),insert='INSERT INTO gsc_queries VALUES(?,?,?,?,?,?,?,?,?)';
   await db.batch([db.prepare('DELETE FROM gsc_queries'),...rows.map(x=>db.prepare(insert).bind(x.query,x.page,x.clicks,x.impressions,x.ctr,x.position,day(start),day(end),fetchedAt))]);
   Object.assign(c,{lastSync:fetchedAt,lastError:null,rowCount:rows.length});await save(c);return {rows:rows.length,startDate:day(start),endDate:day(end)};}
  catch(e){c.lastError=String(e.message||e).slice(0,300);await save(c).catch(()=>{});throw e;}
  finally{busy=false;}
 }
 async function tick(){if(closed||busy)return;let c;try{c=await load();}catch{return;}if(!c.enabled||!c.account||!c.property)return;const now=+clock();
  if(c.lastSync&&now-Date.parse(c.lastSync)<SYNC_EVERY_MS)return;if(c.lastAttempt&&c.lastError&&now-Date.parse(c.lastAttempt)<RETRY_AFTER_MS)return;await sync().catch(()=>{});}
 async function handle(r,action){try{if(r.method!=='GET'&&(r.method!=='POST'||r.headers.get('origin')!==new URL(r.url).origin))return json({error:'请从本站后台提交'},403);
  if(action==='gsc-state'&&r.method==='GET'){const c=await load(),o=await readGSCOpportunities(db,{limit:25});return json({enabled:c.enabled,property:c.property,configured:!!c.account,clientEmail:c.account?.client_email||'',lastSync:c.lastSync,lastAttempt:c.lastAttempt,lastError:c.lastError,rowCount:c.rowCount,busy,window:o.window,opportunities:o.opportunities});}
  if(r.method!=='POST')return json({error:'不支持的操作'},405);let b={};try{b=JSON.parse(await r.text()||'{}');}catch{return json({error:'请求格式错误'},400);}
  if(action==='gsc-settings'){const c=await load();if(b.clear){await db.batch([db.prepare('DELETE FROM gsc_config'),db.prepare('DELETE FROM gsc_queries')]);return json({saved:true,cleared:true});}
   c.property=validateProperty(b.property);if(b.credentials)c.account=parseServiceAccount(b.credentials);c.enabled=b.enabled===true;if(c.enabled&&!c.account)throw Error('启用前请粘贴服务账号JSON密钥');await save(c);return json({saved:true});}
  if(action==='gsc-sync'){const result=await sync();return json({synced:true,...result});}
  return json({error:'未知操作'},404);}catch(e){return json({error:String(e.message||e).slice(0,300)},400);}}
 return {handle,tick,sync,close:()=>{closed=true;}};
}
