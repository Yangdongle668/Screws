import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
import {openDatabase} from './storage.mjs';
import {parseStudioText,formatStudioText,structureProblems,slugify,toArticle} from './studio-format.mjs';
import {truthCheck,duplicateCheck,seoCheck,styleCheck} from './studio-checks.mjs';
import {topicCandidates,isDuplicateTopic,matchPages} from './studio-topics.mjs';
import {createArticleStudio,validateBrief} from './article-studio.mjs';
const inventory=JSON.parse(await fs.readFile('docs/content-operations/inventory.json','utf8'));
const pages=inventory.pages;const facts=await fs.readFile('docs/content-operations/COMPANY-FACTS.md','utf8');

// --- format: tolerant parsing, quotes and braces are harmless ---
const body=(n,extra='')=>Array.from({length:n},(_,i)=>`Paragraph ${i+1} explains the "fit" {and} [bracket] case for a hollow screw bore. ${extra}`).join('\n\n');
const sample=(o={})=>`Some preface the parser ignores.
@@TITLE
${o.title||'Hollow screw bore specification for cable routing'}
@@META_TITLE
Hollow screw bore specification
@@META_DESCRIPTION
Specify a hollow screw bore for cable routing: minimum clear diameter, edge condition and wall section, so the supplier can quote and inspect it.
@@INTRO
A hollow screw bore for cable routing is specified by its minimum clear diameter, both edge conditions and the remaining wall. Put those three items on the drawing.
@@SECTION Define the clear bore
${body(2,o.extra||'')} See [hollow screws](/products/hollow-screws/) and the [RFQ checklist](/guides/rfq-checklist/).
@@SECTION Protect the cable at both edges
${body(2)} Compare with [CNC turning](/capabilities/cnc-turning/).
@@SECTION Check the remaining wall
${body(2)}
@@SECTION Choose an inspection method
${body(2)}
@@CHECKLIST
- Minimum clear bore
- Edge condition at entry and exit
@@FAQ
Q: Can the bore be threaded?
A: Yes, when the wall to the external thread root is reviewed as one section.
Q: Does a larger bore weaken the screw?
A: It reduces the load-carrying section, so the wall must be checked at the thread root.
Q: How is a hidden bore inspected?
A: With a pin gauge or a method agreed for the part, because external vision cannot see inside.
@@END`;
const doc=parseStudioText(sample());
assert.equal(doc.sections.length,4);assert.equal(doc.faq.length,3);assert.deepEqual(structureProblems(doc),[]);assert(doc.sections[0][1].includes('"fit" {and} [bracket]'),'quotes and braces survive');
assert.deepEqual(parseStudioText(formatStudioText(doc)),doc,'format round-trips');
assert(structureProblems(parseStudioText(sample().replace('@@END',''))).some(p=>p.includes('截断')),'missing @@END is reported as truncation');
assert.equal(slugify('What Are Hollow Bolts Called? Hollow Bolt vs Hollow Screw'),'hollow-bolts-called-hollow-bolt-hollow-screw');
const article=toArticle(doc,{slug:'x',category:'DESIGN & DIMENSIONS',product:'hollow-screws'});assert.equal(article.sections.at(-1)[0],'Frequently asked questions');assert.equal(article.bodyFormat,'markdown');

// --- truthfulness ---
const claims=parseStudioText(sample({extra:'ZUFEK is IATF 16949 certified. Our customers include BMW. In our tests the bore never failed. ZUFEK runs 48 cold headers. We recommend a 3 mm margin.'}));
const truth=truthCheck(claims,facts),codes=truth.map(i=>i.code);
for(const c of ['claim_certification','claim_customer','claim_experience','claim_company_number','first_person','absolute_claim'])assert(codes.includes(c),'detects '+c);
assert(truth.filter(i=>i.code.startsWith('claim_')&&i.code!=='claim_equipment').every(i=>i.level==='block'));
assert.deepEqual(truthCheck(parseStudioText(sample({extra:'ZUFEK was established in 2005 in Dalang, Dongguan.'})),facts).filter(i=>i.level==='block'),[],'approved company facts pass');

// --- duplicate check against the real site ---
const existing=pages.find(p=>p.path==='/blog/hollow-screw-bore-specification/');
const copied=parseStudioText(sample().replace('@@SECTION Check the remaining wall','@@SECTION Copied\n'+existing.bodyText.slice(0,4000)+'\n@@SECTION Check the remaining wall'));
const dup=duplicateCheck(copied,pages);assert(dup.issues.some(i=>i.code==='duplicate_content'&&i.level==='block'),'copied site text is blocked');assert.equal(dup.closestPath,existing.path);
assert(!duplicateCheck(doc,pages).issues.some(i=>i.level==='block'),'original text passes');
assert(duplicateCheck(parseStudioText(sample({title:existing.title.replace(/\s*\|.*$/,'')})),pages).issues.some(i=>i.code==='duplicate_title'));

// --- SEO ---
const valid=new Set(pages.map(p=>p.path));
const seo=seoCheck(doc,{primaryKeyword:'hollow screw bore',validPaths:valid,targetPath:'/products/hollow-screws/',slug:'hollow-screw-bore-cable',takenSlugs:new Set()});
assert(seo.some(i=>i.code==='too_short'),'short body flagged');assert(!seo.some(i=>['invalid_link','few_links','target_link','faq','meta_title','keyword_title'].includes(i.code)),JSON.stringify(seo));
assert(seoCheck(parseStudioText(sample().replace('(/products/hollow-screws/)','(/de/products/hollow-screws/)')),{validPaths:valid}).some(i=>i.code==='invalid_link'),'localized or unknown links are flagged');
assert(seoCheck(doc,{validPaths:valid,slug:'hollow-screw-bore-specification',takenSlugs:new Set(['hollow-screw-bore-specification'])}).some(i=>i.code==='slug_taken'&&i.level==='block'));

// --- style ---
const memo=styleCheck(parseStudioText(sample({extra:'The honest summary is that the sources reviewed here do not settle it. It is important to note that results must be confirmed with the supplier.'})));
assert(memo.issues.some(i=>i.code==='research_memo')&&memo.issues.some(i=>i.code==='stock_phrase'));

// --- topics ---
assert(isDuplicateTopic('How to specify a hollow screw bore',['Hollow screw bores: the details an RFQ should include']));
const cands=topicCandidates({gsc:[{query:'what is a captive panel screw',kind:'new_article',impressions:30,position:14,page:'/'},{query:'hollow screw bore specification',kind:'new_article',impressions:50,position:12,page:'/'}],pages});
assert.equal(cands[0].question,'what is a captive panel screw','search queries already covered by an article are skipped');
assert(cands.some(c=>c.source==='coverage'));
assert.equal(topicCandidates({hint:'set screw cup point',pages})[0].source,'manual');
assert.equal(matchPages('lifting eye bolt thread engagement',pages).product,'lifting-eye-bolts');

// --- brief validation ---
const options=[{path:'/products/hollow-screws/',title:'Hollow'},{path:'/guides/rfq-checklist/',title:'RFQ'}];
const b=validateBrief({title:'T',primaryKeyword:'K',sections:['A','B','C'],internalLinks:[{path:'/made-up/',anchor:'x'},{path:'/guides/rfq-checklist/',anchor:'RFQ checklist'}],category:'nope'},{linkOptions:options,targetPath:'/products/hollow-screws/'});
assert.deepEqual(b.internalLinks.map(l=>l.path),['/products/hollow-screws/','/guides/rfq-checklist/'],'unknown links removed, product page added');assert.equal(b.category,'DESIGN & DIMENSIONS');

// --- end to end with a mocked model ---
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'zufek-studio-'));const db=openDatabase(path.join(dir,'t.sqlite'),'drizzle');
const calls=[];let published=null;
const ai={inventory:async()=>({pages,drafts:[]}),
 studioCall:async(id,stage,messages,max)=>{calls.push({stage,max});
  if(stage==='STUDIO_BRIEF'){const input=JSON.parse(messages[1].content);assert(input.internalLinkOptions.some(o=>o.path==='/products/lifting-eye-bolts/'));assert(messages[0].content.includes('Do not use "we"'));return {title:'Lifting eye bolt thread engagement in tapped holes',primaryKeyword:'lifting eye bolt thread engagement',secondaryKeywords:['eye bolt tapped hole'],readerQuestion:'How much thread engagement does a lifting eye bolt need?',searchIntent:'informational',shortAnswer:'x',category:'DESIGN & DIMENSIONS',sections:['Engagement length','Hole preparation','Load direction','Verification'],faq:['a','b','c'],internalLinks:[{path:'/products/lifting-eye-bolts/',anchor:'lifting eye bolts'},{path:'/guides/rfq-checklist/',anchor:'RFQ checklist'}]};}
  const clean=sample({title:'Lifting eye bolt thread engagement in tapped holes'}).replace(/hollow screw bore/gi,'lifting eye bolt thread engagement').replace('(/products/hollow-screws/)','(/products/lifting-eye-bolts/)');
  if(stage==='STUDIO_TEXT_DRAFT'){assert(messages[0].content.includes('@@SECTION'));return clean.replace('@@SECTION Check','In our tests the thread never failed.\n@@SECTION Check');}
  if(stage==='STUDIO_TEXT_REVISE'){assert(messages[1].content.includes('不能虚构测试'),'revision receives the issue list');return clean;}
  throw Error('unexpected '+stage);},
 publishStudioArticle:async(article,meta)=>{published={article,meta};return 'ai-job-1';},
 publicationSummary:async id=>({jobId:id,slug:'s',status:pubState,phase:'translate:es',error:pubState==='failed'?'固定字段格式不完整':null,languages:[{locale:'de',status:'ready',attempts:1},{locale:'es',status:pubState==='failed'?'failed':'generating',attempts:2,error:'x'}]}),
 retryPublication:async id=>{retried.push(id);pubState='queued';}};
let pubState='failed';const retried=[];
const studio=await createArticleStudio({db,ai});
const request=(action,body)=>new Request('https://zufek.net/api/admin/'+action,body?{method:'POST',headers:{origin:'https://zufek.net'},body:JSON.stringify(body)}:{});
const created=await (await studio.handle(request('studio-create',{hint:'lifting eye bolt thread engagement'}),'studio-create')).json();
await new Promise(r=>setTimeout(r,50));await studio.tick();
let job=await (await studio.handle(request('studio-job?id='+created.id),'studio-job')).json();
assert.equal(job.status,'review',JSON.stringify(job.error||job.checks?.blocking));assert.deepEqual(calls.map(c=>c.stage),['STUDIO_BRIEF','STUDIO_TEXT_DRAFT','STUDIO_TEXT_REVISE'],'at most three model calls');
assert.equal(job.modelCalls,3);assert.equal(job.checks.blocking.length,0);assert.equal(job.article.product,'lifting-eye-bolts');assert.equal(job.article.slug,'lifting-eye-bolt-thread-engagement-tapped-holes');
// manual edit re-checks locally without a model call
await studio.handle(request('studio-save-text',{id:created.id,text:job.draftText.replace('@@SECTION Check','ZUFEK is ISO 9001 certified.\n@@SECTION Check')}),'studio-save-text');
job=await (await studio.handle(request('studio-job?id='+created.id),'studio-job')).json();assert.equal(job.status,'blocked');assert.equal(calls.length,3);
assert.equal((await studio.handle(request('studio-approve',{id:created.id}),'studio-approve')).status,400,'blocked drafts cannot be published');
await studio.handle(request('studio-save-text',{id:created.id,text:job.draftText.replace('ZUFEK is ISO 9001 certified.\n','')}),'studio-save-text');
const approved=await (await studio.handle(request('studio-approve',{id:created.id}),'studio-approve')).json();
assert.equal(approved.aiJobId,'ai-job-1');
// publication progress and retry are available from the studio itself
let withPublication=await (await studio.handle(request('studio-job?id='+created.id),'studio-job')).json();
assert.equal(withPublication.publication.status,'failed');assert.equal(withPublication.publication.languages.find(l=>l.locale==='es').status,'failed');
const listed=(await (await studio.handle(request('studio-state'),'studio-state')).json()).jobs.find(j=>j.id===created.id);assert.equal(listed.publication.phase,'translate:es');
assert.equal((await studio.handle(request('studio-publish-retry',{id:created.id}),'studio-publish-retry')).status,200);assert.deepEqual(retried,['ai-job-1']);
withPublication=await (await studio.handle(request('studio-job?id='+created.id),'studio-job')).json();assert.equal(withPublication.publication.status,'queued');assert.equal(published.article.slug,'lifting-eye-bolt-thread-engagement-tapped-holes');assert.equal(published.meta.keywordBrief.primaryKeyword,'lifting eye bolt thread engagement');
// a duplicate request for the same topic is not repeated
const second=await (await studio.handle(request('studio-create',{}),'studio-create')).json();await new Promise(r=>setTimeout(r,50));await studio.tick();
const secondJob=await (await studio.handle(request('studio-job?id='+second.id),'studio-job')).json();assert.notEqual(secondJob.topic?.question,'lifting eye bolt thread engagement');
assert.equal((await studio.handle(new Request('https://zufek.net/api/admin/studio-create',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'}),'studio-create')).status,403);
await fs.rm(dir,{recursive:true,force:true});
console.log(JSON.stringify({plainTextFormat:true,truthfulnessBlocks:true,duplicateAgainstSite:true,seoChecks:true,styleChecks:true,deterministicTopics:true,maxThreeModelCalls:true,manualEditNoModelCall:true,blockedCannotPublish:true,handOffToPublisher:true}));
