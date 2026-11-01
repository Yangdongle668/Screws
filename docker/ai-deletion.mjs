import fs from 'node:fs/promises';import path from 'node:path';
export async function createTaskDeletion({db,directory}){
 await db.prepare('CREATE TABLE IF NOT EXISTS ai_deleted_slots(slot TEXT PRIMARY KEY)').run();
 await db.prepare('CREATE TABLE IF NOT EXISTS ai_deleted_usage(month TEXT PRIMARY KEY,requests INTEGER DEFAULT 0,tokens INTEGER DEFAULT 0,actualTokens INTEGER DEFAULT 0,heldTokens INTEGER DEFAULT 0,unknownCalls INTEGER DEFAULT 0,searchRequests INTEGER DEFAULT 0)').run();
 await db.prepare('CREATE TABLE IF NOT EXISTS ai_file_cleanup(id TEXT PRIMARY KEY)').run();
 const clean=async()=>{for(const row of (await db.prepare('SELECT id FROM ai_file_cleanup').all()).results){if(!/^[a-zA-Z0-9-]{1,100}$/.test(row.id))continue;for(const name of await fs.readdir(directory)){if(name===row.id+'.json'||name===row.id+'-checkpoint.json'||name.startsWith(row.id+'.json.')&&name.endsWith('.tmp')||name.startsWith(row.id+'-checkpoint.json.')&&name.endsWith('.tmp'))await fs.unlink(path.join(directory,name));}await db.prepare('DELETE FROM ai_file_cleanup WHERE id=?').bind(row.id).run();}};
 await clean();
 return async(id,{deleteContent=false}={})=>{
 const tables=new Set((await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()).results.map(r=>r.name));
 const jobs=(await db.prepare('SELECT id,slot,status,payload,result FROM ai_jobs').all()).results;const ids=new Set([id]);let changed=true;while(changed){changed=false;for(const j of jobs){let p={},r={};try{p=JSON.parse(j.payload||'{}');r=JSON.parse(j.result||'{}');}catch{}if(!ids.has(j.id)&&ids.has(p.sourceId||r.sourceId)){ids.add(j.id);changed=true;}}}
 const selected=jobs.filter(j=>ids.has(j.id));if(selected.some(j=>j.status==='running'))throw Error('请先取消执行中的任务，再删除');
 if(tables.has('ai_publications'))for(const j of selected){if((await db.prepare('SELECT status FROM ai_publications WHERE job_id=?').bind(j.id).first())?.status==='working')throw Error('请先停止翻译发布流程，再删除');}
 const statements=[],slugs=[];
 if(deleteContent&&tables.has('article_drafts'))for(const a of (await db.prepare('SELECT slug,payload FROM article_drafts').all()).results){let payload;try{payload=JSON.parse(a.payload);}catch{continue;}if(ids.has(payload.sourceJobId))slugs.push(a.slug);else for(const j of selected){const r=JSON.parse(j.result||'{}');if(r.handover?.slug===a.slug&&r.article&&!payload.sourceJobId){slugs.push(a.slug);break;}}}
 for(const slug of slugs){if(tables.has('ai_article_audits')&&(await db.prepare('SELECT status FROM ai_article_audits WHERE slug=?').bind(slug).first())?.status==='working')throw Error('该文章正在分析，请等待分析完成');for(const t of ['article_translations','article_versions','article_publications','article_drafts','ai_article_audits'])if(tables.has(t))statements.push(db.prepare('DELETE FROM '+t+' WHERE slug=?').bind(slug));}
 for(const j of selected){
 if(!/^[a-zA-Z0-9-]{1,100}$/.test(j.id))throw Error('任务ID无效');
 statements.push(db.prepare("INSERT INTO ai_deleted_usage(month,requests,tokens,actualTokens,heldTokens,unknownCalls) SELECT month,COUNT(*),COALESCE(SUM(charged),0),COALESCE(SUM(actual),0),COALESCE(SUM(CASE WHEN actual IS NULL THEN charged ELSE 0 END),0),COALESCE(SUM(state IN ('unknown','legacy')),0) FROM ai_calls WHERE job_id=? GROUP BY month ON CONFLICT(month) DO UPDATE SET requests=requests+excluded.requests,tokens=tokens+excluded.tokens,actualTokens=actualTokens+excluded.actualTokens,heldTokens=heldTokens+excluded.heldTokens,unknownCalls=unknownCalls+excluded.unknownCalls").bind(j.id));
 statements.push(db.prepare('INSERT INTO ai_deleted_usage(month,searchRequests) SELECT month,COUNT(*) FROM ai_search_calls WHERE job_id=? GROUP BY month ON CONFLICT(month) DO UPDATE SET searchRequests=searchRequests+excluded.searchRequests').bind(j.id));
 for(const t of ['ai_events','ai_calls','ai_search_calls','ai_publication_steps','ai_publications'])if(tables.has(t))statements.push(db.prepare('DELETE FROM '+t+' WHERE job_id=?').bind(j.id));
 if(!j.slot.startsWith('manual:'))statements.push(db.prepare('INSERT OR IGNORE INTO ai_deleted_slots VALUES(?)').bind(j.slot));
 statements.push(db.prepare('INSERT OR IGNORE INTO ai_file_cleanup VALUES(?)').bind(j.id),db.prepare('DELETE FROM ai_jobs WHERE id=?').bind(j.id));
 }
 await db.batch(statements);let cleanupPending=false;try{await clean();}catch{cleanupPending=true;}return {deleted:true,tasks:selected.length,articles:slugs,cleanupPending};
 };
}
