import {publicRequest} from './ai-network.mjs';
export async function collectSerpPAA({keyword,country='US',language='en',apiKey,signal,transport=publicRequest}){
 if(!apiKey)throw Error('请先在PAA后台保存SerpApi密钥');
 const url=new URL('https://serpapi.com/search.json');url.search=new URLSearchParams({engine:'google',q:keyword,gl:country.toLowerCase(),hl:language,device:'desktop',api_key:apiKey});
 let response;try{response=await transport(url.href,{signal,timeout:60000,limit:3000000});}catch{throw Error('SerpApi连接失败或超时，请检查服务器网络；本次不会自动重试');}
 if(response.status!==200)throw Error(response.status===401?'SerpApi密钥无效':response.status===429?'SerpApi额度或请求频率受限':'SerpApi请求失败（HTTP '+response.status+'）');
 let body;try{body=JSON.parse(response.text);}catch{throw Error('SerpApi返回了无效JSON');}
 if(body.error)throw Error('SerpApi未完成搜索，请检查账户额度及后台状态');
 if(body.search_metadata?.status!=='Success')throw Error('SerpApi搜索尚未成功完成');
 const items=body.related_questions;if(items!==undefined&&!Array.isArray(items))throw Error('SerpApi related_questions结构变化');
 const questions=(items||[]).filter(q=>typeof q.question==='string'&&q.question.trim()).slice(0,20).map(q=>({question:q.question.trim(),answer:String(q.snippet||'').slice(0,3000),sourceURL:safe(q.link),sourceTitle:String(q.title||''),depth:1}));
 if(items?.length&&!questions.length)throw Error('SerpApi问题字段无法识别');
 const search=new URL('https://www.google.com/search');search.search=new URLSearchParams({q:keyword,gl:country.toLowerCase(),hl:language,pws:'0'});
 return {status:questions.length?'success':'no_paa',questions,searchURL:search.href,provider:'serpapi',provenance:'google_serpapi_paa',searchId:String(body.search_metadata?.id||'').slice(0,150),extractionVersion:1};
}
function safe(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
