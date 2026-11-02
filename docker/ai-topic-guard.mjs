import {createHash} from 'node:crypto';

// These are editorial screening signals, not proof of semantic equivalence or SEO scores.
const stop=new Set('a an the and or for to of in on at by with from is are be as it this that how what when why which should can do does your you we our new existing article blog guide technical custom non standard metal screw screws fastener fasteners drawing drawings specify specification'.split(' '));
const aliases={underheads:'underhead',undercuts:'undercut',transitions:'transition',zones:'zone',threads:'thread',requirements:'requirement',inspection:'inspect',inspecting:'inspect',acceptance:'accept',accepting:'accept',fixtures:'fixture',materials:'material',coatings:'coating',selecting:'select',selection:'select',choosing:'select',choose:'select'};
export const topicWords=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/\|\s*zufek.*$/,'').match(/[a-z0-9]+/g)?.filter(w=>w.length>2&&!stop.has(w)).map(w=>aliases[w]||(w.length>4&&w.endsWith('s')?w.slice(0,-1):w))||[];
const key=value=>[...new Set(topicWords(value))].sort().join(' ');
const body=a=>[a?.intro,...(a?.sections||[]).map(s=>s[1]),...(a?.checklist||[]),a?.example].filter(Boolean).join('\n\n');
const shingles=value=>{const w=topicWords(value),s=new Set();for(let i=0;i<w.length-4;i++)s.add(w.slice(i,i+5).join(' '));return s;};
const intersection=(a,b)=>[...a].filter(x=>b.has(x)).length;
function phraseMatch(a,b){const x=new Set(topicWords(a)),y=new Set(topicWords(b)),n=intersection(x,y);if(Math.min(x.size,y.size)<2)return 0;if(key(a)===key(b))return 1;return n>=3&&n/Math.max(x.size,y.size)>=.72?n/Math.max(x.size,y.size):0;}
export function topicDescriptor({article,brief,intent,path,action='new',bodyText}={}){return {action,path:path||article?.path||null,title:article?.title||'',primaryKeyword:brief?.primaryKeyword||'',readerQuestion:brief?.readerQuestion||intent||'',intent:intent||'',bodyText:bodyText||body(article)};}
export function topicOverlap(a,b){
 const xs=[a.title,a.primaryKeyword,a.readerQuestion,a.intent].filter(Boolean),ys=[b.title,b.primaryKeyword,b.readerQuestion,b.intent].filter(Boolean);let score=0;for(const x of xs)for(const y of ys)score=Math.max(score,phraseMatch(x,y));
 if(score>=.72)return {kind:'similar_intent',score};
 if(topicWords(a.bodyText).length>=100&&topicWords(b.bodyText).length>=100){const x=shingles(a.bodyText),y=shingles(b.bodyText),common=intersection(x,y),containment=common/Math.max(1,Math.min(x.size,y.size));if(common>=40&&containment>=.82)return {kind:'similar_body',score:containment};}
 return null;
}
export function nearbyTopics(candidate,records,{jobId,targetPath}={}){const words=t=>new Set(topicWords([t.title,t.primaryKeyword,t.readerQuestion,t.intent].join(' '))),a=words(candidate);return records.filter(r=>r.sourceJobId!==jobId&&(!targetPath||r.path!==targetPath)).map(r=>{const b=words(r),n=intersection(a,b);return {...r,similarity:n>=2?n/Math.sqrt(a.size*b.size):0};}).filter(r=>r.similarity>=.38).sort((a,b)=>b.similarity-a.similarity).slice(0,3);}
export const topicFingerprint=r=>createHash('sha256').update(JSON.stringify([r.sourceJobId,r.path,r.title,r.primaryKeyword,r.readerQuestion,r.intent,r.bodyText])).digest('hex');
export function findTopicConflict(candidate,records,{jobId,targetPath}={}){for(const record of records){if(record.sourceJobId===jobId)continue;if(targetPath&&record.path===targetPath&&!record.pending)continue;const match=targetPath&&record.path===targetPath?{kind:'pending_update',score:1}:topicOverlap(candidate,record);if(match)return {path:record.path||null,title:record.title,jobId:record.sourceJobId||null,...match};}return null;}
export function updateDifference(before,after){
 const pieces=a=>[...(a.intro?[['Introduction',a.intro]]:[]),...(a.sections||[]),...(a.checklist?.length?[['Checklist',a.checklist.join('\n')]]:[]),...(a.example?[['Example',a.example]]:[])];
 const normalized=s=>String(s).replace(/\s+/g,' ').trim();
 const quantities=s=>String(s).match(/\d+(?:[.,]\d+)?/g)||[];
 const qualifications=s=>String(s).toLowerCase().match(/\b(?:must|shall|may|might|never|always|only|not|except|unless)\b/g)||[];
 const old=pieces(before),next=pieces(after),original=shingles(body(before));const changes=next.flatMap(([heading,text])=>{const prior=old.find(([h])=>h===heading)?.[1]||'';if(normalized(text)===normalized(prior))return [];const words=topicWords(text),novel=shingles(text),added=[...novel].filter(s=>!original.has(s)).length;const correctionCandidate=!!prior&&(JSON.stringify(quantities(prior))!==JSON.stringify(quantities(text))||JSON.stringify(qualifications(prior))!==JSON.stringify(qualifications(text)));return [{heading,before:prior,after:text,novelWords:Math.min(words.length,added+4),novelShingles:added,correctionCandidate}];});
 const addedWords=changes.reduce((n,c)=>n+(c.novelShingles?c.novelWords:0),0),oldWords=topicWords(body(before)).length,minimum=Math.min(60,Math.max(12,Math.ceil(oldWords*.1)));
 const removed=old.filter(([h])=>!next.some(([n])=>n===h)).map(([heading,text])=>({heading,before:text}));
 return {substantial:addedWords>=minimum||changes.some(c=>c.correctionCandidate)||removed.some(c=>c.before.trim().length>=30),addedWords,minimum,changes,removed,baselineHash:createHash('sha256').update(body(before)).digest('hex'),candidateHash:createHash('sha256').update(body(after)).digest('hex'),method:'paragraph_and_five_word_shingle_comparison'};
}
export function recentUpdate(snapshot,targetPath,{days=30,now=new Date(),override=false}={}){if(override||!days)return null;const row=snapshot.pages.find(p=>p.path===targetPath),at=row?.modifiedAt||row?.publishedAt;if(!at||!Number.isFinite(Date.parse(at)))return null;if(+now-Date.parse(at)<days*86400000)return {path:targetPath,modifiedAt:at,days};return null;}

export async function completedTopicJobs(db){
 const tables=new Set((await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()).results.map(r=>r.name)),ids=new Set();
 const workflows=new Map(tables.has('ai_publications')?(await db.prepare('SELECT job_id,status FROM ai_publications').all()).results.map(r=>[r.job_id,r.status]):[]);for(const [id,status]of workflows)if(status==='published')ids.add(id);
 const queries=[['article_publications',"SELECT json_extract(metadata,'$.sourceJobId') AS job_id FROM article_publications WHERE state='published'"],['article_release_history',"SELECT DISTINCT json_extract(snapshot,'$.article.sourceJobId') AS job_id FROM article_release_history WHERE json_extract(snapshot,'$.state')='published'"]];
 // A live English page alone must not release a queued or failed six-language workflow.
 for(const [table,query]of queries)if(tables.has(table))for(const row of (await db.prepare(query).all()).results)if(row.job_id&&!workflows.has(row.job_id))ids.add(row.job_id);return ids;
}

export async function createTopicRegistry(db){
 await db.prepare('CREATE TABLE IF NOT EXISTS ai_topic_epoch(id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL)').run();await db.prepare('INSERT OR IGNORE INTO ai_topic_epoch VALUES(1,0)').run();
 await db.prepare('CREATE TABLE IF NOT EXISTS ai_topic_reservations(job_id TEXT PRIMARY KEY REFERENCES ai_jobs(id) ON DELETE CASCADE,payload TEXT NOT NULL,updated_at TEXT NOT NULL)').run();
 const active=async()=>{const completed=await completedTopicJobs(db);return (await db.prepare("SELECT r.job_id,r.payload FROM ai_topic_reservations r JOIN ai_jobs j ON j.id=r.job_id WHERE j.status IN ('queued','running','in_review','approved')").all()).results.filter(r=>!completed.has(r.job_id)).map(r=>({...JSON.parse(r.payload),sourceJobId:r.job_id,pending:true}));};
 return {active,async release(jobId){await db.batch([db.prepare('DELETE FROM ai_topic_reservations WHERE job_id=?').bind(jobId),db.prepare('UPDATE ai_topic_epoch SET revision=revision+1 WHERE id=1')]);},async reserve(jobId,topic,{distinctFrom=[]}={}){
  for(let i=0;i<12;i++){const revision=(await db.prepare('SELECT revision FROM ai_topic_epoch WHERE id=1').first()).revision,records=await active(),conflict=findTopicConflict(topic,records,{jobId,targetPath:topic.action==='update'?topic.path:null});if(conflict)return conflict;
   const neighbors=nearbyTopics(topic,records,{jobId,targetPath:topic.action==='update'?topic.path:null}).filter(r=>!distinctFrom.includes(topicFingerprint(r)));if(neighbors.length)return {kind:'pending_intent_review',neighbors};
   // Compare-and-swap and insertion are one transaction, including across worker threads.
   const rows=await db.batch([db.prepare('UPDATE ai_topic_epoch SET revision=revision+1 WHERE id=1 AND revision=?').bind(revision),db.prepare("INSERT INTO ai_topic_reservations(job_id,payload,updated_at) SELECT ?,?,? WHERE changes()=1 AND EXISTS(SELECT 1 FROM ai_jobs WHERE id=? AND status='running') ON CONFLICT(job_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at").bind(jobId,JSON.stringify(topic),new Date().toISOString(),jobId)]);
   if(rows[0].meta.changes){if(!rows[1].meta.changes)throw Error('任务状态已变化，未占用选题');return null;}
  }throw Error('选题记录并发变化，请稍后重试');
 }};
}
