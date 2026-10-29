"""Verify a ZUFEK backup and rehearse database recovery in memory; never touches production."""
import argparse, json, sqlite3, tarfile
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('archive',type=Path);args=parser.parse_args()
rows={};drawings={};complete=None
with tarfile.open(args.archive,'r|gz') as archive:
 for member in archive:
  if not member.isfile() or member.size>30*1024*1024: raise ValueError('Unexpected archive entry')
  content=archive.extractfile(member).read()
  if member.name=='complete.json':complete=json.loads(content)
  elif member.name.startswith('data/'):
   parts=member.name.split('/');table=parts[1]
   if table not in ['inquiries','inquiry_notes','article_drafts','article_publications','article_versions','article_translations','analytics_daily']:raise ValueError('Unknown table')
   rows.setdefault(table,[]).append(json.loads(content))
  elif member.name.startswith('drawings/'):drawings[member.name]=content
assert complete and complete['complete'], 'Incomplete backup: missing final manifest'
connection=sqlite3.connect(':memory:')
for migration in sorted((Path(__file__).resolve().parent.parent/'drizzle').glob('*.sql')):connection.executescript(migration.read_text(encoding='utf-8-sig'))
connection.execute('PRAGMA foreign_keys=ON')
for table in ['inquiries','inquiry_notes','article_drafts','article_publications','article_versions','article_translations','analytics_daily']:
 records=rows.get(table,[]);assert len(records)==complete['counts'].get(table,0),table+' count mismatch'
 for record in records:
  columns=list(record);query='INSERT INTO "'+table+'" ('+','.join('"'+k+'"' for k in columns)+') VALUES ('+','.join('?' for _ in columns)+')'
  connection.execute(query,[record[k] for k in columns])
 assert connection.execute('SELECT COUNT(*) FROM "'+table+'"').fetchone()[0]==len(records)
assert not connection.execute('PRAGMA foreign_key_check').fetchall()
from urllib.parse import quote
for inquiry in rows.get('inquiries',[]):
 if inquiry['file_key']: assert 'drawings/'+quote(inquiry['id'],safe='')+'.bin' in drawings,'Missing drawing'
assert len(drawings)==complete['drawings']
print(json.dumps({'archiveComplete':True,'databaseRestoredInMemory':True,'foreignKeysValid':True,'tableCounts':complete['counts'],'drawingFilesVerified':len(drawings),'productionModified':False},indent=2))
