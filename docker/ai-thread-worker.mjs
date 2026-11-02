import {parentPort,workerData,threadId} from 'node:worker_threads';
import {createAIService} from './ai-content.mjs';
import {validateArticle} from '../dist/docker/api.mjs';
let counter=0,service;const pending=new Map();
function rpc(op,args){const id=++counter;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});parentPort.postMessage({type:'rpc',id,op,args});});}
class Statement{constructor(sql,values=[]){this.sql=sql;this.values=values;}bind(...values){return new Statement(this.sql,values);}all(){return rpc('db',{method:'all',sql:this.sql,values:this.values});}run(){return rpc('db',{method:'run',sql:this.sql,values:this.values});}first(column){return rpc('db',{method:'first',sql:this.sql,values:this.values,column});}}
const db={prepare:sql=>new Statement(sql),batch:statements=>rpc('db',{method:'batch',statements:statements.map(({sql,values})=>({sql,values}))})};
parentPort.on('message',async message=>{if(message.type==='reply'){const wait=pending.get(message.id);if(!wait)return;pending.delete(message.id);if(message.error)wait.reject(Error(message.error));else wait.resolve(message.value);return;}if(message.type==='cancel'){service?.cancelTask(message.jobId);return;}if(message.type==='run'){try{await service.tick(message.task);parentPort.postMessage({type:'done'});}catch(error){parentPort.postMessage({type:'done',error:String(error.message).slice(0,300)});}}});
service=await createAIService({db,data:workerData.data,contentDirectory:workerData.contentDirectory,workerMode:true,normalizeArticle:validateArticle,acquireResource:key=>rpc('lock',{key}),editorialAction:async(action,body)=>{const r=await rpc('editorial',{action,body});return new Response(r.text,{status:r.status,headers:r.headers});},...(workerData.mockTransport?{transport:async(url,options)=>rpc('transport',{url,options:JSON.parse(JSON.stringify(options))})}:{}),...(workerData.clock?{clock:()=>new Date(workerData.clock)}:{})});
parentPort.postMessage({type:'ready',threadId});
