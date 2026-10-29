import {env} from 'cloudflare:workers';
import {defaultRobots,validatePolicy} from './templates.mjs';
export type SeoPolicy={robots:string;llmsNote:string};
type Version={id:string;at:string;by:string;policy:SeoPolicy};
const key='seo:policy';
export async function readSeoPolicy(){
 if(!env.DB)throw Error('网站配置数据库不可用');
 const row=await env.DB.prepare('SELECT value,revision,updated_at FROM site_settings WHERE key=?').bind(key).first<{value:string;revision:number;updated_at:string}>();
 const value=row?JSON.parse(row.value):{robots:defaultRobots,llmsNote:'',history:[]};
 return {policy:{robots:String(value.robots??defaultRobots),llmsNote:String(value.llmsNote??'')},history:(value.history??[]) as Version[],revision:row?.revision??0,updatedAt:row?.updated_at??null};
}
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function seoSettingsAPI(request:Request,action:string){
 try{
  const current=await readSeoPolicy();if(request.method==='GET'&&action==='seo-settings')return json({...current,template:defaultRobots});
  if(request.method!=='POST')return json({error:'不支持此请求方式'},405);
  const raw=await request.text();if(raw.length>40000)return json({error:'配置内容过长'},413);const body=JSON.parse(raw);
  if(body.revision!==current.revision)return json({error:'配置已被其他管理员修改，请重新载入后编辑'},409);
  const selected=action==='seo-reset'?{robots:defaultRobots,llmsNote:''}:action==='seo-restore'?current.history.find(v=>v.id===body.versionId)?.policy:body;
  if(!selected)return json({error:'历史版本不存在'},404);
  const policy={robots:typeof selected.robots==='string'?selected.robots.replaceAll('\r\n','\n').trim()+'\n':'',llmsNote:typeof selected.llmsNote==='string'?selected.llmsNote.trim():''};
  if(policy.llmsNote.length>4000)return json({error:'LLMS补充说明最多4000字符'});
  const validation=validatePolicy(policy.robots);
  if(action==='seo-preview')return json({policy,...validation});
  if(!['seo-settings','seo-reset','seo-restore'].includes(action))return json({error:'未知操作'},404);
  if(validation.rootBlock&&body.acknowledgeRootBlock!==true)return json({error:'当前规则可能屏蔽全站抓取，请勾选风险确认后保存',warnings:validation.warnings},422);
  const now=new Date().toISOString(),by=request.headers.get('oai-authenticated-user-email')??'authorized-admin';
  const history=[{id:crypto.randomUUID(),at:now,by,policy:current.policy},...current.history].slice(0,5);
  const value=JSON.stringify({...policy,history});
  const result=current.revision===0?await env.DB!.prepare('INSERT INTO site_settings (key,value,revision,updated_at,updated_by) VALUES (?,?,1,?,?) ON CONFLICT(key) DO NOTHING').bind(key,value,now,by).run():await env.DB!.prepare('UPDATE site_settings SET value=?,revision=revision+1,updated_at=?,updated_by=? WHERE key=? AND revision=?').bind(value,now,by,key,current.revision).run();
  return result.meta.changes?json({saved:true,revision:current.revision+1,...validation}):json({error:'配置发生冲突，请重新载入'},409);
 }catch(error){return json({error:error instanceof Error?error.message:'配置处理失败'},400);}
}
