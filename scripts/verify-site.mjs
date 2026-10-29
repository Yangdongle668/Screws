import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const origin=process.env.SITE_TEST_ORIGIN||'http://127.0.0.1:5173';
const pages=JSON.parse(readFileSync('lib/generated-pages.json','utf8'));
const options=JSON.parse(readFileSync('lib/product-options.json','utf8'));
const titles=new Set();
let checked=0;
for(const [url,html] of Object.entries(pages)){
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,url+' must have one h1');
 const title=html.match(/<title>(.*?)<\/title>/)[1];assert(!titles.has(title),'Duplicate title: '+title);titles.add(title);
 for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))JSON.parse(match[1]);
 assert(!/href="\/[^"?]*\.html(?:["?])/.test(html),'Internal HTML suffix found');
 for(const m of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
  if(!m[1].endsWith('/'))continue;
  assert(pages[m[1]],`${url} links to missing ${m[1]}`);
 }
 const r=await fetch(origin+url);assert.equal(r.status,url.endsWith('/404/')?404:200,url);checked++;
}
for(const option of options){assert(pages[`/products/${option.slug}/`],option.slug+' missing page');assert(pages['/request-a-quote/'].includes(`value="${option.slug}"`),option.slug+' missing RFQ option');}
const reachable=new Set(['/']);const pending=['/'];while(pending.length){const url=pending.shift();for(const match of pages[url].matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){if(pages[match[1]]&&!reachable.has(match[1])){reachable.add(match[1]);pending.push(match[1]);}}}
for(const url of Object.keys(pages))if(!['/admin/','/404/'].includes(url)&&!url.endsWith('/404/'))assert(reachable.has(url),'Orphan page: '+url);
const slash=await fetch(origin+'/products',{redirect:'manual'});assert.equal(slash.status,308);assert(slash.headers.get('location').endsWith('/products/'));
assert.equal((await fetch(origin+'/missing-page/')).status,404);
assert.equal((await fetch(origin+'/api/admin/inquiries')).status,401);
const spoof=await fetch(origin+'/api/admin/inquiries',{headers:{'oai-authenticated-user-id':'local_seedy','oai-authenticated-user-email':'seedy@sites.test'}});assert.equal(spoof.status,401,'local auth headers must be stripped');
const key=crypto.randomUUID();
function form({drawing=true,message='LOCAL QA ONLY: please ignore this test inquiry.',requestKey=key}={}){const d=new FormData();Object.entries({name:'Local QA',email:'qa@example.invalid',company:'=LOCAL QA',product:'shoulder-screws',quantity:'50',message,consent:'on',requestKey}).forEach(([k,v])=>d.set(k,v));if(drawing)d.set('drawing',new Blob(['%PDF-1.4\nLOCAL QA TEST\n%%EOF'],{type:'application/pdf'}),'qa-drawing.pdf');return d;}
assert.equal((await fetch(origin+'/api/inquiries',{method:'POST',headers:{Origin:'https://different.invalid'},body:form()})).status,403);
assert.equal((await fetch(origin+'/api/inquiries',{method:'POST',headers:{Origin:origin},body:form({message:'short'})})).status,400);
const bad=form({drawing:false});bad.set('drawing',new Blob(['test']),'test.exe');assert.equal((await fetch(origin+'/api/inquiries',{method:'POST',headers:{Origin:origin},body:bad})).status,400);
const large=form({drawing:false});large.set('drawing',new Blob([new Uint8Array(10*1024*1024+1)]),'large.pdf');assert.equal((await fetch(origin+'/api/inquiries',{method:'POST',headers:{Origin:origin},body:large})).status,413);
const submit=await fetch(origin+'/api/inquiries',{method:'POST',headers:{Origin:origin},body:form()});const result=await submit.json();assert.equal(submit.status,201,JSON.stringify(result));assert(result.id.startsWith('ZF-'));
const duplicate=await fetch(origin+'/api/inquiries',{method:'POST',headers:{Origin:origin},body:form()});assert.equal((await duplicate.json()).id,result.id,'Retry must return saved id');
const added=form({drawing:false,requestKey:crypto.randomUUID()});added.set('product','hollow-screws');added.delete('consent');const addedResponse=await fetch(origin+'/api/inquiries',{method:'POST',headers:{Origin:origin},body:added});assert.equal(addedResponse.status,201,'New product family must be accepted by the API');
const sign=await fetch(origin+'/signin-with-chatgpt?return_to=/admin/',{redirect:'manual'});const cookie=sign.headers.get('set-cookie')?.split(';')[0];assert(cookie,'local sign-in cookie');
const rowsResponse=await fetch(origin+'/api/admin/inquiries',{headers:{Cookie:cookie}});const rows=await rowsResponse.json();assert.equal(rowsResponse.status,200,JSON.stringify(rows));assert.equal(rows.emailConfigured,false);assert.equal(rows.inquiries.filter(x=>x.id===result.id).length,1);
const drawing=await fetch(origin+'/api/admin/file?id='+result.id,{headers:{Cookie:cookie}});assert.equal(drawing.status,200);assert.equal(await drawing.text(),'%PDF-1.4\nLOCAL QA TEST\n%%EOF');assert(drawing.headers.get('content-disposition').includes('attachment'));
const patch=await fetch(origin+'/api/admin/inquiries',{method:'PATCH',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:result.id,status:'contacted'})});assert.equal(patch.status,200);
const after=await(await fetch(origin+'/api/admin/inquiries',{headers:{Cookie:cookie}})).json();assert.equal(after.inquiries.find(x=>x.id===result.id).status,'contacted');
const snapshot=after.inquiries.find(x=>x.id===result.id);
const follow=await fetch(origin+'/api/admin/inquiries',{method:'PATCH',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:result.id,status:'quoted',assignedTo:'QA Engineer',nextFollowUp:'2026-10-30',revision:snapshot.revision})});assert.equal(follow.status,200);
const conflict=await fetch(origin+'/api/admin/inquiries',{method:'PATCH',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:result.id,status:'closed',revision:snapshot.revision})});assert.equal(conflict.status,409,'Stale edits must not overwrite');
const noteId=crypto.randomUUID();const noteOptions={method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:result.id,noteId,body:'Local QA follow-up note <script>test</script>'})};
assert.equal((await fetch(origin+'/api/admin/notes',noteOptions)).status,200);assert.equal((await fetch(origin+'/api/admin/notes',noteOptions)).status,200);
const notes=await(await fetch(origin+'/api/admin/notes?id='+result.id,{headers:{Cookie:cookie}})).json();assert.equal(notes.notes.length,1,'Note retry must not duplicate');assert(notes.notes[0].body.includes('<script>'));
assert.equal((await fetch(origin+'/api/admin/notes?id='+result.id)).status,401);
assert.equal((await fetch(origin+'/api/admin/overview')).status,401);
const summary=await(await fetch(origin+'/api/admin/overview',{headers:{Cookie:cookie}})).json();assert(summary.totals.total>0);assert.equal(summary.analyticsConfigured,true);
const searched=await(await fetch(origin+'/api/admin/inquiries?q='+encodeURIComponent(result.id)+'&status=quoted',{headers:{Cookie:cookie}})).json();assert.equal(searched.total,1);assert.equal(searched.inquiries[0].assigned_to,'QA Engineer');
const unmatched=await(await fetch(origin+'/api/admin/inquiries?q='+encodeURIComponent(result.id)+'&status=closed',{headers:{Cookie:cookie}})).json();assert.equal(unmatched.total,0);
const csv=await(await fetch(origin+'/api/admin/export',{headers:{Cookie:cookie}})).text();assert(csv.includes("'=LOCAL QA"),'CSV must neutralize formula strings');
const retry=await(await fetch(origin+'/api/admin/retry',{method:'POST',headers:{Cookie:cookie,Origin:origin}})).json();assert.equal(retry.configured,false);assert.equal(retry.processed,0);
const exported=await fetch(origin+'/api/admin/record?id='+result.id,{headers:{Cookie:cookie}});assert.equal(exported.status,200);const record=await exported.json();assert.equal(record.record.id,result.id);assert(!('file_key' in record.record));
const erase=(headers,confirm)=>fetch(origin+'/api/admin/record',{method:'DELETE',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({id:result.id,confirm})});
assert.equal((await erase({Origin:origin},result.id)).status,401);
assert.equal((await erase({Cookie:cookie,Origin:'https://untrusted.invalid'},result.id)).status,403);
assert.equal((await erase({Cookie:cookie,Origin:origin},'wrong-reference')).status,400);
assert.equal((await erase({Cookie:cookie,Origin:origin},result.id)).status,200);
assert.equal((await fetch(origin+'/api/admin/record?id='+result.id,{headers:{Cookie:cookie}})).status,404);
assert.equal((await fetch(origin+'/api/admin/file?id='+result.id,{headers:{Cookie:cookie}})).status,404);
console.log(JSON.stringify({pages:checked,cleanUrls:true,internalLinks:true,authorization:true,validation:true,fileLimits:true,durableSave:true,attachmentDownload:true,idempotentRetry:true,statusUpdate:true,csvEscaping:true,recordExportAndErasure:true,followUpNotes:true,searchAndFilters:true,optimisticConcurrency:true,email:'not configured; no messages sent',testInquiry:result.id},null,2));
