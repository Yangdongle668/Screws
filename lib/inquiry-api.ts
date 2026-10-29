import {knownLocale,translate} from './i18n/runtime';
import {loadMailConfig,mailReady,mailConfigured,deliverMail,mailSettingsAPI} from './mail-settings';
import {adminAuthorized} from './admin-auth';
import {seoSettingsAPI} from './seo/settings';
export {adminAuthorized} from './admin-auth';
import {backupResponse} from './backup-api';
import {editorialAPI} from './editorial-api';
import {cleanAttribution,countAnalytics,hasAnalyticsConsent} from './analytics-api';
import { env } from 'cloudflare:workers';
import productOptions from './product-options.json';
type Inquiry={language:string;ack_notified_at:string|null;ack_attempts:number;ack_next_attempt:number;ack_error:string|null;attribution:string;assigned_to:string;next_follow_up:string;revision:number;id:string;request_key:string;name:string;email:string;company:string;product:string;quantity:string;message:string;file_key:string|null;file_name:string|null;status:string;created_at:string;notified_at:string|null;attempts:number;next_attempt:number;notification_error:string|null};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});
const db=()=>{if(!env.DB)throw new Error('Database unavailable');return env.DB;};
const fail=(error:string,status=400)=>json({error},status);
const allowedProducts=new Set([...productOptions.map(p=>p.slug),'other']);
function sameOrigin(r:Request){return r.headers.get('Origin')===new URL(r.url).origin;}
export async function retryNotifications(limit=10){
 let config;try{config=(await loadMailConfig()).config;}catch{return {processed:0,configured:false};}if(!mailConfigured(config))return {processed:0,configured:false};
 const now=Date.now(),result=await db().prepare('SELECT * FROM inquiries WHERE (notified_at IS NULL AND next_attempt<=?) OR (?=1 AND ack_notified_at IS NULL AND ack_next_attempt<=? AND created_at>=?) ORDER BY created_at LIMIT ?').bind(now,config.autoReply?1:0,now,config.autoReplySince||new Date().toISOString(),limit).all<Inquiry>();let processed=0;
 for(const r of result.results){
  if(!r.notified_at&&r.next_attempt<=now){const locked=await db().prepare('UPDATE inquiries SET next_attempt=? WHERE id=? AND notified_at IS NULL AND next_attempt<=?').bind(now+120000,r.id,now).run();if(locked.meta.changes){processed++;try{
   await deliverMail(config,{subject:`[ZUFEK RFQ ${r.id}] ${r.product}`,replyTo:r.email,idempotency:`inquiry/${r.id}`,text:`Inquiry: ${r.id}\nFrom: ${r.name}\nEmail: ${r.email}\nCompany: ${r.company}\nProduct: ${r.product}\nQuantity: ${r.quantity||'Not specified'}\n\n${r.message}\n\nDrawing: ${r.file_name||'None'}\nView records and attachments through the authorized website /admin/ page.`});
   await db().prepare('UPDATE inquiries SET notified_at=?,attempts=attempts+1,notification_error=NULL WHERE id=?').bind(new Date().toISOString(),r.id).run();
  }catch(error){const delay=Math.min(86400000,60000*2**Math.min(r.attempts,10));await db().prepare('UPDATE inquiries SET attempts=attempts+1,next_attempt=?,notification_error=? WHERE id=?').bind(Date.now()+delay,error instanceof Error?error.message.slice(0,180):'发送失败，等待重试',r.id).run();}}}
  if(config.autoReply&&r.created_at>=(config.autoReplySince||new Date().toISOString())&&!r.ack_notified_at&&r.ack_next_attempt<=now){const locked=await db().prepare('UPDATE inquiries SET ack_next_attempt=? WHERE id=? AND ack_notified_at IS NULL AND ack_next_attempt<=?').bind(now+120000,r.id,now).run();if(locked.meta.changes){try{
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(r.email.toLowerCase()+':'+new Date().toISOString().slice(0,10)));const key='ack:'+Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');const quota=await db().prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+86400000).first<{count:number}>();if((quota?.count??0)>3){await db().prepare('UPDATE inquiries SET ack_next_attempt=?,ack_error=? WHERE id=?').bind(now+86400000,'访客邮箱当日自动确认次数已达上限',r.id).run();continue;}
   await deliverMail(config,{to:[r.email],replyTo:config.to.split(',')[0].trim(),subject:translate('Your inquiry has been received',r.language)+' — '+r.id,idempotency:`inquiry/${r.id}/ack`,text:translate('Thank you for contacting ZUFEK. Your inquiry has been saved with reference {id}. Our team will review your requirements and follow up. This confirms receipt only; it is not a quotation or order acceptance. For updates, reply with this reference.',r.language,{id:r.id})+'\n\nDONGGUAN ZUFEK TECHNOLOGY CO., LTD.\nengineer@zufek.com'});
   await db().prepare('UPDATE inquiries SET ack_notified_at=?,ack_attempts=ack_attempts+1,ack_error=NULL WHERE id=?').bind(new Date().toISOString(),r.id).run();
  }catch(error){await db().prepare('UPDATE inquiries SET ack_attempts=ack_attempts+1,ack_next_attempt=?,ack_error=? WHERE id=?').bind(now+Math.min(86400000,60000*2**Math.min(r.ack_attempts,10)),error instanceof Error?error.message.slice(0,180):'自动确认发送失败',r.id).run();}}}
 }
 return {processed,configured:true};
}
export async function submitInquiry(request:Request){
 if(!sameOrigin(request))return fail('Please submit the form from this website.',403);
 if(!request.headers.get('Content-Type')?.startsWith('multipart/form-data'))return fail('Use the quotation form.',415);
 if(Number(request.headers.get('Content-Length')??0)>11*1024*1024)return fail('Submission exceeds the file size limit.',413);
 try{
  const data=await request.formData();
  const value=(key:string)=>typeof data.get(key)==='string'?String(data.get(key)).trim():'';
  if(value('website'))return fail('Submission rejected.',400);
  const key=value('requestKey');if(!/^[a-f0-9-]{36}$/i.test(key))return fail('Invalid submission reference. Reload the form.');
  const language=knownLocale(value('language'));const name=value('name'),email=value('email'),company=value('company'),product=value('product'),quantity=value('quantity'),message=value('message');
  if(!name||name.length>100||!company||company.length>160||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||/[\r\n]/.test(email)||message.length<20||message.length>12000||quantity.length>100||!allowedProducts.has(product))return fail('Check the required fields.');
  const existing=await db().prepare('SELECT id,email FROM inquiries WHERE request_key = ?').bind(key).first<{id:string;email:string}>();
  if(existing){if(existing.email!==email)return fail('Submission reference conflict. Reload the form.',409);return json({id:existing.id,saved:true});}
  const source=request.headers.get('CF-Connecting-IP')??'local';const hour=Math.floor(Date.now()/3600000);const raw=new TextEncoder().encode(source+':'+hour);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw))).map(b=>b.toString(16).padStart(2,'0')).join('');
  const count=await db().prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(hash,Date.now()+7200000).first<{count:number}>();
  if((count?.count??0)>12)return fail('Too many submissions. Please try later or email engineer@zufek.com.',429);
  await db().prepare('DELETE FROM rate_limits WHERE expires < ?').bind(Date.now()).run();
  const id='ZF-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+crypto.randomUUID().slice(0,8).toUpperCase();
  const file=data.get('drawing');let fileKey:string|null=null;let fileName:string|null=null;
  if(file instanceof File&&file.size){
   if(file.size>10*1024*1024)return fail('Drawing exceeds 10 MB. Submit without the file or use a smaller file.',413);
   const extension=file.name.split('.').pop()?.toLowerCase();
   if(!['pdf','png','jpg','jpeg','step','stp'].includes(extension??''))return fail('Unsupported drawing format. Use PDF, PNG, JPG, STEP or STP.');
   if(!env.BUCKET)return fail('Drawing storage is unavailable. Retry without the drawing, or send it by email.',503);
   fileKey=`inquiries/${id}/${crypto.randomUUID()}.${extension}`;fileName=file.name.replace(/[\r\n\x00-\x1f]/g,'').slice(0,180);
   try{await env.BUCKET.put(fileKey,await file.arrayBuffer(),{httpMetadata:{contentType:'application/octet-stream'}});}catch{return fail('Drawing upload failed. Retry, or remove the file to submit the project details first.',503);}
  }
  try{
   await db().prepare('INSERT INTO inquiries (id,request_key,name,email,company,product,quantity,message,file_key,file_name,status,created_at,attempts,next_attempt,notification_error,language) VALUES (?,?,?,?,?,?,?,?,?,?,\'new\',?,0,0,?,?)').bind(id,key,name,email,company,product,quantity,message,fileKey,fileName,new Date().toISOString(),await mailReady()?'Pending notification':'Email service not configured',language).run();
  }catch(error){
   // A timeout may have committed the row. Never remove a drawing before checking.
   let saved:{id:string;file_key:string|null;email:string}|null;
   try{saved=await db().prepare('SELECT id,file_key,email FROM inquiries WHERE request_key = ?').bind(key).first();}catch{return fail('Save confirmation was interrupted. Retry with the same form details.',503);}
   if(fileKey&&saved?.file_key!==fileKey)await env.BUCKET?.delete(fileKey).catch(()=>{});
   if(saved&&saved.email===email)return json({id:saved.id,saved:true});
   throw error;
  }
  if(hasAnalyticsConsent(request)){try{const attribution=cleanAttribution(JSON.parse(value('attribution')||'null'));if(attribution){await db().prepare('UPDATE inquiries SET attribution=? WHERE id=?').bind(JSON.stringify(attribution),id).run();await countAnalytics(request,attribution.landing,'inquiry',attribution.source||attribution.referrer||'Direct / unknown');}}catch{/* Saved inquiry is never rolled back for attribution failure. */}}
  return json({id,saved:true},201);
 }catch{return fail('The inquiry could not be confirmed. Retry with the same details, or email engineer@zufek.com.',503);}
}
export async function adminAPI(request:Request,action:string){
 if(!request.headers.get('oai-authenticated-user-id'))return fail('Sign in with an authorized team account.',401);
 if(!adminAuthorized(request))return fail('This account is not authorized. Team access must be configured by the site owner.',403);
 if(request.method!=='GET'&&!sameOrigin(request))return fail('Invalid request origin.',403);
 try{
  if(action.startsWith('seo-'))return seoSettingsAPI(request,action);
  if(action==='mail-settings'||action==='mail-test'||action==='mail-diagnose')return mailSettingsAPI(request,action);
  if(action==='backup'&&request.method==='GET')return backupResponse();
  if(action==='articles'||action.startsWith('article-'))return editorialAPI(request,action);
  if(action==='analytics'&&request.method==='GET'){
   const u=new URL(request.url),since=u.searchParams.get('days')==='7'?'-7 days':'-30 days',country=u.searchParams.get('country')??'';
   if(country&&!/^[A-Z]{2}$/.test(country))return fail('Invalid country filter.');
   const filter=country?' AND country=?':'',values=country?[since,country]:[since];
   const daily=await db().prepare("SELECT day,event,SUM(count) AS count FROM analytics_daily WHERE day>=date('now',?)"+filter+" GROUP BY day,event ORDER BY day").bind(...values).all();
   const pages=await db().prepare("SELECT path,SUM(count) AS count FROM analytics_daily WHERE event='pageview' AND day>=date('now',?)"+filter+" GROUP BY path ORDER BY count DESC LIMIT 30").bind(...values).all();
   const sources=await db().prepare("SELECT source,event,SUM(count) AS count FROM analytics_daily WHERE day>=date('now',?)"+filter+" GROUP BY source,event ORDER BY count DESC LIMIT 40").bind(...values).all();
   const countries=await db().prepare("SELECT country,SUM(count) AS count FROM analytics_daily WHERE event='pageview' AND day>=date('now',?) GROUP BY country ORDER BY count DESC LIMIT 100").bind(since).all();
   return json({daily:daily.results,pages:pages.results,sources:sources.results,countries:countries.results,country,consentedOnly:true});
  }
  if(action==='overview'&&request.method==='GET'){
   const totals=await db().prepare("SELECT COUNT(*) AS total, SUM(status='new') AS new, SUM(status='quoted') AS quoted, SUM(notified_at IS NULL) AS pending_email, SUM(next_follow_up<>'' AND next_follow_up<=date('now') AND status<>'closed') AS due FROM inquiries").first();
   return json({totals,emailConfigured:await mailReady(),user:request.headers.get('oai-authenticated-user-email'),backupConfigured:false,analyticsConfigured:true});
  }
  if(action==='inquiries'&&request.method==='GET'){
   const u=new URL(request.url);const q=(u.searchParams.get('q')??'').trim().slice(0,160);const status=u.searchParams.get('status')??'all';const page=Math.max(1,Math.min(100000,Math.floor(Number(u.searchParams.get('page'))||1)));
   if(!['all','new','contacted','quoted','closed'].includes(status))return fail('Invalid status.');
   const conditions:string[]=[];const values:string[]=[];
   if(status!=='all'){conditions.push('status = ?');values.push(status);}
   if(q){conditions.push("(instr(lower(id),lower(?))>0 OR instr(lower(company),lower(?))>0 OR instr(lower(email),lower(?))>0 OR instr(lower(name),lower(?))>0 OR instr(lower(product),lower(?))>0)");values.push(q,q,q,q,q);}
   if(u.searchParams.get('due')==='1')conditions.push("next_follow_up<>'' AND next_follow_up<=date('now') AND status<>'closed'");
   const where=conditions.length?' WHERE '+conditions.join(' AND '):'';
   const count=await db().prepare('SELECT COUNT(*) AS total FROM inquiries'+where).bind(...values).first<{total:number}>();
   const result=await db().prepare('SELECT * FROM inquiries'+where+' ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET ?').bind(...values,(page-1)*25).all<Inquiry>();
   return json({inquiries:result.results,total:count?.total??0,page,pageSize:25,emailConfigured:await mailReady()});
  }
  if(action==='inquiries'&&request.method==='PATCH'){
   const body=await request.json() as {id:string;status:string;assignedTo?:string;nextFollowUp?:string;revision?:number};
   if(!['new','contacted','quoted','closed'].includes(body.status)||typeof body.id!=='string')return fail('Invalid status or reference.');
   const current=await db().prepare('SELECT * FROM inquiries WHERE id = ?').bind(body.id).first<Inquiry>();if(!current)return fail('Inquiry not found.',404);
   const assigned=body.assignedTo??current.assigned_to;const follow=body.nextFollowUp??current.next_follow_up;
   if(typeof assigned!=='string'||assigned.length>120||typeof follow!=='string'||(follow&&!/^\d{4}-\d{2}-\d{2}$/.test(follow)))return fail('Invalid owner or follow-up date.');
   const revision=body.revision??current.revision;if(!Number.isInteger(revision))return fail('Invalid revision.');
   const result=await db().prepare('UPDATE inquiries SET status=?, assigned_to=?,next_follow_up=?,revision=revision+1 WHERE id=? AND revision=?').bind(body.status,assigned,follow,body.id,revision).run();
   return result.meta.changes?json({saved:true,revision:revision+1}):fail('This inquiry was updated by another user. Refresh before saving.',409);
  }
  if(action==='notes'&&request.method==='GET'){
   const id=new URL(request.url).searchParams.get('id');const notes=await db().prepare('SELECT * FROM inquiry_notes WHERE inquiry_id=? ORDER BY created_at,id').bind(id).all();return json({notes:notes.results});
  }
  if(action==='notes'&&request.method==='POST'){
   const body=await request.json() as {id:string;noteId:string;body:string};
   if(typeof body.body!=='string'||!body.body.trim()||body.body.length>4000||!body.id||!body.noteId||! /^[a-f0-9-]{36}$/i.test(body.noteId))return fail('Enter a note of up to 4,000 characters.');
   const row=await db().prepare('SELECT id FROM inquiries WHERE id=?').bind(body.id).first();if(!row)return fail('Inquiry not found.',404);
   await db().prepare('INSERT INTO inquiry_notes (id,inquiry_id,body,author,created_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(body.noteId,body.id,body.body.trim(),request.headers.get('oai-authenticated-user-email'),new Date().toISOString()).run();return json({saved:true});
  }
  if(action==='file'&&request.method==='GET'){
   const id=new URL(request.url).searchParams.get('id');const row=await db().prepare('SELECT file_key,file_name FROM inquiries WHERE id = ?').bind(id).first<Inquiry>();
   if(!row?.file_key||!env.BUCKET)return fail('Drawing not found.',404);
   const file=await env.BUCKET.get(row.file_key);if(!file)return fail('Drawing not found.',404);
   return new Response(file.body,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="drawing"; filename*=UTF-8''${encodeURIComponent(row.file_name??'drawing')}`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(action==='record'&&request.method==='GET'){
   const id=new URL(request.url).searchParams.get('id');
   const row=await db().prepare('SELECT * FROM inquiries WHERE id = ?').bind(id).first<Inquiry>();
   if(!row)return fail('Inquiry not found.',404);
   const {file_key,request_key,...record}=row;
   return new Response(JSON.stringify({record,notes:(await db().prepare('SELECT * FROM inquiry_notes WHERE inquiry_id=? ORDER BY created_at').bind(row.id).all()).results,drawingAvailable:!!file_key,exportedAt:new Date().toISOString()},null,2),{headers:{'Content-Type':'application/json','Content-Disposition':'attachment; filename="inquiry-record.json"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(action==='record'&&request.method==='DELETE'){
   const body=await request.json() as {id:string;confirm:string};
   if(!body.id||body.confirm!==body.id)return fail('Confirm the exact inquiry reference.');
   const row=await db().prepare('SELECT * FROM inquiries WHERE id = ?').bind(body.id).first<Inquiry>();
   if(!row)return fail('Inquiry not found.',404);
   // Remove the drawing first; retain the row if storage removal fails so it can be retried.
   if(row.file_key){if(!env.BUCKET)return fail('Drawing storage unavailable.',503);await env.BUCKET.delete(row.file_key);}
   await db().batch([db().prepare('DELETE FROM inquiry_notes WHERE inquiry_id=?').bind(body.id),db().prepare('DELETE FROM inquiries WHERE id = ?').bind(body.id)]);
   return json({deleted:true,id:body.id,deletedAt:new Date().toISOString(),scope:'Active inquiry database and drawing storage only. Previously sent email, exported copies and provider backups require separate review.'});
  }
  if(action==='retry'&&request.method==='POST')return json(await retryNotifications());
  if(action==='export'&&request.method==='GET'){
   const fields=['id','created_at','name','email','company','product','quantity','message','language','file_name','status','assigned_to','next_follow_up','notified_at','notification_error'] as const;
   // Stream in bounded batches; neutralize spreadsheet formula injection.
   const cell=(value:unknown)=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
   const encoder=new TextEncoder();const stream=new ReadableStream({async start(controller){try{controller.enqueue(encoder.encode('\uFEFF'+fields.join(',')+'\r\n'));let last='';while(true){const rows=await db().prepare('SELECT * FROM inquiries WHERE id > ? ORDER BY id LIMIT 100').bind(last).all<Inquiry>();if(!rows.results.length)break;for(const row of rows.results)controller.enqueue(encoder.encode(fields.map(f=>cell(row[f])).join(',')+'\r\n'));last=rows.results.at(-1)!.id;}controller.close();}catch(e){controller.error(e);}}});
   return new Response(stream,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="zufek-inquiries.csv"','Cache-Control':'no-store'}});
  }
  return fail('Unsupported operation.',405);
 }catch{return fail('The operation could not be completed. Please retry.',503);}
}
