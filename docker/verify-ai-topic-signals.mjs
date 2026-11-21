import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import {randomBytes,generateKeyPairSync,createVerify} from 'node:crypto';
import {selectPAA,paaTerms,coverageTargets,usedPAAIds} from './ai-editorial-inputs.mjs';
import {gscOpportunities,readGSCOpportunities,createGSCService,parseServiceAccount,validateProperty,signedAssertion} from './gsc-service.mjs';
import {openDatabase} from './storage.mjs';

// --- PAA ranking ---
const row=(id,question,keyword='custom screws')=>({id,keyword,question,country:'us',language:'en',last_seen:'2026-11-20T00:00:00Z',record:{provenance:'google_browser_paa',runId:'r'}});
const library=[row('a','What is a screw used for?'),row('b','What are screws made of?'),row('c','How tight should a shoulder screw fit in its bore?','shoulder screws'),row('d','Is passivation the same as plating?','stainless screws'),row('e','What is a shoulder screw?','shoulder screws')];
assert.deepEqual(paaTerms('Shoulder Screws and tolerances'),['shoulder','screw','tolerance']);
const ranked=selectPAA(library,'shoulder screw bore fit');
assert.equal(ranked[0].id,'c','specific terms outrank the generic word "screw"');
assert(!ranked.some(q=>q.id==='d'),'unrelated questions are not matched');
const withUsed=selectPAA(library,'shoulder screw bore fit',{exclude:['c']});
assert.equal(withUsed.at(-1).id,'c');assert.equal(withUsed.at(-1).alreadyUsed,true,'adopted questions are kept but ranked last and flagged');
const covered=selectPAA(library,'shoulder screw',{coveredTitles:['What is a shoulder screw? | ZUFEK']});
assert.equal(covered.find(q=>q.id==='e').coveredByExistingPage,true);assert.notEqual(covered[0].id,'e','questions already answered by a page rank lower');
assert.equal(selectPAA(library,'photovoltaic cable').length,0,'requireMatch still applies');
assert.equal(selectPAA(library,'',{requireMatch:false,limit:2}).length,2);

// --- coverage targets ---
const pages=[
 {path:'/products/',type:'core_or_hub',internalLinks:['/products/a/','/products/b/']},
 {path:'/products/group/',type:'product',title:'Group',internalLinks:['/products/a/','/products/b/','/products/c/','/products/d/','/products/e/','/products/f/','/products/g/']},
 {path:'/products/a/',type:'product',title:'A to Drawing | ZUFEK',internalLinks:[]},
 {path:'/products/b/',type:'product',title:'B',internalLinks:[]},
 {path:'/materials/brass/',type:'material',title:'Brass',internalLinks:[]},
 {path:'/blog/one/',type:'technical_blog',internalLinks:['/products/a/','/materials/brass/']},
 {path:'/blog/two/',type:'technical_blog',internalLinks:['/products/a/']}];
const targets=coverageTargets(pages);
assert.deepEqual(targets.map(t=>[t.path,t.articleCount]),[['/products/b/',0],['/materials/brass/',1],['/products/a/',2]],'hubs and category pages excluded; fewest supporting articles first');

// --- Search Console opportunities ---
const rows=[
 {query:'shoulder screw tolerance',page:'https://zufek.net/',clicks:0,impressions:40,position:18},
 {query:'shoulder screw tolerance',page:'https://zufek.net/products/shoulder-screws/',clicks:1,impressions:10,position:9},
 {query:'zufek',page:'https://zufek.net/',clicks:5,impressions:50,position:1},
 {query:'custom set screws',page:'https://zufek.net/products/set-screws/',clicks:2,impressions:30,position:6},
 {query:'eye bolt vs lifting eye bolt',page:'https://zufek.net/blog/eye-bolt-linkage-vs-lifting/',clicks:0,impressions:25,position:22},
 {query:'rare query',page:'https://zufek.net/',clicks:0,impressions:1,position:40}];
const ops=gscOpportunities(rows);
assert.deepEqual(ops.map(o=>[o.query,o.kind]),[['shoulder screw tolerance','new_article'],['eye bolt vs lifting eye bolt','improve_page']],'branded, well-placed commercial and tiny queries are skipped');
assert.equal(ops[0].impressions,50);assert.equal(ops[0].position,16.2);assert.equal(ops[0].page,'/');

// --- property and credentials ---
assert.equal(validateProperty('sc-domain:ZUFEK.net'),'sc-domain:zufek.net');assert.equal(validateProperty('https://zufek.net'),'https://zufek.net/');
assert.throws(()=>validateProperty('zufek.net'));
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const account={type:'service_account',client_email:'reader@project.iam.gserviceaccount.com',private_key:privateKey.export({type:'pkcs8',format:'pem'}),private_key_id:'kid1'};
assert.throws(()=>parseServiceAccount('{"type":"user"}'));
const jwt=signedAssertion(parseServiceAccount(JSON.stringify(account)),Date.parse('2026-11-21T00:00:00Z')),[h,c,s]=jwt.split('.');
const claims=JSON.parse(Buffer.from(c,'base64url').toString());assert.equal(claims.scope,'https://www.googleapis.com/auth/webmasters.readonly');assert.equal(claims.aud,'https://oauth2.googleapis.com/token');assert.equal(claims.exp-claims.iat,3600);
const verifier=createVerify('RSA-SHA256');verifier.update(h+'.'+c);assert(verifier.verify(publicKey,Buffer.from(s,'base64url')),'assertion is signed with the service account key');

// --- service: save, sync, state, scheduling ---
process.env.MAIL_CONFIG_KEY=randomBytes(32).toString('base64');
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'zufek-gsc-'));const db=openDatabase(path.join(dir,'test.sqlite'),'drizzle');
let now=new Date('2026-11-21T10:00:00Z'),calls=[];
const transport=async(url,options)=>{calls.push(url);if(url==='https://oauth2.googleapis.com/token'){assert.match(options.body,/grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer/);return {status:200,text:JSON.stringify({access_token:'token-1',expires_in:3600})};}
 assert.equal(url,'https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Azufek.net/searchAnalytics/query');assert.equal(options.headers.Authorization,'Bearer token-1');const body=JSON.parse(options.body);const end=new Date(+now-3*86400000);assert.equal(body.endDate,end.toISOString().slice(0,10));assert.equal(body.startDate,new Date(+end-89*86400000).toISOString().slice(0,10));assert.deepEqual(body.dimensions,['query','page']);
 return {status:200,text:JSON.stringify({rows:rows.map(r=>({keys:[r.query,r.page],clicks:r.clicks,impressions:r.impressions,ctr:0,position:r.position}))})};};
const gsc=await createGSCService({db,transport,clock:()=>now});
const request=(action,body)=>new Request('https://zufek.net/api/admin/'+action,body?{method:'POST',headers:{origin:'https://zufek.net','content-type':'application/json'},body:JSON.stringify(body)}:{});
assert.equal((await gsc.handle(new Request('https://zufek.net/api/admin/gsc-sync',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'}),'gsc-sync')).status,403,'cross-site writes are refused');
assert.equal((await gsc.handle(request('gsc-settings',{property:'sc-domain:zufek.net',enabled:true}),'gsc-settings')).status,400,'enabling requires a key');
assert.equal((await gsc.handle(request('gsc-settings',{property:'sc-domain:zufek.net',credentials:JSON.stringify(account),enabled:true}),'gsc-settings')).status,200);
let state=await (await gsc.handle(request('gsc-state'),'gsc-state')).json();
assert.equal(state.configured,true);assert.equal(state.clientEmail,account.client_email);assert(!JSON.stringify(state).includes('PRIVATE KEY'),'the private key is never returned');
const stored=await db.prepare('SELECT payload FROM gsc_config WHERE id=1').first();assert(!stored.payload.includes('PRIVATE KEY')&&!stored.payload.includes(account.client_email),'settings are encrypted at rest');
await gsc.tick();assert.equal(calls.length,2,'first tick syncs');
state=await (await gsc.handle(request('gsc-state'),'gsc-state')).json();assert.equal(state.rowCount,rows.length);assert.equal(state.opportunities[0].query,'shoulder screw tolerance');
await gsc.tick();assert.equal(calls.length,2,'no repeat sync within three days');
now=new Date('2026-11-25T10:00:00Z');await gsc.tick();assert.equal(calls.length,4,'resyncs after three days');
const read=await readGSCOpportunities(db);assert.equal(read.status,'available');assert.equal(read.window.endDate,'2026-11-22');

// Failure is recorded and retried no sooner than six hours later.
const failing=await createGSCService({db,transport:async()=>({status:403,text:'{}'}),clock:()=>now});
now=new Date('2026-11-29T10:00:00Z');await failing.tick();state=await (await failing.handle(request('gsc-state'),'gsc-state')).json();assert.match(state.lastError,/授权失败|访问权限/);
// usedPAAIds reads adopted question ids from finished tasks only.
await db.prepare('CREATE TABLE IF NOT EXISTS ai_jobs(id TEXT,status TEXT,result TEXT,created_at TEXT)').run();
await db.prepare('INSERT INTO ai_jobs(id,status,result,created_at) VALUES(?,?,?,?)').bind('j1','in_review',JSON.stringify({paaAdopted:[{id:'c'}]}),'2026-11-20').run();
await db.prepare('INSERT INTO ai_jobs(id,status,result,created_at) VALUES(?,?,?,?)').bind('j2','failed',JSON.stringify({paaAdopted:[{id:'d'}]}),'2026-11-20').run();
assert.deepEqual(await usedPAAIds(db),['c']);
await fs.rm(dir,{recursive:true,force:true});
console.log(JSON.stringify({paaWeightedRanking:true,usedAndCoveredFlags:true,coverageTargets:true,gscOpportunities:true,serviceAccountJWT:true,encryptedSettings:true,scheduledSync:true,noExternalCalls:true}));
