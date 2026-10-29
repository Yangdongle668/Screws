import {build} from 'esbuild';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const origin=process.env.PUBLIC_URL||(process.argv.includes('--configure-only')?'http://localhost:1573':'');
if(origin){const url=new URL(origin);if(!['https:','http:'].includes(url.protocol)||url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw Error('PUBLIC_URL must be an HTTP or HTTPS origin.');writeFileSync('site-content.config.json',JSON.stringify({canonicalOrigin:url.origin},null,2)+'\n');}
// Content generation is executed by the caller after applying the build origin.
if(process.argv.includes('--configure-only'))process.exit(0);
mkdirSync('dist/docker',{recursive:true});
await build({entryPoints:['docker/api.ts'],outfile:'dist/docker/api.mjs',bundle:true,platform:'node',format:'esm',target:'node24',packages:'bundle',banner:{js:"import {createRequire} from 'node:module'; const require=createRequire(import.meta.url);"},alias:{'cloudflare:workers':path.resolve('docker/bindings.mjs')},define:{'import.meta.env.DEV':'false'},logLevel:'info'});
writeFileSync('dist/docker/site-origin.txt',JSON.parse(readFileSync('site-content.config.json','utf8')).canonicalOrigin+'\n');
