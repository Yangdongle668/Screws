import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {randomBytes} from 'node:crypto';
import {openDatabase} from './storage.mjs';import {createAIService} from './ai-content.mjs';import * as api from '../dist/docker/api.mjs';
import {parseStudioText,toArticle} from './studio-format.mjs';
// Hand-off from Article Studio to the existing publisher, against the real article validation and storage.
const directory=await fs.mkdtemp(path.join(os.tmpdir(),'zufek-studio-publish-')),db=openDatabase(path.join(directory,'t.sqlite'),'drizzle');process.env.MAIL_CONFIG_KEY=randomBytes(32).toString('base64');Object.assign(api.env,{DB:db,ADMIN_EMAILS:'qa@example.invalid'});
const editorial=(action,body)=>api.adminAPI(new Request('https://qa.example.invalid/api/admin/'+action,{method:body?'POST':'GET',headers:{Origin:'https://qa.example.invalid','Content-Type':'application/json','oai-authenticated-user-id':'qa-admin','oai-authenticated-user-email':'qa@example.invalid'},...(body?{body:JSON.stringify(body)}:{})}),action.split('?')[0]);
const service=await createAIService({db,data:directory,transport:async()=>{throw Error('no network in this test');},editorialAction:editorial,normalizeArticle:api.validateArticle,saveArticle:(r,b)=>editorial('article-save',b)});
const doc=parseStudioText(`@@TITLE
Lifting eye bolt thread engagement in tapped holes
@@META_TITLE
Lifting eye bolt thread engagement
@@META_DESCRIPTION
How much thread engagement a lifting eye bolt needs in a tapped hole, and what to put on the drawing so the supplier can quote it.
@@INTRO
Thread engagement for a lifting eye bolt depends on the tapped material and the load direction. Specify both on the drawing.
@@SECTION Engagement length
Compare the tapped material with the bolt. See [lifting eye bolts](/products/lifting-eye-bolts/).
@@SECTION Hole preparation
Specify the thread class and countersink. Use the [RFQ checklist](/guides/rfq-checklist/).
@@SECTION Load direction
Angled loads reduce capacity; follow DIN 580 for standard parts.
@@CHECKLIST
- Tapped material
- Load direction
@@FAQ
Q: Can the shoulder sit above the surface?
A: The shoulder should seat fully on a flat face.
@@END`);
const article=toArticle(doc,{slug:'lifting-eye-bolt-thread-engagement-tapped-holes',category:'DESIGN & DIMENSIONS',product:'lifting-eye-bolts',processes:['threading'],keywords:['lifting eye bolt thread engagement'],relatedLinks:[{path:'/products/lifting-eye-bolts/',label:'lifting eye bolts'},{path:'/guides/rfq-checklist/',label:'RFQ checklist'}]});
assert.doesNotThrow(()=>api.validateArticle(article),'studio articles pass the site article validation');
const saved=await editorial('article-save',{article:{...article,slug:'studio-validation-probe'},revision:0});assert.equal(saved.status,200,await saved.clone().text());
const jobId=await service.publishStudioArticle(article,{studioId:'studio-1',keywordBrief:{primaryKeyword:'lifting eye bolt thread engagement'}});
const job=await db.prepare('SELECT * FROM ai_jobs WHERE id=?').bind(jobId).first();assert.equal(job.status,'approved');assert.equal(job.type,'technical');assert.equal(JSON.parse(job.result).review.autoPublishRequested,true);
const publication=await db.prepare('SELECT * FROM ai_publications WHERE job_id=?').bind(jobId).first();assert.equal(publication.status,'queued');assert.equal(publication.slug,article.slug);
const steps=(await db.prepare('SELECT locale FROM ai_publication_steps WHERE job_id=?').bind(jobId).all()).results.map(r=>r.locale).sort();assert.deepEqual(steps,['de','es','fr','it','zh']);
await service.close();await new Promise(r=>setTimeout(r,200));await fs.rm(directory,{recursive:true,force:true}).catch(()=>{});
console.log(JSON.stringify({siteValidationPasses:true,articleSaves:true,queuedForSixLanguages:true}));
