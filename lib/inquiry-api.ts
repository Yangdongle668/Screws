import { env } from 'cloudflare:workers';
type Inquiry={id:string;request_key:string;name:string;email:string;company:string;product:string;quantity:string;message:string;file_key:string|null;file_name:string|null;status:string;created_at:string;notified_at:string|null;attempts:number;next_attempt:number;notification_error:string|null};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});
const db=()=>{if(!env.DB)throw new Error('Database unavailable');return env.DB;};
const fail=(error:string,status=400)=>json({error},status);
const allowedProducts=new Set(['custom-screws','shoulder-screws','captive-screws','special-head-screws','other']);
export function adminAuthorized(request:Request){
 const id=request.headers.get('oai-authenticated-user-id');const email=request.headers.get('oai-authenticated-user-email')?.toLowerCase();
 if(!id||!email)return false;
 if(import.meta.env.DEV&&id==='local_seedy'&&email==='seedy@sites.test')return true;
 return (env.ADMIN_EMAILS??'').toLowerCase().split(',').map(x=>x.trim()).includes(email);
}
function sameOrigin(r:Request){return r.headers.get('Origin')===new URL(r.url).origin;}
export async function retryNotifications(limit=10){
 if(!env.RESEND_API_KEY||!env.MAIL_FROM||!env.INQUIRY_TO)return {processed:0,configured:false};
 const now=Date.now();const result=await db().prepare('SELECT * FROM inquiries WHERE notified_at IS NULL AND next_attempt <= ? ORDER BY created_at LIMIT ?').bind(now,limit).all<Inquiry>();
 let processed=0;
 for(const r of result.results){
  const locked=await db().prepare('UPDATE inquiries SET next_attempt = ? WHERE id = ? AND notified_at IS NULL AND next_attempt <= ?').bind(now+120000,r.id,now).run();
  if(!locked.meta.changes)continue;
  processed++;
  try{
   const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`inquiry/${r.id}`},body:JSON.stringify({from:env.MAIL_FROM,to:[env.INQUIRY_TO],reply_to:r.email,subject:`[ZUFEK RFQ ${r.id}] ${r.product}`,text:`Inquiry: ${r.id}\nFrom: ${r.name}\nEmail: ${r.email}\nCompany: ${r.company}\nProduct: ${r.product}\nQuantity: ${r.quantity||'Not specified'}\n\n${r.message}\n\nDrawing: ${r.file_name||'None'}\nView records and attachments through the authorized website /admin/ page.`}),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error('Email provider returned '+response.status);
   await db().prepare('UPDATE inquiries SET notified_at = ?, attempts = attempts + 1, notification_error = NULL WHERE id = ?').bind(new Date().toISOString(),r.id).run();
  }catch{
   const delay=Math.min(86400000,60000*2**Math.min(r.attempts,10));
   await db().prepare('UPDATE inquiries SET attempts = attempts + 1, next_attempt = ?, notification_error = ? WHERE id = ?').bind(Date.now()+delay,'Delivery request failed; retry pending',r.id).run();
  }
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
  const name=value('name'),email=value('email'),company=value('company'),product=value('product'),quantity=value('quantity'),message=value('message');
  if(!name||name.length>100||!company||company.length>160||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||/[\r\n]/.test(email)||message.length<20||message.length>12000||quantity.length>100||!allowedProducts.has(product)||value('consent')!=='on')return fail('Check the required fields and privacy consent.');
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
   await db().prepare('INSERT INTO inquiries (id,request_key,name,email,company,product,quantity,message,file_key,file_name,status,created_at,attempts,next_attempt,notification_error) VALUES (?,?,?,?,?,?,?,?,?,?,\'new\',?,0,0,?)').bind(id,key,name,email,company,product,quantity,message,fileKey,fileName,new Date().toISOString(),env.RESEND_API_KEY&&env.MAIL_FROM?'Pending notification':'Email service not configured').run();
  }catch(error){
   // A timeout may have committed the row. Never remove a drawing before checking.
   let saved:{id:string;file_key:string|null;email:string}|null;
   try{saved=await db().prepare('SELECT id,file_key,email FROM inquiries WHERE request_key = ?').bind(key).first();}catch{return fail('Save confirmation was interrupted. Retry with the same form details.',503);}
   if(fileKey&&saved?.file_key!==fileKey)await env.BUCKET?.delete(fileKey).catch(()=>{});
   if(saved&&saved.email===email)return json({id:saved.id,saved:true});
   throw error;
  }
  return json({id,saved:true},201);
 }catch{return fail('The inquiry could not be confirmed. Retry with the same details, or email engineer@zufek.com.',503);}
}
export async function adminAPI(request:Request,action:string){
 if(!request.headers.get('oai-authenticated-user-id'))return fail('Sign in with an authorized team account.',401);
 if(!adminAuthorized(request))return fail('This account is not authorized. Team access must be configured by the site owner.',403);
 if(request.method!=='GET'&&!sameOrigin(request))return fail('Invalid request origin.',403);
 try{
  if(action==='inquiries'&&request.method==='GET'){
   const result=await db().prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 200').all<Inquiry>();
   return json({inquiries:result.results,emailConfigured:!!(env.RESEND_API_KEY&&env.MAIL_FROM&&env.INQUIRY_TO)});
  }
  if(action==='inquiries'&&request.method==='PATCH'){
   const body=await request.json() as {id:string;status:string};if(!['new','contacted','quoted','closed'].includes(body.status))return fail('Invalid status.');
   const result=await db().prepare('UPDATE inquiries SET status = ? WHERE id = ?').bind(body.status,body.id).run();return result.meta.changes?json({saved:true}):fail('Inquiry not found.',404);
  }
  if(action==='file'&&request.method==='GET'){
   const id=new URL(request.url).searchParams.get('id');const row=await db().prepare('SELECT file_key,file_name FROM inquiries WHERE id = ?').bind(id).first<Inquiry>();
   if(!row?.file_key||!env.BUCKET)return fail('Drawing not found.',404);
   const file=await env.BUCKET.get(row.file_key);if(!file)return fail('Drawing not found.',404);
   return new Response(file.body,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="drawing"; filename*=UTF-8''${encodeURIComponent(row.file_name??'drawing')}`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(action==='retry'&&request.method==='POST')return json(await retryNotifications());
  if(action==='export'&&request.method==='GET'){
   const fields=['id','created_at','name','email','company','product','quantity','message','file_name','status','notified_at','notification_error'] as const;
   // Stream in bounded batches; neutralize spreadsheet formula injection.
   const cell=(value:unknown)=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
   const encoder=new TextEncoder();const stream=new ReadableStream({async start(controller){try{controller.enqueue(encoder.encode('\uFEFF'+fields.join(',')+'\r\n'));let last='';while(true){const rows=await db().prepare('SELECT * FROM inquiries WHERE id > ? ORDER BY id LIMIT 100').bind(last).all<Inquiry>();if(!rows.results.length)break;for(const row of rows.results)controller.enqueue(encoder.encode(fields.map(f=>cell(row[f])).join(',')+'\r\n'));last=rows.results.at(-1)!.id;}controller.close();}catch(e){controller.error(e);}}});
   return new Response(stream,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="zufek-inquiries.csv"','Cache-Control':'no-store'}});
  }
  return fail('Unsupported operation.',405);
 }catch{return fail('The operation could not be completed. Please retry.',503);}
}
