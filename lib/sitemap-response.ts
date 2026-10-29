import {crawlResponse} from './seo/response';
export const sitemapResponse=async(request:Request)=>(await crawlResponse(request))??new Response('Not found',{status:404});
