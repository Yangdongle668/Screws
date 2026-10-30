import {deepContent} from './deep-content.mjs';
import fs from 'node:fs';
const copy=JSON.parse(fs.readFileSync(new URL('./resource-copy.json',import.meta.url)));
export function registerResourcePages({add,pages,heading,crumb,origin}){
 const card=(url)=>{const html=pages[url];const title=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]??url;const entry=deepContent.find(a=>a.path===url);const intro=entry?entry.description:html.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*<p>([\s\S]*?)<\/p>/)?.[1]??'';return '<a class="catalog-card" href="'+url+'"><h2>'+title+'</h2><p>'+intro+'</p></a>';};
 add('/guides/',copy[1],'Drawing preparation, material selection and drive references for custom fastener RFQs.',crumb([['Resources','/resources/'],[copy[1]]])+heading('TECHNICAL INSIGHTS',copy[1],'Drawing preparation, material selection and drive references for custom fastener RFQs.')+'<section class="section compact"><div class="catalog-grid">'+['/guides/rfq-checklist/','/guides/material-strength-selection/','/guides/drive-types/',...deepContent.filter(a=>a.kind==='guides').map(a=>a.path)].map(card).join('')+'</div></section>');
 const body=crumb([['Resources','/resources/'],[copy[0]]])+heading('TECHNICAL INSIGHTS',copy[0],copy[5])+'<section class="section compact"><div class="catalog-grid">'+deepContent.filter(a=>a.kind==='insights').map(a=>card(a.path)).join('')+'</div></section>';
 add('/industry-insights/',copy[0],copy[5],body,{schema:{'@context':'https://schema.org','@type':'CollectionPage',name:copy[0],url:origin+'/industry-insights/'}});
 pages['/resources/']=pages['/resources/'].replace('<section class="section compact">','<section class="section compact"><div class="catalog-grid">'+card('/guides/')+card('/industry-insights/')+card('/faq/')+'</div>');
 const file='static-site/resources/index.html';fs.writeFileSync(file+'.generating',pages['/resources/']);fs.renameSync(file+'.generating',file);
}
