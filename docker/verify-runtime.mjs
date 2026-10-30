import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {randomBytes,randomUUID} from 'node:crypto';
import {passwordHash} from './auth.mjs';
import {openDatabase,fileBucket} from './storage.mjs';

const directory=await fs.mkdtemp(path.join(os.tmpdir(),'zufek-docker-qa-'));
// Use the configured build origin, including the Docker image's test origin.
const origin=(await fs.readFile('dist/docker/site-origin.txt','utf8')).trim();
const port=Number(process.env.RUNTIME_TEST_PORT||5193),address='http://127.0.0.1:'+port;
const password='test-only-generated-'+randomBytes(24).toString('hex');
const environment={...process.env,PUBLIC_URL:origin,HOST:'127.0.0.1',PORT:String(port),DATA_DIRECTORY:directory,ADMIN_EMAIL:'qa@example.invalid',ADMIN_PASSWORD_HASH:passwordHash(password),SESSION_SECRET:randomBytes(32).toString('hex'),MAIL_CONFIG_KEY:randomBytes(32).toString('base64'),LOCAL_SMTP_TOKEN:randomBytes(32).toString('hex'),SMTP_ALLOWED_HOSTS:'mail.example.invalid',SMTP_FROM_DOMAINS:'example.invalid',TRUST_PROXY:'0'};
let child,output='';
async function start(){child=spawn(process.execPath,['docker/server.mjs'],{env:environment,stdio:['ignore','pipe','pipe'],windowsHide:true});child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);for(let i=0;i<80;i++){if(child.exitCode!==null)throw Error('Standalone server failed: '+output);try{if((await fetch(address+'/healthz')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Health timeout: '+output);}
async function stop(){if(!child||child.exitCode!==null||child.signalCode!==null){child=null;return;}const done=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');await done;child=null;}
const request=(url,options={})=>fetch(address+url,{...options,redirect:'manual'});
let cookie;
try{
 await start();
 assert.equal((await request('/')).status,200);
 assert.equal((await request('/admin/')).status,303);
 assert.equal((await request('/api/admin/inquiries',{headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'qa@example.invalid','CF-Connecting-IP':'forged'}})).status,401);
 assert.equal((await request('/auth/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:'https://other.invalid'},body:new URLSearchParams({email:environment.ADMIN_EMAIL,password})})).status,403);
 const login=await request('/auth/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:origin},body:new URLSearchParams({email:environment.ADMIN_EMAIL,password})});assert.equal(login.status,303);assert(login.headers.get('set-cookie').includes('HttpOnly;'));assert.equal(login.headers.get('set-cookie').includes('; Secure;'),origin.startsWith('https://'));assert(login.headers.get('set-cookie').includes('SameSite=Strict'));cookie=login.headers.get('set-cookie').split(';')[0];
 const headers={Cookie:cookie,Origin:origin};assert.equal((await request('/admin/',{headers})).status,200);
 const mail=await(await request('/api/admin/mail-settings',{headers})).json();assert.equal(mail.smtpDirectSupported,true);assert.equal(mail.encryptionReady,true);assert.equal(mail.smtpPasswordSaved,false);assert.equal(mail.bridgeTokenSaved,true);assert(!JSON.stringify(mail).includes(environment.LOCAL_SMTP_TOKEN));
 const post=(action,body)=>request('/api/admin/'+action,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const pagePath='/products/shoulder-screws/';const getPage=()=>request('/api/admin/seo-page?path='+pagePath,{headers});let pageSEO=await(await getPage()).json();assert(pageSEO.schema.length>0);assert.equal((await request('/api/admin/seo-page?path='+pagePath)).status,401);
 const pagePost=b=>post('seo-page?path='+pagePath,b);const title='Shoulder screw drawing review & RFQ | ZUFEK';assert.equal((await pagePost({...pageSEO,title,description:'Specify shoulder fit, thread engagement and inspection before requesting a drawing-based quote.'})).status,200);assert((await(await request(pagePath)).text()).includes('Shoulder screw drawing review &amp; RFQ'));assert((await(await request('/llms.txt')).text()).includes('Shoulder screw drawing review & RFQ'));assert(!(await(await request('/de'+pagePath)).text()).includes('Shoulder screw drawing review'));assert.equal((await pagePost({...pageSEO,title})).status,409);pageSEO=await(await getPage()).json();assert.equal(pageSEO.title,title);assert.equal((await pagePost({...pageSEO,schema:[]})).status,400);assert.equal((await pagePost({revision:pageSEO.revision,reset:true})).status,200);assert(!(await(await request(pagePath)).text()).includes('Shoulder screw drawing review'));
 const initialSEO=await(await request('/api/admin/seo-settings',{headers})).json();assert.equal(initialSEO.revision,0);
 assert.equal((await request('/api/admin/seo-settings')).status,401);
 assert.equal((await post('seo-settings',{revision:0,robots:'User-agent: *\nDisallow: /',llmsNote:''})).status,422);
 assert.equal((await post('seo-settings',{revision:0,robots:'User-agent: *\n<script>',llmsNote:''})).status,400);
 const seoSaved=await post('seo-settings',{revision:0,robots:initialSEO.policy.robots+'\n# Local QA policy',llmsNote:'Local QA context'});assert.equal(seoSaved.status,200);
 assert((await(await request('/robots.txt')).text()).includes('# Local QA policy'));assert((await(await request('/llms.txt')).text()).includes('Local QA context'));assert((await(await request('/zh/llms-full.txt')).text()).includes('Local QA context'));
 assert.equal((await post('seo-settings',{revision:0,robots:initialSEO.policy.robots,llmsNote:''})).status,409);
 const currentSEO=await(await request('/api/admin/seo-settings',{headers})).json();assert.equal(currentSEO.history.length,1);
 assert.equal((await post('seo-restore',{revision:1,versionId:currentSEO.history[0].id})).status,200);assert(!(await(await request('/robots.txt')).text()).includes('# Local QA policy'));
 assert.equal((await post('seo-reset',{revision:2})).status,200);
 const maps=await(await request('/sitemap_index.xml')).text();assert(!/<xhtml:(?:a|span|header|div)[ >]/.test(maps));const xsl=await request('/sitemap.xsl');assert.equal(xsl.status,200);assert(xsl.headers.get('content-type').includes('xml')); assert.equal((maps.match(/<sitemap>/g)||[]).length,8);assert.equal((await request('/sitemap')).status,308);
 const savedMail=await post('mail-settings',{...mail,enabled:false,smtpHost:'mail.example.invalid',smtpUser:'qa@example.invalid',smtpPassword:'test-only-SMTP-password',bridgeToken:'',autoReply:false});assert.equal(savedMail.status,200);
 const article=await(await request('/api/admin/articles?slug=shoulder-screw-drawing-guide',{headers})).json();assert.equal(article.revision,0);article.article.title+=' Docker QA';assert.equal((await post('article-save',{article:article.article,revision:0})).status,200);assert.equal((await post('article-publish',{slug:article.article.slug,revision:1})).status,200);assert((await(await request('/blog/'+article.article.slug+'/')).text()).includes('Docker QA'));assert((await(await request('/llms-full.txt')).text()).includes('Docker QA'));assert((await(await request('/post-sitemap.xml')).text()).includes('/blog/'+article.article.slug+'/'));
 const form=new FormData(),requestKey=randomUUID();for(const [k,v]of Object.entries({requestKey,name:'Docker QA',email:'customer@example.invalid',company:'Local test only',product:'shoulder-screws',quantity:'10',message:'Local standalone inquiry durability test, no external email.',website:''}))form.set(k,v);form.set('drawing',new File(['local-drawing-fixture'],'drawing.pdf',{type:'application/pdf'}));
 const result=await(await request('/api/inquiries',{method:'POST',headers:{Origin:origin},body:form})).json();assert(result.saved&&result.id);const again=await(await request('/api/inquiries',{method:'POST',headers:{Origin:origin},body:form})).json();assert.equal(again.id,result.id);
 assert.equal((await request('/api/admin/overview',{headers:{Cookie:'__Host-zufek_admin=forged'}})).status,401);
 const overview=await(await request('/api/admin/overview',{headers})).json();assert.equal(overview.totals.total,1);
 assert.equal((await request('/api/admin/retry',{method:'POST',headers:{Cookie:cookie,Origin:'https://other.invalid'}})).status,403);
 assert.equal((await request('/sitemap.xml')).status,200);
 assert.equal((await request('/../.env.docker')).status,404);
 await stop();await start();
 const persisted=await(await request('/api/admin/overview',{headers})).json();assert.equal(persisted.totals.total,1);
 const persistedMail=await(await request('/api/admin/mail-settings',{headers})).json();assert.equal(persistedMail.smtpPasswordSaved,true);assert.equal(persistedMail.revision,1);assert(!JSON.stringify(persistedMail).includes('test-only-SMTP-password'));assert((await(await request('/blog/'+article.article.slug+'/')).text()).includes('Docker QA'));
 const backup=await request('/api/admin/backup',{headers});assert.equal(backup.status,200);assert((await backup.arrayBuffer()).byteLength>100);
 await stop();
 // Domain-free deployment uses the actual HTTP host and a compatible cookie.
 environment.PUBLIC_URL='';environment.TRUST_PROXY='0';await start();
 const httpLogin=await request('/auth/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:address,'X-Forwarded-Proto':'https'},body:new URLSearchParams({email:environment.ADMIN_EMAIL,password})});assert.equal(httpLogin.status,303);assert(httpLogin.headers.get('set-cookie').startsWith('zufek_admin='));assert(!httpLogin.headers.get('set-cookie').includes('; Secure;'));const httpCookie=httpLogin.headers.get('set-cookie').split(';')[0];assert.equal((await request('/admin/',{headers:{Cookie:httpCookie}})).status,200);
 assert((await(await request('/')).text()).includes('rel="canonical" href="'+address+'/"'));assert((await(await request('/product-sitemap.xml')).text()).includes(address+'/products/'));assert.equal((await request('/auth/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:'https://forged.example.invalid','X-Forwarded-Proto':'https'},body:new URLSearchParams({email:environment.ADMIN_EMAIL,password})})).status,403);
 await stop();environment.TRUST_PROXY='1';await start();
 const proxyRequest=(url,options={})=>new Promise((resolve,reject)=>{const req=http.request(address+url,options,res=>{const chunks=[];res.on('data',b=>chunks.push(b));res.on('end',()=>{const h=new Headers();for(const [k,v]of Object.entries(res.headers))if(v!==undefined)h.set(k,Array.isArray(v)?v.join(','):v);resolve(new Response(Buffer.concat(chunks),{status:res.statusCode,headers:h}));});});req.on('error',reject);req.end(options.body?.toString());});
 const proxyOrigin='https://proxy.example.invalid',proxyHeaders={Host:'proxy.example.invalid','X-Forwarded-Proto':'https',Origin:proxyOrigin,'Content-Type':'application/x-www-form-urlencoded'};const proxyLogin=await proxyRequest('/auth/login',{method:'POST',headers:proxyHeaders,body:new URLSearchParams({email:environment.ADMIN_EMAIL,password})});assert.equal(proxyLogin.status,303);assert(proxyLogin.headers.get('set-cookie').startsWith('__Host-zufek_admin='));assert(proxyLogin.headers.get('set-cookie').includes('; Secure;'));assert((await(await proxyRequest('/',{headers:proxyHeaders})).text()).includes('rel="canonical" href="'+proxyOrigin+'/"'));const proxyMap=await(await proxyRequest('/sitemap_index.xml',{headers:proxyHeaders})).text();assert(proxyMap.includes('<loc>'+proxyOrigin+'/product-sitemap.xml</loc>'));assert(!proxyMap.includes('<loc>http://'));await stop();
 const db=openDatabase(path.join(directory,'website.sqlite'),'drizzle');const row=await db.prepare('SELECT * FROM inquiries WHERE id=?').bind(result.id).first();assert(row.file_key);const object=await fileBucket(path.join(directory,'drawings')).get(row.file_key);assert.equal(Buffer.from(await object.arrayBuffer()).toString(),'local-drawing-fixture');db.close();
 console.log(JSON.stringify({domainFreeHTTP:true,proxyHTTPS:true,forwardedProtoIgnoredByDefault:true,productionAdapter:true,forgedIdentityRejected:true,secureAdminLogin:true,sameOriginEnforced:true,localSMTPProvisioned:true,encryptedMailSettingsPersist:true,articlePublicationPersists:true,noMailSent:true,inquiryAndAttachmentPersistAcrossRestart:true,backupAvailable:true},null,2));
}finally{await stop();if(path.dirname(directory)!==path.resolve(os.tmpdir())||!path.basename(directory).startsWith('zufek-docker-qa-'))throw Error('Unsafe test cleanup');await fs.rm(directory,{recursive:true,force:true});}
