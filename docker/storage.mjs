import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {Readable} from 'node:stream';
import {createHash,randomUUID} from 'node:crypto';

export function openDatabase(filename,migrations){
 fs.mkdirSync(path.dirname(filename),{recursive:true,mode:0o700});
 const sqlite=new DatabaseSync(filename);sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS _zufek_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL);');
 for(const name of fs.readdirSync(migrations).filter(n=>/^\d+.*\.sql$/.test(n)).sort()){
  const sql=fs.readFileSync(path.join(migrations,name),'utf8'),checksum=createHash('sha256').update(sql.replaceAll('\r\n','\n')).digest('hex');
  const applied=sqlite.prepare('SELECT checksum FROM _zufek_migrations WHERE name=?').get(name);
  if(applied){if(applied.checksum!==checksum)throw Error('Applied migration changed: '+name);continue;}
  sqlite.exec('BEGIN IMMEDIATE');try{sqlite.exec(sql);sqlite.prepare('INSERT INTO _zufek_migrations VALUES (?,?)').run(name,checksum);sqlite.exec('COMMIT');}catch(error){sqlite.exec('ROLLBACK');throw error;}
 }
 class Statement{
  constructor(sql,values=[]){this.sql=sql;this.values=values;}
  bind(...values){return new Statement(this.sql,values);}
  execute(){const statement=sqlite.prepare(this.sql);if(statement.columns().length){const results=statement.all(...this.values);return {success:true,results,meta:{changes:Number(sqlite.prepare('SELECT changes() AS count').get().count)}};}const result=statement.run(...this.values);return {success:true,results:[],meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}};}
  async all(){return this.execute();}
  async run(){return this.execute();}
  async first(column){const row=sqlite.prepare(this.sql).get(...this.values)??null;return column?row?.[column]??null:row;}
 }
 return {prepare:sql=>new Statement(sql),async batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>s.execute());sqlite.exec('COMMIT');return result;}catch(error){sqlite.exec('ROLLBACK');throw error;}},close(){sqlite.close();},check(){return sqlite.prepare('SELECT 1 AS healthy').get().healthy===1;}};
}
export function fileBucket(root){
 const base=path.resolve(root);fs.mkdirSync(base,{recursive:true,mode:0o700});
 const location=key=>{if(typeof key!=='string'||!key||key.includes('\\')||key.includes('\0'))throw Error('Invalid object key');const target=path.resolve(base,key);if(!target.startsWith(base+path.sep))throw Error('Invalid object key');return target;};
 return {async put(key,value){const target=location(key);await fsp.mkdir(path.dirname(target),{recursive:true,mode:0o700});const temporary=target+'.'+randomUUID()+'.tmp';await fsp.writeFile(temporary,Buffer.from(value),{mode:0o600,flag:'wx'});await fsp.rename(temporary,target);},async get(key){const target=location(key);let stat;try{stat=await fsp.stat(target);}catch(error){if(error.code==='ENOENT')return null;throw error;}return {size:stat.size,body:Readable.toWeb(fs.createReadStream(target)),arrayBuffer:async()=>{const b=await fsp.readFile(target);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}};},async delete(key){await fsp.unlink(location(key)).catch(e=>{if(e.code!=='ENOENT')throw e;});}};
}
