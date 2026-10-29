export function parseOrigin(value){
 const url=new URL(value);
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('PUBLIC_URL must be an HTTP or HTTPS origin without a path');
 return url;
}
export function requestOrigin(incoming,configured,trustProxy=false){
 if(configured)return configured;
 const host=incoming.headers.host;
 if(typeof host!=='string'||!/^(?:\[[a-f0-9:]+\]|[a-z0-9.-]+)(?::\d{1,5})?$/i.test(host))throw Error('Invalid Host');
 const forwarded=incoming.headers['x-forwarded-proto'];
 const protocol=trustProxy&&forwarded==='https'?'https':'http';
 return parseOrigin(protocol+'://'+host);
}
export const sessionCookieName=origin=>origin.protocol==='https:'?'__Host-zufek_admin':'zufek_admin';
export function sessionCookie(origin,value,maxAge=43200){return sessionCookieName(origin)+'='+value+'; Path=/; HttpOnly;'+(origin.protocol==='https:'?' Secure;':'')+' SameSite=Strict; Max-Age='+maxAge;}
