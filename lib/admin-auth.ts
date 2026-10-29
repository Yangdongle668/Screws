import {env} from 'cloudflare:workers';
export function adminAuthorized(request:Request){
 const id=request.headers.get('oai-authenticated-user-id');const email=request.headers.get('oai-authenticated-user-email')?.toLowerCase();
 if(!id||!email)return false;
 if(import.meta.env.DEV&&id==='local_seedy'&&email==='seedy@sites.test')return true;
 return (env.ADMIN_EMAILS??'').toLowerCase().split(',').map(x=>x.trim()).includes(email);
}
