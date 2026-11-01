import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {publicURL} from './ai-network.mjs';
export const chromePath=()=>process.env.PAA_CHROMIUM_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'/usr/bin/chromium');
export async function browserAvailable(){try{await fs.access(chromePath());return true;}catch{return false;}}
export function googlePageSnapshot(){
 const text=document.body?.innerText||'';
 const blocked=location.pathname.startsWith('/sorry/')||/unusual traffic|not a robot|reCAPTCHA/i.test(text),consent=location.hostname==='consent.google.com';
 const heading=[...document.querySelectorAll('h2,h3,[role="heading"]')].find(e=>e.textContent.trim()==='People also ask');
 let region=heading?.parentElement;for(let i=0;i<4&&region&&!region.querySelector('.related-question-pair,[jsname="Cpkphb"]');i++)region=region.parentElement;
 const pairs=[...document.querySelectorAll('.related-question-pair')];if(!pairs.length&&region)for(const e of region.querySelectorAll('[jsname="Cpkphb"]'))pairs.push(e.closest('[jsname="yEVEwb"]')||e.parentElement);
 const questions=pairs.map((box,index)=>{const button=box.querySelector('[jsname="Cpkphb"],[role="button"]'),question=(box.getAttribute('data-q')||button?.innerText||'').trim();const source=[...box.querySelectorAll('a[href]')].map(a=>({url:a.href,title:a.innerText})).find(a=>{try{return a.url.startsWith('https://')&&!/(^|\.)google\.com$/.test(new URL(a.url).hostname);}catch{return false;}});return {question,answer:(box.querySelector('.hgKElc,[data-attrid="wa:/description"]')?.innerText||'').slice(0,3000),sourceURL:source?.url||null,sourceTitle:source?.title||null,index};}).filter(q=>q.question&&q.question.length<400);
 return {blocked,consent,heading:!!heading,resultsPage:!!document.querySelector('#search,#rso'),url:location.href,title:document.title,questions};
}
// Runs only in an isolated server browser profile; never attaches to a user's browser.
export async function collectGooglePAA({keyword,country='US',language='en',signal}){
 if(!await browserAvailable())throw Error('未找到采集浏览器，请更新Docker镜像或配置PAA_CHROMIUM_PATH');
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'zufek-paa-'));let child,ws,id=0,sessionId;const pending=new Map();let deadline,abort;
 const close=()=>{for(const {reject,timer}of pending.values()){clearTimeout(timer);reject(Error('采集浏览器已关闭'));}pending.clear();try{ws?.close();}catch{}child?.kill();};
 try{
  child=spawn(chromePath(),['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--disable-extensions','--disable-sync','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--window-size=1365,900','--user-data-dir='+directory,'about:blank'],{stdio:['ignore','ignore','pipe'],windowsHide:true});
  abort=()=>close();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)throw Error('任务已取消');deadline=setTimeout(close,90000);
  const endpoint=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('采集浏览器启动超时')),15000);child.once('error',e=>{clearTimeout(timer);reject(e);});child.once('exit',()=>{clearTimeout(timer);reject(Error('采集浏览器提前退出'));});child.stderr.on('data',b=>{output=(output+b).slice(-8000);const m=output.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
  ws=new WebSocket(endpoint);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  const send=(method,params={},sid=sessionId)=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error('浏览器操作超时：'+method));},15000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params,...(sid?{sessionId:sid}:{})}));});
  ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const p=pending.get(message.id);if(p){clearTimeout(p.timer);pending.delete(message.id);message.error?p.reject(Error(message.error.message)):p.resolve(message.result);}return;}if(message.method==='Fetch.requestPaused'){const p=message.params;let allowed=false;try{const u=publicURL(p.request.url);allowed=/(^|\.)(google\.com|gstatic\.com|googleusercontent\.com)$/.test(u.hostname);}catch{}void send(allowed?'Fetch.continueRequest':'Fetch.failRequest',{requestId:p.requestId,...(!allowed?{errorReason:'BlockedByClient'}:{})},message.sessionId).catch(()=>{});}});
  ws.addEventListener('close',()=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('采集连接已关闭'));}pending.clear();});
  const target=await send('Target.createTarget',{url:'about:blank'},null);sessionId=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;await send('Page.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  const evaluate=async(expression)=>{const response=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(response.exceptionDetails)throw Error('页面读取失败：'+(response.exceptionDetails.exception?.description||response.exceptionDetails.text).slice(0,350));return response.result?.value;};
  const url=new URL('https://www.google.com/search');url.search=new URLSearchParams({q:keyword,gl:country.toLowerCase(),hl:language,pws:'0'});await send('Page.navigate',{url:url.href});
  const snapshot=()=>evaluate('('+googlePageSnapshot.toString()+')()');
  let observed;for(let n=0;n<12;n++){if(signal?.aborted)throw Error('任务已取消');observed=await snapshot();if(observed?.blocked||observed?.consent||observed?.questions.length)break;await new Promise(r=>setTimeout(r,800));}
  if(!observed)throw Error('未取得搜索页面');const found=new Map();const retain=()=>{for(const q of observed.questions){const key=q.question.toLowerCase();const old=found.get(key);found.set(key,{...old,...q,depth:old?.depth||1});}};retain();
  if(!observed.blocked&&!observed.consent){for(let n=0;n<Math.min(observed.questions.length,4);n++){await evaluate(`(()=>{const buttons=[...document.querySelectorAll('.related-question-pair [jsname="Cpkphb"],.related-question-pair [role="button"]')];const b=buttons[${n}];if(b&&b.getAttribute('aria-expanded')!=='true')b.click();})()`);await new Promise(r=>setTimeout(r,1200));observed=await snapshot();if(observed.blocked||observed.consent)break;for(const q of observed.questions){const key=q.question.toLowerCase(),old=found.get(key);found.set(key,{...old,...q,depth:old?.depth||2});}}}
  if(found.size)await evaluate(`document.querySelector('.related-question-pair')?.scrollIntoView({block:'center'})`);
  const screenshot=Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64');const status=observed.blocked?'blocked':observed.consent?'consent_required':found.size?'success':observed.heading?'parser_changed':observed.resultsPage?'no_paa':'unrecognized_page';
  return {status,searchURL:url.href,finalURL:observed.url,questions:[...found.values()].slice(0,20),screenshot,device:'desktop',extractionVersion:1};
 }finally{clearTimeout(deadline);signal?.removeEventListener('abort',abort);close();if(child&&child.exitCode===null&&child.signalCode===null)await Promise.race([new Promise(r=>child.once('exit',r)),new Promise(r=>setTimeout(r,3000))]);if(path.dirname(directory)!==path.resolve(os.tmpdir())||!path.basename(directory).startsWith('zufek-paa-'))throw Error('Unsafe browser profile cleanup');await fs.rm(directory,{recursive:true,force:true}).catch(()=>{});}
}
