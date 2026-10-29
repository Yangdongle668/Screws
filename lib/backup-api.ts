import {env} from 'cloudflare:workers';
const encoder=new TextEncoder();
function header(name:string,size:number){const b=new Uint8Array(512);const put=(offset:number,length:number,value:string)=>b.set(encoder.encode(value).slice(0,length),offset);put(0,100,name);put(100,8,'0000600\0');put(108,8,'0000000\0');put(116,8,'0000000\0');put(124,12,size.toString(8).padStart(11,'0')+'\0');put(136,12,Math.floor(Date.now()/1000).toString(8).padStart(11,'0')+'\0');put(148,8,'        ');put(156,1,'0');put(257,6,'ustar\0');put(263,2,'00');const checksum=b.reduce((s,n)=>s+n,0);put(148,8,checksum.toString(8).padStart(6,'0')+'\0 ');return b;}
const padding=(size:number)=>new Uint8Array((512-size%512)%512);
export function backupResponse(){
 const startedAt=new Date().toISOString();
 async function* entries(){
  const counts:Record<string,number>={};let drawings=0;const meta=encoder.encode(JSON.stringify({format:'zufek-backup-v1',startedAt,consistency:'Live export, not a transactional database snapshot. Avoid editing records during download.',tables:['inquiries','inquiry_notes','article_drafts','article_publications','article_versions','analytics_daily'],excludes:['Runtime secrets','Encrypted mail settings','SMTP bridge receipts','Platform accounts','Prior emails','Hosting logs','Rate-limit keys']}));yield header('backup-info.json',meta.length);yield meta;yield padding(meta.length);
  if(!env.DB)throw Error('Database unavailable');
  for(const table of ['inquiries','inquiry_notes','article_drafts','article_publications','article_versions','analytics_daily']){const key=['article_drafts','article_publications'].includes(table)?'slug':'id';let last='';let count=0;
   while(true){const batch=await env.DB.prepare('SELECT * FROM '+table+' WHERE '+key+' > ? ORDER BY '+key+' LIMIT 50').bind(last).all<Record<string,unknown>>();if(!batch.results.length)break;
    for(const row of batch.results){const data=encoder.encode(JSON.stringify(row));count++;yield header('data/'+table+'/'+count+'.json',data.length);yield data;yield padding(data.length);
     if(table==='inquiries'&&row.file_key){if(!env.BUCKET)throw Error('Drawing storage unavailable');const object=await env.BUCKET.get(String(row.file_key));if(!object)throw Error('Drawing missing; backup incomplete');yield header('drawings/'+encodeURIComponent(String(row.id))+'.bin',object.size);const reader=object.body.getReader();try{while(true){const part=await reader.read();if(part.done)break;yield part.value;}}finally{reader.releaseLock();}yield padding(object.size);drawings++;}
    }last=String(batch.results.at(-1)![key]);
   }counts[table]=count;
  }
  const manifest=encoder.encode(JSON.stringify({complete:true,completedAt:new Date().toISOString(),counts,drawings}));yield header('complete.json',manifest.length);yield manifest;yield padding(manifest.length);yield new Uint8Array(1024);
 }
 const iterator=entries();const stream=new ReadableStream<Uint8Array>({async pull(controller){try{const next=await iterator.next();if(next.done)controller.close();else controller.enqueue(next.value);}catch(error){controller.error(error);}},async cancel(){await iterator.return(undefined);}});
 return new Response(stream.pipeThrough(new CompressionStream('gzip') as unknown as ReadableWritablePair<Uint8Array,Uint8Array>),{headers:{'Content-Type':'application/gzip','Content-Disposition':'attachment; filename="zufek-backup-'+startedAt.replaceAll(':','-')+'.tar.gz"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
