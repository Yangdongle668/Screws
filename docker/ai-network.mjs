import https from 'node:https';
import dns from 'node:dns/promises';
import {BlockList,isIP} from 'node:net';
const blocked=new BlockList();
for(const [ip,prefix]of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]])blocked.addSubnet(ip,prefix,'ipv4');
for(const [ip,prefix] of [['2001::',32],['2001:db8::',32],['2002::',16]])blocked.addSubnet(ip,prefix,'ipv6');
export function publicAddress(address){if(isIP(address)===4)return !blocked.check(address,'ipv4');if(isIP(address)===6)return /^2[0-9a-f]{3}:/i.test(address)&&!blocked.check(address,'ipv6');return false;}
export function publicURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||isIP(u.hostname)||!u.hostname.includes('.')||u.hostname.endsWith('.')||/\.(local|internal|localhost|test)$/.test(u.hostname))throw Error('只支持公开域名的HTTPS地址，不能使用内网、IP、凭据或非443端口');return u;}
// Resolve once, validate every answer and pin the connection to that answer.
// Do not follow redirects or forward provider credentials to another host.
export async function publicRequest(value,{method='GET',headers={},body,limit=1500000,timeout=90000}={}){
 const u=publicURL(value);let dnsTimer;const answers=await Promise.race([dns.lookup(u.hostname,{all:true}),new Promise((_,reject)=>{dnsTimer=setTimeout(()=>reject(Error('域名解析超时')),10000);})]).finally(()=>clearTimeout(dnsTimer));if(!answers.length||answers.some(a=>!publicAddress(a.address)))throw Error('目标域名解析到非公开地址，已拒绝连接');
 const address=answers[0];return new Promise((resolve,reject)=>{const req=https.request(u,{method,headers,lookup:(_host,options,cb)=>options?.all?cb(null,[address]):cb(null,address.address,address.family)},res=>{let size=0;const chunks=[];res.on('data',chunk=>{size+=chunk.length;if(size>limit){res.destroy();reject(Error('远端响应过大'));return;}chunks.push(chunk);});res.on('error',reject);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,text:Buffer.concat(chunks).toString('utf8')}));});const deadline=setTimeout(()=>req.destroy(Error('远端连接超时')),timeout);req.on('close',()=>clearTimeout(deadline));req.setTimeout(timeout,()=>req.destroy(Error('远端连接超时')));req.on('error',reject);req.end(body);});
}
