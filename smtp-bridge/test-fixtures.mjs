import {mkdtemp,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {after} from 'node:test';

// Fresh, disposable localhost-only TLS identity. Never read production keys.
const tempRoot=path.resolve(os.tmpdir());
export const directory=await mkdtemp(path.join(tempRoot,'zufek-smtp-qa-'));
after(async()=>{
 const target=path.resolve(directory);
 if(path.dirname(target)!==tempRoot||!path.basename(target).startsWith('zufek-smtp-qa-'))throw Error('Unsafe test cleanup path');
 await rm(target,{recursive:true,force:true});
});
const gitOpenSsl='C:/Program Files/Git/usr/bin/openssl.exe';
const executable=process.env.OPENSSL_BIN||(process.platform==='win32'&&existsSync(gitOpenSsl)?gitOpenSsl:'openssl');
const result=spawnSync(executable,['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-keyout',path.join(directory,'smtp-test-key.pem'),'-out',path.join(directory,'smtp-test-cert.pem'),'-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost'],{encoding:'utf8',windowsHide:true});
if(result.error||result.status!==0)throw Error('OpenSSL is required to generate disposable localhost SMTP test certificates. Set OPENSSL_BIN if it is not on PATH.');
