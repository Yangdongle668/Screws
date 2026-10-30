import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {Readable} from 'node:stream';
import {createHash} from 'node:crypto';
import {openDatabase,fileBucket} from './storage.mjs';
import {sessions,passwordValid,loginPage} from './auth.mjs';
import * as api from '../dist/docker/api.mjs';
import {parseOrigin,requestOrigin,sessionCookieName,sessionCookie} from './origin.mjs';

const root=process.cwd(),publicRoot=path.join(root,'public'),data=path.resolve(process.env.DATA_DIRECTORY||'/data');
const buildOrigin=fs.readFileSync('dist/docker/site-origin.txt','utf8').trim();
const configuredOrigin=process.env.PUBLIC_URL?parseOrigin(process.env.PUBLIC_URL):null;
if(configuredOrigin&&buildOrigin!==configuredOrigin.origin)throw Error('Build origin differs from PUBLIC_URL; rebuild the Docker image');
const email=(process.env.ADMIN_EMAIL||'').toLowerCase();
if(!/^\S+@\S+\.\S+$/.test(email)||!/^([a-f0-9]{32}):([a-f0-9]{128})$/.test(process.env.ADMIN_PASSWORD_HASH||''))throw Error('Configure ADMIN_EMAIL and ADMIN_PASSWORD_HASH');
const session=sessions(process.env.SESSION_SECRET||'');
if(Buffer.from(process.env.MAIL_CONFIG_KEY||'','base64').length!==32)throw Error('Configure persistent MAIL_CONFIG_KEY');
const db=openDatabase(path.join(data,'website.sqlite'),path.join(root,'drizzle'));
const bridgeToken=process.env.LOCAL_SMTP_TOKEN;
if(!/^[a-f0-9]{64}$/.test(bridgeToken||''))throw Error('Configure LOCAL_SMTP_TOKEN');
const smtp=api.createBridge({token:bridgeToken,authorizeTarget:async()=>{const {config}=await api.loadMailConfig();const from=config.from||config.smtpUser;const sender=String(from).match(/<([^<>]+)>$/)?.[1]||from;return {hosts:[config.smtpHost],senders:[String(sender).split('@').at(-1).toLowerCase()]};},stateDirectory:path.join(data,'smtp-receipts')});
await new Promise(resolve=>smtp.listen(0,'127.0.0.1',resolve));
Object.assign(api.env,{DB:db,BUCKET:fileBucket(path.join(data,'drawings')),ADMIN_EMAILS:email,INQUIRY_TO:process.env.INQUIRY_TO||'info@zufek.net',MAIL_CONFIG_KEY:process.env.MAIL_CONFIG_KEY,LOCAL_SMTP_ENDPOINT:'https://docker-mail.zufek.invalid',LOCAL_SMTP_TOKEN:bridgeToken,LOCAL_SMTP_FETCH:(input,options)=>{const url=new URL(String(input));if(url.origin!=='https://docker-mail.zufek.invalid'||!['/send','/diagnose'].includes(url.pathname))throw Error('Invalid local mail route');return fetch('http://127.0.0.1:'+smtp.address().port+url.pathname,options);}});
const attempts=new Map();
const cookie=request=>{const name=sessionCookieName(new URL(request.url));return (request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1);};
const types={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
const redirect=(url,extra={})=>new Response(null,{status:303,headers:{Location:url,'Cache-Control':'no-store',...extra}});
const denied=()=>Response.json({error:'Authentication required'},{status:401,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
async function handle(request,clientIp){
 const url=new URL(request.url),origin=new URL(request.url),authenticated=session.valid(cookie(request));
 if(url.pathname==='/healthz')return Response.json({healthy:db.check(),version:process.env.APP_VERSION||'local'});
 if(url.pathname==='/signin-with-chatgpt'||url.pathname==='/auth/login'){
  if(request.method==='GET')return authenticated?redirect('/admin/'):loginPage();
  if(request.method!=='POST'||request.headers.get('origin')!==origin.origin||!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return new Response('Forbidden',{status:403});
  const now=Date.now(),key=createHash('sha256').update(clientIp).digest('hex');for(const [k,v]of attempts)if(v.until<now)attempts.delete(k);
  if(attempts.size>10000||attempts.get(key)?.count>=5)return new Response('登录尝试过多，请15分钟后重试。',{status:429,headers:{'Retry-After':'900','Cache-Control':'no-store'}});
  const form=new URLSearchParams(await request.text());const valid=passwordValid(form.get('password'),process.env.ADMIN_PASSWORD_HASH)&&form.get('email')?.toLowerCase()===email;
  if(!valid){const old=attempts.get(key);attempts.set(key,{count:(old?.count||0)+1,until:old?.until||now+900000});const page=loginPage('failed');return new Response(page.body,{status:401,headers:page.headers});}
  attempts.delete(key);return redirect('/admin/',{'Set-Cookie':sessionCookie(origin,session.issue())});
 }
 if(url.pathname==='/signout-with-chatgpt'||url.pathname==='/auth/logout'){
  if(request.method==='GET')return new Response('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>退出后台</title><link rel="stylesheet" href="/docker-login.css"></head><body><main><h1>退出后台</h1><form method="post" action="/auth/logout"><button>确认退出</button></form></main></body></html>',{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
  if(request.method!=='POST'||request.headers.get('origin')!==origin.origin)return new Response('Use POST from this website',{status:405});
  return redirect('/',{'Set-Cookie':sessionCookie(origin,'',0)});
 }
 if(authenticated){request.headers.set('oai-authenticated-user-id','docker-admin');request.headers.set('oai-authenticated-user-email',email);}
 if(url.pathname.startsWith('/api/admin/')){if(!authenticated)return denied();return api.adminAPI(request,url.pathname.split('/').filter(Boolean).at(-1));}
 if(url.pathname==='/api/inquiries'&&request.method==='POST'){const result=await api.submitInquiry(request);if(result.ok)void retryMail();return result;}
 if(url.pathname==='/api/analytics'&&request.method==='POST')return api.analyticsEvent(request);
 if(url.pathname.startsWith('/api/'))return new Response('Not found',{status:404});
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(url.pathname==='/admin'||url.pathname.startsWith('/admin/')){if(!authenticated)return redirect('/auth/login');}
 const crawl=await api.crawlResponse(request);if(crawl)return crawl;
 let relative;try{relative=decodeURIComponent(url.pathname);}catch{return new Response('Bad path',{status:400});}
 if(relative.includes('\\')||relative.includes('\0')||relative.split('/').some(x=>x.startsWith('.')))return new Response('Not found',{status:404});
 const filename=path.resolve(publicRoot,'.'+relative);
 if(filename.startsWith(publicRoot+path.sep)){try{const stat=await fsp.stat(filename);if(stat.isFile()){const ext=path.extname(filename).toLowerCase();return new Response(Readable.toWeb(fs.createReadStream(filename)),{headers:{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':ext==='.webp'?'public, max-age=86400':'public, max-age=300','X-Content-Type-Options':'nosniff'}});}}catch(error){if(error.code!=='ENOENT'&&error.code!=='ENOTDIR')throw error;}}
 const page=await api.staticResponse(request);
 if(api.splitLocale(url.pathname).path==='/privacy/'||url.pathname==='/admin/'){
  let html=await page.text();
  if(api.splitLocale(url.pathname).path==='/privacy/'){const locale=api.splitLocale(url.pathname).locale;const disclosures={en:'This website runs on the configured ZUFEK server. Inquiry records and drawings use its persistent database and file storage.',de:'Diese Website läuft auf dem konfigurierten ZUFEK-Server. Anfragen und Zeichnungen werden in dessen dauerhafter Datenbank und Dateispeicher gespeichert.',es:'Este sitio funciona en el servidor configurado de ZUFEK. Las consultas y los planos se guardan en su base de datos y almacenamiento persistentes.',it:'Questo sito utilizza il server configurato di ZUFEK. Le richieste e i disegni sono conservati nel database e nello spazio di archiviazione persistenti.',zh:'本网站运行于ZUFEK配置的服务器，询盘记录和图纸保存于该服务器的持久化数据库及文件存储。',fr:'Ce site fonctionne sur le serveur configuré de ZUFEK. Les demandes et les plans sont conservés dans sa base de données et son stockage persistants.'};html=html.replace(api.translate('Website hosting, database and drawing storage use the Sites hosting infrastructure and Cloudflare services. Inquiry information is accessible to ZUFEK staff in China. If email notifications are enabled, the configured mail provider also processes delivery information and inquiry content. We do not sell inquiry information.',locale),disclosures[locale]+({en:" Inquiry information is accessible to ZUFEK staff in China. If email notifications are enabled, the configured mail provider also processes delivery information and inquiry content. We do not sell inquiry information.",de:" ZUFEK-Mitarbeiter in China können auf Anfragen zugreifen. Bei aktivierten E-Mail-Benachrichtigungen verarbeitet der konfigurierte Mailanbieter auch Zustellinformationen und Anfrageinhalte. Wir verkaufen keine Anfrageinformationen.",es:" El personal de ZUFEK en China puede acceder a las consultas. Si se activan las notificaciones por correo, el proveedor configurado también procesa los datos de entrega y el contenido. No vendemos la información de las consultas.",it:" Il personale ZUFEK in Cina può accedere alle richieste. Se le notifiche e-mail sono attive, il fornitore configurato tratta anche i dati di consegna e il contenuto. Non vendiamo le informazioni delle richieste.",zh:" ZUFEK在中国的工作人员可以访问询盘信息。启用邮件通知后，配置的邮件服务商也会处理投递信息及询盘内容。我们不出售询盘信息。",fr:" Le personnel de ZUFEK en Chine peut accéder aux demandes. Si les notifications par e-mail sont activées, le prestataire configuré traite également les données de livraison et le contenu. Nous ne vendons pas les informations des demandes."}[locale]));}
  if(url.pathname==='/admin/')html=html.replace('未配置独立调度前，重试由询盘提交或后台读取询盘触发，也可手动重试。','Docker服务每分钟重试待通知询盘，也可在后台手动重试。');
  return new Response(html,{status:page.status,headers:page.headers});
 }
 return page;
}
let mailRunning=false;
async function retryMail(){if(mailRunning)return;mailRunning=true;try{await api.retryNotifications(5);}catch{console.error('Mail retry deferred; inquiry records remain saved.');}finally{mailRunning=false;}}
const timer=setInterval(retryMail,60000);timer.unref();
const server=http.createServer(async(incoming,outgoing)=>{
 try{
  if(!incoming.url?.startsWith('/')||incoming.url.startsWith('//')){outgoing.writeHead(400);outgoing.end();return;}
  const origin=requestOrigin(incoming,configuredOrigin,process.env.TRUST_PROXY==='1');
  const target=new URL(incoming.url,origin);if(target.origin!==origin.origin)throw Error('Bad request origin');
  const headers=new Headers();for(const [name,value]of Object.entries(incoming.headers)){if(value&&!/^(oai-|cf-|x-forwarded-|x-real-ip|host|connection|transfer-encoding)/i.test(name))headers.set(name,Array.isArray(value)?value.join(','):value);}
  const ip=process.env.TRUST_PROXY==='1'?String(incoming.headers['x-forwarded-for']||incoming.socket.remoteAddress).split(',').at(-1).trim():incoming.socket.remoteAddress||'unknown';headers.set('CF-Connecting-IP',ip);headers.set('CF-IPCountry','Unknown');
  const limit=target.pathname==='/api/inquiries'?11*1024*1024:target.pathname.includes('login')?4096:target.pathname==='/api/analytics'?4096:200000;
  let length=0;const chunks=[];for await(const chunk of incoming){length+=chunk.length;if(length>limit){outgoing.writeHead(413);outgoing.end('Request too large');return;}chunks.push(chunk);}
  const request=new Request(target,{method:incoming.method,headers,...(!['GET','HEAD'].includes(incoming.method)?{body:Buffer.concat(chunks)}:{})});
  let response=await handle(request,ip);
  // Rewrite only public documents, never inquiry/API data, for domain-free HTTP
  // access and for canonical links in saved article HTML on the same build.
  const contentType=response.headers.get('Content-Type')||'';
  if(!target.pathname.startsWith('/api/')&&((contentType.includes('text/html')||contentType.includes('xml'))||contentType.includes('text/plain')&&/\/(?:robots|llms(?:-full)?)\.txt$/.test(target.pathname))&&buildOrigin!==origin.origin){const headers=new Headers(response.headers);headers.delete('Content-Length');response=new Response((await response.text()).replaceAll(buildOrigin,origin.origin),{status:response.status,headers});}
  outgoing.writeHead(response.status,Object.fromEntries(response.headers));if(incoming.method==='HEAD'||!response.body){outgoing.end();return;}const stream=Readable.fromWeb(response.body);stream.on('error',()=>outgoing.destroy());outgoing.on('close',()=>stream.destroy());stream.pipe(outgoing);
 }catch{if(!outgoing.headersSent)outgoing.writeHead(503,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});outgoing.end('服务暂时不可用，请稍后重试。');console.error('Request failed; sensitive request data was not logged.');}
});
server.requestTimeout=35000;server.headersTimeout=10000;server.keepAliveTimeout=5000;
server.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>console.log('ZUFEK production server ready.'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{clearInterval(timer);server.close(()=>{smtp.close(()=>{db.close();process.exit(0);});});setTimeout(()=>process.exit(1),20000).unref();});
