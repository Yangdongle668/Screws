import fs from 'node:fs/promises';import path from 'node:path';import {randomUUID,createHash} from 'node:crypto';
import {createCopyscape} from './copyscape.mjs';
import {readPAALibrary,usedPAAIds} from './ai-editorial-inputs.mjs';
import {readGSCOpportunities} from './gsc-service.mjs';
import {topicCandidates,isDuplicateTopic,matchPages} from './studio-topics.mjs';
import {FORMAT_GUIDE,parseStudioText,formatStudioText,structureProblems,slugify,toArticle,wordCount,plainText} from './studio-format.mjs';
import {runChecks} from './studio-checks.mjs';

// Article Studio: technical blog articles in at most three model calls.
//   topic (server) -> brief (model, small JSON) -> draft (model, @@ text) -> checks (server)
//   -> one revision if needed (model) -> human review -> existing six-language publication.
export const CATEGORIES=['DESIGN & DIMENSIONS','MATERIALS & FINISHES','MANUFACTURING','QUALITY','PROCUREMENT'];
export const STUDIO_RULES=`Writing rules:
1. Readers are design engineers and buyers specifying non-standard metal fasteners. Write in plain, precise English for them.
2. The intro answers the reader question directly in two or three sentences. Later sections explain why, how to decide and what to put on the drawing.
3. Use sound general engineering knowledge. Name published standards (ISO, DIN, ASTM, SAE) as reference points where they apply, without claiming that any ZUFEK part conforms to them.
4. Write in a neutral voice. Do not use "we", "our" or "us". Mention ZUFEK only to state the approved company facts given below.
5. Never invent test results, customer names or cases, certifications, equipment, capacities, prices, lead times or statistics. Use a specific number only when it is a standard value or a clearly labelled illustrative example; otherwise describe the relationship.
6. Give the reader something to act on in each section: a decision rule, a comparison of options with the deciding factor, or the exact information to put on a drawing or RFQ.
7. State each condition once, in one sentence next to the claim it limits. Do not write sections or sentences about sources, evidence, what "this article" can establish, or how it was written.
8. Explain everything in your own words. Do not reproduce sentences from standards, manufacturer catalogues, competitor websites or other publications; if a standard's wording matters, name the standard and paraphrase it, quoting at most one short phrase.
9. Use the planned internal links with descriptive anchor text; link the main product page early. Use only the paths you were given, exactly as written.
10. Avoid filler such as "it is important to note", "in today's", "plays a crucial role", "delve into" and repeated summaries.
11. Length: 900 to 1600 words in the body, four to seven sections, three to five FAQ entries.`;

const ARTICLE=/^\/(blog|guides|industry-insights)\/[^/]+\/$/;
const cleanTitle=t=>String(t||'').replace(/\s*\|.*$/,'').trim();
const text=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';

export function validateBrief(raw,{linkOptions,targetPath}){
 if(!raw||typeof raw!=='object')throw Error('简报格式错误');
 const allowed=new Set(linkOptions.map(l=>l.path)),sections=(Array.isArray(raw.sections)?raw.sections:[]).map(s=>typeof s==='string'?{heading:s,covers:''}:{heading:text(s?.heading,120),covers:text(s?.covers,300)}).filter(s=>s.heading).slice(0,8);
 if(sections.length<3)throw Error('简报章节少于3个');
 const links=(Array.isArray(raw.internalLinks)?raw.internalLinks:[]).map(l=>({path:text(l?.path,200),anchor:text(l?.anchor,120)})).filter(l=>allowed.has(l.path)&&l.anchor);
 if(targetPath&&allowed.has(targetPath)&&!links.some(l=>l.path===targetPath))links.unshift({path:targetPath,anchor:cleanTitle(linkOptions.find(l=>l.path===targetPath)?.title)||'product page'});
 return {title:text(raw.title,90),primaryKeyword:text(raw.primaryKeyword,80).toLowerCase(),secondaryKeywords:(Array.isArray(raw.secondaryKeywords)?raw.secondaryKeywords:[]).map(k=>text(k,60)).filter(Boolean).slice(0,6),readerQuestion:text(raw.readerQuestion,200),searchIntent:text(raw.searchIntent,30)||'informational',shortAnswer:text(raw.shortAnswer,600),category:CATEGORIES.includes(raw.category)?raw.category:'DESIGN & DIMENSIONS',sections,faq:(Array.isArray(raw.faq)?raw.faq:[]).map(q=>text(typeof q==='string'?q:q?.question,200)).filter(Boolean).slice(0,5),internalLinks:links.slice(0,6)};
}

export async function createArticleStudio({db,ai,clock=()=>new Date(),contentDirectory='docs/content-operations',assetsFile='lib/editorial-assets.json',copyscape=createCopyscape({db,clock})}){
 await db.prepare('CREATE TABLE IF NOT EXISTS studio_jobs(id TEXT PRIMARY KEY,slot TEXT UNIQUE NOT NULL,status TEXT NOT NULL,origin TEXT NOT NULL,hint TEXT NOT NULL DEFAULT \'\',topic TEXT,brief TEXT,draft_text TEXT,article TEXT,checks TEXT,revisions INTEGER NOT NULL DEFAULT 0,model_calls INTEGER NOT NULL DEFAULT 0,ai_job_id TEXT,error TEXT,progress TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)').run();
 await db.prepare('CREATE TABLE IF NOT EXISTS studio_config(id INTEGER PRIMARY KEY,value TEXT NOT NULL)').run();
 try{await db.prepare('ALTER TABLE studio_jobs ADD COLUMN external_check TEXT').run();}catch{}
 await db.prepare("UPDATE studio_jobs SET status='failed',error='服务重启时任务正在执行；已完成的步骤已保存，可重试' WHERE status='running'").run();
 let busy=false,closed=false;const now=()=>clock().toISOString();
 let covers=null;try{covers=new Set(Object.keys(JSON.parse(await fs.readFile(assetsFile,'utf8'))));}catch{}
 const facts=async()=>{try{return await fs.readFile(path.join(contentDirectory,'COMPANY-FACTS.md'),'utf8');}catch{return '';}};
 const loadConfig=async()=>({enabled:false,days:[2],hour:10,...JSON.parse((await db.prepare('SELECT value FROM studio_config WHERE id=1').first())?.value||'{}')});
 const get=async id=>db.prepare('SELECT * FROM studio_jobs WHERE id=?').bind(id).first();
 const update=async(id,fields)=>{const keys=Object.keys(fields);await db.prepare('UPDATE studio_jobs SET '+keys.map(k=>k+'=?').join(',')+',updated_at=? WHERE id=?').bind(...keys.map(k=>fields[k]===undefined?null:typeof fields[k]==='object'&&fields[k]!==null?JSON.stringify(fields[k]):fields[k]),now(),id).run();};
 const progress=(id,stage,extra={})=>update(id,{progress:{stage,at:now(),...extra}});

 async function context(job){
  const snapshot=await ai.inventory(),pages=snapshot.pages.filter(p=>p.path);
  const drafts=(snapshot.drafts||[]).map(d=>d.path).filter(Boolean);
  const others=(await db.prepare("SELECT id,topic,article FROM studio_jobs WHERE id<>? AND status IN ('queued','running','review','blocked','approved')").bind(job.id).all()).results;
  const pendingTopics=others.map(o=>{try{const t=JSON.parse(o.topic||'{}');return t.question||t.keyword;}catch{return null;}}).filter(Boolean);
  const takenSlugs=new Set([...pages.filter(p=>ARTICLE.test(p.path)).map(p=>p.path.split('/')[2]),...drafts.map(p=>p.split('/')[2]),...others.map(o=>{try{return JSON.parse(o.article||'{}').slug;}catch{return null;}}).filter(Boolean)]);
  return {pages,pendingTopics,takenSlugs,validPaths:new Set(pages.map(p=>p.path))};
 }
 const linkOptionsFor=(pages,topic,match)=>{const words=new Set(String(topic.question||topic.keyword).toLowerCase().match(/[a-z]{4,}/g)||[]);const rank=p=>[...words].filter(w=>(p.title+' '+p.path).toLowerCase().includes(w)).length;
  const pool=pages.filter(p=>/^\/(products|capabilities|materials|blog|guides)\/[^/]+\/$/.test(p.path)||p.path==='/quality/');
  const must=['/products/'+match.product+'/',...match.processes.map(s=>'/capabilities/'+s+'/'),'/guides/rfq-checklist/'];
  return [...new Map([...must.map(m=>pool.find(p=>p.path===m)).filter(Boolean),...pool.map(p=>({p,s:rank(p)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.p)].map(p=>[p.path,{path:p.path,title:cleanTitle(p.title)}])).values()].slice(0,25);};

 async function chooseTopic(job,ctx){
  const [paa,gsc,used]=await Promise.all([readPAALibrary(db),readGSCOpportunities(db,{limit:15}),usedPAAIds(db)]);
  const candidates=topicCandidates({hint:job.hint,gsc:gsc.opportunities,paa:paa.entries,usedPAA:used,pages:ctx.pages,pendingTopics:ctx.pendingTopics});
  if(!candidates.length)throw Error('没有找到未覆盖的选题：请填写选题提示，或同步PAA/Search Console数据');
  const topic=candidates[0],match=matchPages(topic.question||topic.keyword,ctx.pages,{covers});if(topic.targetPath?.startsWith('/products/')&&(!covers||covers.has(topic.targetPath.split('/')[2])))match.product=topic.targetPath.split('/')[2];
  const related=selectRelatedPAA(paa.entries,topic);
  return {...topic,product:match.product,processes:match.processes,targetPath:'/products/'+match.product+'/',relatedQuestions:related,alternatives:candidates.slice(1,4).map(c=>({source:c.source,question:c.question||c.keyword}))};
 }
 const selectRelatedPAA=(entries,topic)=>{const words=new Set(String(topic.question||topic.keyword).toLowerCase().match(/[a-z]{4,}/g)||[]);return entries.filter(e=>[...words].some(w=>e.question.toLowerCase().includes(w))&&e.question!==topic.question).slice(0,8).map(e=>e.question);};

 async function writeBrief(job,topic,ctx,companyFacts){
  const linkOptions=linkOptionsFor(ctx.pages,topic,topic),nearby=ctx.pages.filter(p=>ARTICLE.test(p.path)).map(p=>cleanTitle(p.title)).filter(t=>isDuplicateTopic(t,[topic.question||topic.keyword])||t.toLowerCase().includes((topic.keyword||'').toLowerCase().split(' ')[0]||'#')).slice(0,20);
  const system='You plan one English technical blog article for ZUFEK. Return one JSON object only.\nApproved company facts:\n'+companyFacts+'\n'+STUDIO_RULES;
  const user={topic:{readerQuestion:topic.question,keywordHint:topic.keyword,source:topic.source},mainProductPage:topic.targetPath,internalLinkOptions:linkOptions,existingArticlesToAvoidRepeating:nearby,relatedReaderQuestions:topic.relatedQuestions,categories:CATEGORIES,
   output:{title:'Specific H1 under 70 characters that matches the reader question',primaryKeyword:'search phrase a buyer would type',secondaryKeywords:['up to 6'],readerQuestion:'one question',searchIntent:'informational',shortAnswer:'two or three sentence direct answer',category:'one of categories',sections:[{heading:'section heading',covers:'what this section decides or explains'}],faq:['3 to 5 questions not already answered by a section heading'],internalLinks:[{path:'exact path from internalLinkOptions',anchor:'descriptive anchor text'}]}};
  const raw=await ai.studioCall(job.id,'STUDIO_BRIEF',[{role:'system',content:system},{role:'user',content:JSON.stringify(user)}],1600);
  const brief=validateBrief(raw,{linkOptions,targetPath:topic.targetPath});
  if(!brief.title||!brief.primaryKeyword)throw Error('简报缺少标题或主关键词');
  if(isDuplicateTopic(brief.title,[...ctx.pages.filter(p=>ARTICLE.test(p.path)).map(p=>cleanTitle(p.title)),...ctx.pendingTopics]))throw Error('简报标题与已有文章重复：'+brief.title);
  return brief;
 }
 const draftSystem=companyFacts=>'You write one English technical blog article for ZUFEK, a custom metal screw manufacturer.\nApproved company facts (the only company claims allowed):\n'+companyFacts+'\n'+STUDIO_RULES+'\n\n'+FORMAT_GUIDE;

 function evaluate(doc,{brief,ctx,companyFacts,slug}){
  return runChecks(doc,{facts:companyFacts,pages:ctx.pages,primaryKeyword:brief.primaryKeyword,validPaths:ctx.validPaths,targetPath:brief.internalLinks[0]?.path,slug,takenSlugs:ctx.takenSlugs});
 }

 async function run(job){
  await update(job.id,{status:'running',error:null});
  try{
   const companyFacts=await facts(),ctx=await context(job);
   await progress(job.id,'TOPIC');
   const topic=job.topic?JSON.parse(job.topic):await chooseTopic(job,ctx);await update(job.id,{topic});
   await progress(job.id,'BRIEF');
   const brief=job.brief?JSON.parse(job.brief):await writeBrief(job,topic,ctx,companyFacts);await update(job.id,{brief,model_calls:(job.model_calls||0)+(job.brief?0:1)});
   let calls=(await get(job.id)).model_calls;
   await progress(job.id,'DRAFT');
   let draftText=job.draft_text;if(!draftText){draftText=await ai.studioCall(job.id,'STUDIO_TEXT_DRAFT',[{role:'system',content:draftSystem(companyFacts)},{role:'user',content:'Write the article from this brief.\n'+JSON.stringify(brief)}],8000);calls++;await update(job.id,{draft_text:draftText,model_calls:calls});}
   let doc=parseStudioText(draftText),slug=slugify(doc.title||brief.title);
   let checks=evaluate(doc,{brief,ctx,companyFacts,slug}),structure=structureProblems(doc);
   let revisions=job.revisions||0;
   if((structure.length||checks.blocking.length||checks.fixable.length)&&revisions<1){
    await progress(job.id,'REVISE',{issues:checks.blocking.length+checks.fixable.length+structure.length});
    const issues=[...structure.map(m=>({level:'fix',message:m})),...checks.blocking,...checks.fixable].map(i=>'- '+i.message+(i.excerpt?' | "'+i.excerpt+'"':'')).join('\n');
    const revised=await ai.studioCall(job.id,'STUDIO_TEXT_REVISE',[{role:'system',content:draftSystem(companyFacts)},{role:'user',content:'Revise the article below to fix every listed issue. Keep correct content unchanged, keep the same format and return the complete article.\nBrief:\n'+JSON.stringify(brief)+'\n\nIssues:\n'+issues+'\n\nArticle:\n'+draftText}],8000);
    calls++;revisions++;const next=parseStudioText(revised);
    if(!structureProblems(next).length||structureProblems(next).length<structure.length){draftText=revised;doc=next;slug=slugify(doc.title||brief.title);checks=evaluate(doc,{brief,ctx,companyFacts,slug});structure=structureProblems(doc);}
    await update(job.id,{draft_text:draftText,revisions,model_calls:calls});
   }
   const article=structure.length?null:toArticle(doc,{slug,category:brief.category,product:topic.product,processes:topic.processes,keywords:[brief.primaryKeyword,...brief.secondaryKeywords],relatedLinks:brief.internalLinks.map(l=>({path:l.path,label:l.anchor}))});
   const status=structure.length||checks.blocking.length?'blocked':'review';
   await update(job.id,{status,article,checks:{...checks,structure},progress:{stage:'DONE',at:now()},error:structure.length?structure.join('；'):null});
  }catch(e){await update(job.id,{status:'failed',error:String(e.message||e).slice(0,500)});}
 }

 async function schedule(){const c=await loadConfig();if(!c.enabled)return;const shanghai=new Date(+clock()+8*3600000);if(!c.days.includes(shanghai.getUTCDay())||shanghai.getUTCHours()<c.hour)return;
  const slot='auto:'+shanghai.toISOString().slice(0,10);await db.prepare("INSERT INTO studio_jobs(id,slot,status,origin,created_at,updated_at) VALUES(?,?,'queued','scheduled',?,?) ON CONFLICT(slot) DO NOTHING").bind(randomUUID(),slot,now(),now()).run();}
 async function tick(){if(busy||closed)return;busy=true;try{await schedule();const job=await db.prepare("SELECT * FROM studio_jobs WHERE status='queued' ORDER BY created_at LIMIT 1").first();if(job)await run(job);}finally{busy=false;}}

 // Manual edits are re-checked locally; they never trigger a model call.
 async function saveText(id,raw){const job=await get(id);if(!job||!['review','blocked'].includes(job.status))throw Error('只能修改待审核或被拦截的稿件');const brief=JSON.parse(job.brief),topic=JSON.parse(job.topic),ctx=await context(job),doc=parseStudioText(raw),structure=structureProblems(doc);const slug=job.article?JSON.parse(job.article).slug:slugify(doc.title);const checks=evaluate(doc,{brief,ctx,companyFacts:await facts(),slug});
  const article=structure.length?null:toArticle(doc,{slug,category:brief.category,product:topic.product,processes:topic.processes,keywords:[brief.primaryKeyword,...brief.secondaryKeywords],relatedLinks:brief.internalLinks.map(l=>({path:l.path,label:l.anchor}))});
  await update(id,{draft_text:raw,article,checks:{...checks,structure},status:structure.length||checks.blocking.length?'blocked':'review',error:structure.length?structure.join('；'):null});}
 // External web duplicate check (Copyscape). A result belongs to one exact draft text; edits make it stale.
 const textHash=t=>createHash('sha256').update(String(t||'')).digest('hex');
 const currentExternal=job=>{try{const e=JSON.parse(job.external_check||'null');return e?{...e,stale:e.hash!==textHash(job.draft_text)}:null;}catch{return null;}};
 async function externalCheck(id){const job=await get(id);if(!job?.draft_text||!['review','blocked'].includes(job.status))throw Error('只能检查待审核或被拦截的稿件');const result=await copyscape.check(plainText(parseStudioText(job.draft_text)));const record={hash:textHash(job.draft_text),...result};await update(id,{external_check:record});return record;}
 // Rewrite only the passages Copyscape matched; everything else stays as reviewed. One model call, at most
 // twice per task, and the external result becomes stale so it must be checked again before approval.
 async function externalRewrite(id){const job=await get(id);if(!job||!['review','blocked'].includes(job.status))throw Error('只能改写待审核或被拦截的稿件');const external=currentExternal(job);if(!external||external.stale||!external.results.length)throw Error('请先对当前正文运行外部查重');
  const rewrites=Number(JSON.parse(job.progress||'{}').externalRewrites||0);if(rewrites>=2)throw Error('已按查重结果改写2次；请人工修改重合段落');
  const passages=external.results.map(r=>r.matchedText||r.snippet).filter(t=>t&&t.trim()).slice(0,8);if(!passages.length)throw Error('查重结果没有可定位的重合文字，请人工修改');
  const companyFacts=await facts(),brief=JSON.parse(job.brief);
  const revised=await ai.studioCall(job.id,'STUDIO_TEXT_REVISE',[{role:'system',content:draftSystem(companyFacts)},{role:'user',content:'Some sentences in the article below closely match text already published on other websites. Rewrite only the sentences that correspond to the matched passages, in your own words and with the same technical meaning. Keep every other sentence, heading, link and the format exactly as they are, and return the complete article.\n\nMatched passages found on other websites:\n'+passages.map((t,i)=>(i+1)+'. '+t.replace(/\s+/g,' ')).join('\n')+'\n\nArticle:\n'+job.draft_text}],8000);
  const doc=parseStudioText(revised);if(structureProblems(doc).length)throw Error('改写结果格式不完整，未替换原稿：'+structureProblems(doc).join('；'));
  await update(id,{model_calls:(job.model_calls||0)+1,progress:{...JSON.parse(job.progress||'{}'),externalRewrites:rewrites+1}});await saveText(id,revised);void brief;}
 async function approve(id,{acknowledgeExternal=false}={}){let job=await get(id);if(!job||job.status!=='review')throw Error('只有待审核且没有拦截问题的稿件可以发布');const checks=JSON.parse(job.checks||'{}');if(checks.blocking?.length)throw Error('仍有拦截问题');const brief=JSON.parse(job.brief);
  const cs=await copyscape.load();let external=currentExternal(job);
  if(cs.mode!=='off'){if(!external||external.stale){external=await externalCheck(id);job=await get(id);}
   if(external.percent>=cs.threshold&&cs.mode==='block')throw Error(`外部查重：与网上已有内容重合${external.percent}%，超过阈值${cs.threshold}%，已禁止发布。请修改重合段落后重新查重。`);
   if(external.percent>=cs.threshold&&!acknowledgeExternal){const e=Error(`外部查重：与网上已有内容重合${external.percent}%，超过提示阈值${cs.threshold}%。请在详情中查看匹配网页，确认后再发布。`);e.confirm=true;throw e;}}
  if(external&&!external.stale)checks.metrics={...checks.metrics,externalOverlapPercent:external.percent};
  const aiJob=await ai.publishStudioArticle(JSON.parse(job.article),{studioId:id,checks:checks.metrics,keywordBrief:{primaryKeyword:brief.primaryKeyword,secondaryKeywords:brief.secondaryKeywords,readerQuestion:brief.readerQuestion,searchIntent:brief.searchIntent}});await update(id,{status:'approved',ai_job_id:aiJob});return aiJob;}

 const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
 const summary=j=>{let topic={},article={},checks={};try{topic=JSON.parse(j.topic||'{}');article=JSON.parse(j.article||'{}');checks=JSON.parse(j.checks||'{}');}catch{}return {id:j.id,status:j.status,origin:j.origin,hint:j.hint,createdAt:j.created_at,updatedAt:j.updated_at,topicSource:topic.source||null,question:topic.question||topic.keyword||null,title:article.title||null,slug:article.slug||null,blocking:checks.blocking?.length||0,fixable:checks.fixable?.length||0,review:checks.review?.length||0,metrics:checks.metrics||null,modelCalls:j.model_calls,aiJobId:j.ai_job_id,error:j.error,progress:j.progress?JSON.parse(j.progress):null};};
 // Publication progress comes from the existing six-language publisher (English first, then de, es, it, zh, fr).
 const publication=async j=>{if(j.status!=='approved'||!j.ai_job_id)return null;try{return await ai.publicationSummary(j.ai_job_id);}catch(e){return {status:'unknown',error:String(e.message||e).slice(0,200),languages:[]};}};
 const compact=p=>p?{status:p.status,phase:p.phase,error:p.error,languages:(p.languages||[]).map(({locale,status})=>({locale,status}))}:null;
 async function handle(r,action){try{if(r.method!=='GET'&&(r.method!=='POST'||r.headers.get('origin')!==new URL(r.url).origin))return json({error:'请从本站后台提交'},403);const url=new URL(r.url);
  if(action==='studio-state'&&r.method==='GET'){const jobs=(await db.prepare('SELECT * FROM studio_jobs ORDER BY created_at DESC LIMIT 50').all()).results;return json({config:await loadConfig(),copyscape:await copyscape.publicState(),busy,jobs:await Promise.all(jobs.map(async j=>({...summary(j),publication:compact(await publication(j))})))});}
  if(action==='studio-job'&&r.method==='GET'){const j=await get(url.searchParams.get('id')||'');if(!j)return json({error:'任务不存在'},404);return json({...summary(j),publication:await publication(j),externalCheck:currentExternal(j),topic:JSON.parse(j.topic||'null'),brief:JSON.parse(j.brief||'null'),draftText:j.draft_text,article:JSON.parse(j.article||'null'),checks:JSON.parse(j.checks||'null')});}
  if(r.method!=='POST')return json({error:'不支持的操作'},405);let b={};try{b=JSON.parse(await r.text()||'{}');}catch{return json({error:'请求格式错误'},400);}
  if(action==='studio-config'){const days=Array.isArray(b.days)?[...new Set(b.days.map(Number).filter(d=>Number.isInteger(d)&&d>=0&&d<=6))]:[2];const hour=Number(b.hour);if(!days.length||!Number.isInteger(hour)||hour<0||hour>23)throw Error('请填写有效的星期和小时');await db.prepare('INSERT INTO studio_config VALUES(1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').bind(JSON.stringify({enabled:b.enabled===true,days,hour})).run();return json({saved:true});}
  if(action==='studio-create'){const id=randomUUID();await db.prepare("INSERT INTO studio_jobs(id,slot,status,origin,hint,created_at,updated_at) VALUES(?,?,'queued','manual',?,?,?)").bind(id,'manual:'+id,text(b.hint,300),now(),now()).run();queueMicrotask(()=>void tick().catch(()=>{}));return json({id});}
  if(action==='studio-save-text'){await saveText(text(b.id,80),String(b.text||'').slice(0,200000));return json({saved:true});}
  if(action==='studio-approve'){try{const aiJobId=await approve(text(b.id,80),{acknowledgeExternal:b.acknowledgeExternal===true});return json({approved:true,aiJobId});}catch(e){if(e.confirm)return json({error:e.message,needsConfirmation:true},409);throw e;}}
  if(action==='studio-retry'){const j=await get(text(b.id,80));if(!j||!['failed','blocked'].includes(j.status))throw Error('只能重试失败或被拦截的任务');await update(j.id,{status:'queued',error:null,...(b.rewrite?{draft_text:null,revisions:0}:{}),...(b.newTopic?{topic:null,brief:null,draft_text:null,revisions:0}:{})});queueMicrotask(()=>void tick().catch(()=>{}));return json({queued:true});}
  if(action==='studio-copyscape-settings'){await copyscape.save(b);return json({saved:true});}
  if(action==='studio-copyscape-balance'){return json(await copyscape.balance());}
  if(action==='studio-external-check'){return json(await externalCheck(text(b.id,80)));}
  if(action==='studio-external-rewrite'){await externalRewrite(text(b.id,80));return json({rewritten:true});}
  if(action==='studio-publish-retry'){const j=await get(text(b.id,80));if(!j||j.status!=='approved'||!j.ai_job_id)throw Error('该任务还没有进入发布流程');await ai.retryPublication(j.ai_job_id);return json({queued:true});}
  if(action==='studio-discard'){const j=await get(text(b.id,80));if(!j||['running','approved'].includes(j.status))throw Error('该任务不能丢弃');await update(j.id,{status:'discarded'});return json({discarded:true});}
  return json({error:'未知操作'},404);}catch(e){return json({error:String(e.message||e).slice(0,400)},400);}}
 return {handle,tick,run,saveText,approve,close:()=>{closed=true;}};
}
