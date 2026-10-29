import {createBridge} from './core.mjs';
const server=createBridge({token:process.env.BRIDGE_TOKEN,allowedHosts:(process.env.SMTP_ALLOWED_HOSTS||'').split(',').map(x=>x.trim()).filter(Boolean),allowedSenderDomains:(process.env.SMTP_FROM_DOMAINS||'zufek.com').split(',').map(x=>x.trim()).filter(Boolean),stateDirectory:process.env.STATE_DIRECTORY||'/data'});
server.listen(Number(process.env.PORT||3001),process.env.HOST||'127.0.0.1',()=>console.log('ZUFEK SMTP bridge ready; credentials and message content are not logged.'));
