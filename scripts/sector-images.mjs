import fs from 'node:fs';
const briefs=JSON.parse(fs.readFileSync(new URL('./sector-visuals.json',import.meta.url),'utf8'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function sectorImage(slug,{hero=false,caption=false}={}){
 const brief=briefs.find(b=>b.slug===slug);if(!brief)throw Error('Missing sector visual '+slug);
 const alt=brief.title+(brief.kind==='industry'?' — industry overview':brief.kind==='material'?' — example fasteners':'');
 return `<figure class="sector-image sector-image-${brief.kind}"><img src="/images/${slug}.webp" srcset="/images/${slug}-small.webp 560w, /images/${slug}.webp 1100w" sizes="${hero?'(max-width:800px) 90vw, 50vw':'(max-width:700px) 90vw, 33vw'}" width="1100" height="734" alt="${escape(alt)}" ${hero?'fetchpriority="high"':'loading="lazy"'} decoding="async">${caption?`<figcaption>${brief.kind==='industry'?'Industry overview':brief.kind==='material'?'Material appearance reference; grade and properties require documentation.':'Process outcome reference; final requirements follow the approved drawing.'}</figcaption>`:''}</figure>`;
}
export function processResultImage(slug){return `<section class="section process-result-section"><div><small>AFTER PROCESSING</small><h2>See the resulting feature.</h2><p>Visual references help explain geometry and finish. Material properties, coating performance and acceptance require the agreed inspection methods.</p></div>${sectorImage('result-'+slug,{caption:true})}</section>`;}
