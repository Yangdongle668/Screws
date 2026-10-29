import pages from './generated-pages.json';
export function staticResponse(request:Request,path?:string){
 const u=new URL(request.url);const pathname=path??u.pathname;
 const normalized=pathname==='/'?'/':pathname.replace(/\/$/,'')+'/';
 if(normalized==='/resources/visual-library/')return Response.redirect(u.origin+'/products/',308);
 const html=(pages as Record<string,string>)[normalized];
 if(html&&pathname!==normalized)return Response.redirect(u.origin+normalized+u.search,308);
 return new Response(html??pages['/404/'],{status:html && normalized!='/404/'?200:404,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com https://*.openai.com",...(normalized==='/admin/'?{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}:{})}});
}
