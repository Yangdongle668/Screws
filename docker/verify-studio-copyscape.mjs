import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import {randomBytes} from 'node:crypto';
import {openDatabase} from './storage.mjs';
import {createArticleStudio,STUDIO_RULES} from './article-studio.mjs';
import {createCopyscape,summarizeCopyscape} from './copyscape.mjs';
process.env.MAIL_CONFIG_KEY=randomBytes(32).toString('base64');
const pages=JSON.parse(await fs.readFile('docs/content-operations/inventory.json','utf8')).pages;
assert(STUDIO_RULES.includes('in your own words'),'writing rules ask for original wording');

// --- response parsing ---
const parsed=summarizeCopyscape({querywords:500,cost:0.06,count:2,allpercentmatched:18,result:[{url:'https://other.example/a',title:'A',minwordsmatched:60,wordsmatched:70,percentmatched:14,textsnippet:'... snippet ...',textmatched:'Matched sentence one.'},{url:'https://other.example/b',title:'B',minwordsmatched:20}]});
assert.equal(parsed.percent,18);assert.equal(parsed.results[0].matchedText,'Matched sentence one.');assert.equal(parsed.results[1].percentMatched,null);
assert.throws(()=>summarizeCopyscape({error:'No credits remaining'}),/No credits remaining/);
assert.equal(summarizeCopyscape({querywords:200,result:[{url:'u',minwordsmatched:50}]}).percent,25,'falls back to the largest single match');

// --- studio with a mocked model and a mocked Copyscape endpoint ---
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'zufek-copyscape-'));const db=openDatabase(path.join(dir,'t.sqlite'),'drizzle');
let percent=30;const requests=[];
const transport=async(url,options)=>{const u=new URL(url);requests.push({op:u.searchParams.get('o'),body:options.body});assert.equal(u.origin+u.pathname,'https://www.copyscape.com/api/');assert.equal(u.searchParams.get('f'),'json');assert.equal(u.searchParams.get('u'),'qa-user');
 if(u.searchParams.get('o')==='balance')return {status:200,text:JSON.stringify({value:'4.50',total:'0',today:'200'})};
 assert.equal(u.searchParams.get('o'),'csearch');assert.equal(u.searchParams.get('e'),'UTF-8');assert.equal(u.searchParams.get('i'),'zufek.net','own domain excluded');assert.equal(u.searchParams.get('l'),'0.5');assert.equal(options.method,'POST');assert(options.body.includes('Lifting eye bolt'),'article text is sent');
 return {status:200,text:JSON.stringify({querywords:420,cost:0.06,count:1,allpercentmatched:percent,result:[{url:'https://competitor.example/eye-bolts',title:'Eye bolt guide',minwordsmatched:90,wordsmatched:110,percentmatched:percent,textmatched:'Paragraph 1 explains the fit case for a lifting eye bolt thread engagement.'}]})};};
const copyscape=createCopyscape({db,transport});
const body=(n)=>Array.from({length:n},(_,i)=>`Paragraph ${i+1} explains the fit case for a lifting eye bolt thread engagement.`).join('\n\n');
const text=`@@TITLE\nLifting eye bolt thread engagement in tapped holes\n@@META_TITLE\nLifting eye bolt thread engagement\n@@META_DESCRIPTION\nHow much thread engagement a lifting eye bolt needs in a tapped hole, and what to put on the drawing so the supplier can quote and inspect it.\n@@INTRO\nLifting eye bolt thread engagement depends on the tapped material. Specify it on the drawing.\n@@SECTION Engagement\n${body(2)} See [lifting eye bolts](/products/lifting-eye-bolts/) and the [RFQ checklist](/guides/rfq-checklist/).\n@@SECTION Hole\n${body(2)} See [threading](/capabilities/threading/).\n@@SECTION Load\n${body(2)}\n@@SECTION Verification\n${body(2)}\n@@CHECKLIST\n- Material\n@@FAQ\nQ: a?\nA: b.\nQ: c?\nA: d.\nQ: e?\nA: f.\n@@END`;
const calls=[];
const ai={inventory:async()=>({pages,drafts:[]}),
 studioCall:async(id,stage,messages)=>{calls.push(stage);if(stage==='STUDIO_BRIEF')return {title:'Lifting eye bolt thread engagement in tapped holes',primaryKeyword:'lifting eye bolt thread engagement',secondaryKeywords:[],readerQuestion:'q',sections:['Engagement','Hole','Load','Verification'],faq:['a','b','c'],internalLinks:[{path:'/products/lifting-eye-bolts/',anchor:'lifting eye bolts'}]};
  if(stage==='STUDIO_TEXT_REVISE'&&messages[1].content.includes('Matched passages found on other websites')){assert(messages[1].content.includes('Paragraph 1 explains the fit case'),'only the matched passages are sent for rewriting');return text.replace(/Paragraph (\d+) explains the fit case for a lifting eye bolt thread engagement\./g,'Section $1 sets out how thread engagement for a lifting eye bolt is chosen.');}
  return text;},
 publishStudioArticle:async()=> 'ai-job-1',publicationSummary:async()=>null,retryPublication:async()=>{}};
const studio=await createArticleStudio({db,ai,copyscape});
const request=(action,b)=>new Request('https://zufek.net/api/admin/'+action,b?{method:'POST',headers:{origin:'https://zufek.net'},body:JSON.stringify(b)}:{});
const call=async(action,b)=>{const r=await studio.handle(request(action,b),action.split('?')[0]);return {status:r.status,body:await r.json()};};

// settings: off by default, enabling requires credentials, key encrypted and never returned
assert.equal((await call('studio-state')).body.copyscape.mode,'off');
assert.equal((await call('studio-copyscape-settings',{mode:'warn'})).status,400);
assert.equal((await call('studio-copyscape-settings',{username:'qa-user',apiKey:'secret-key-123',mode:'warn',threshold:20,spendLimit:0.5})).status,200);
const state=(await call('studio-state')).body.copyscape;assert.equal(state.keySaved,true);assert(!JSON.stringify(state).includes('secret-key-123'));
assert(!(await db.prepare('SELECT payload FROM copyscape_config').first()).payload.includes('secret-key-123'),'key encrypted at rest');
assert.equal((await call('studio-copyscape-balance',{})).body.value,4.5);

// generate a draft ready for review
const created=(await call('studio-create',{hint:'lifting eye bolt thread engagement'})).body;await new Promise(r=>setTimeout(r,30));await studio.tick();
let job=(await call('studio-job?id='+created.id)).body;assert.equal(job.status,'review',JSON.stringify(job.checks?.blocking||job.error));assert.equal(job.externalCheck,null);

// warn mode: approval runs the check automatically and asks for confirmation above the threshold
let approve=await call('studio-approve',{id:created.id});assert.equal(approve.status,409);assert.equal(approve.body.needsConfirmation,true);assert.match(approve.body.error,/30%/);
job=(await call('studio-job?id='+created.id)).body;assert.equal(job.externalCheck.percent,30);assert.equal(job.externalCheck.stale,false);
const searchesBefore=requests.filter(r=>r.op==='csearch').length;

// targeted rewrite of the matched sentences, then the result is stale
assert.equal((await call('studio-external-rewrite',{id:created.id})).status,200);
job=(await call('studio-job?id='+created.id)).body;assert(job.draftText.includes('Section 1 sets out'));assert.equal(job.externalCheck.stale,true,'edits make the external result stale');assert.equal(job.status,'review');

// block mode: a fresh check above the threshold refuses approval
await call('studio-copyscape-settings',{mode:'block',threshold:20});
const blocked=await call('studio-approve',{id:created.id});assert.equal(blocked.status,400);assert.match(blocked.body.error,/禁止发布/);
assert.equal(requests.filter(r=>r.op==='csearch').length,searchesBefore+1,'a stale result is re-checked once before approval');

// below the threshold the article is published, without re-checking the same text
percent=5;await call('studio-external-check',{id:created.id});const n=requests.filter(r=>r.op==='csearch').length;
const ok=await call('studio-approve',{id:created.id});assert.equal(ok.status,200,JSON.stringify(ok.body));assert.equal(requests.filter(r=>r.op==='csearch').length,n,'a current result is reused');

// rewrite limit
await fs.rm(dir,{recursive:true,force:true}).catch(()=>{});
console.log(JSON.stringify({originalWordingRule:true,encryptedSettings:true,balance:true,autoCheckBeforeApproval:true,warnNeedsConfirmation:true,blockRefuses:true,targetedRewrite:true,staleAfterEdit:true,resultReused:true}));
