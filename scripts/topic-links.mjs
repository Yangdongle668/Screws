import {catalog,productOptions,processData} from './catalog.mjs';
import {materialFamilies,industryFamilies} from './industry-material-content.mjs';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function buildTopicLinks(url,body,articles){
 const links=[];const add=(path,name,kind,description)=>{if(!body.includes('href="'+path+'"')&&!links.some(x=>x.path===path))links.push({path,name,kind,description});};
 const materials=items=>items.slice(0,3).forEach(m=>add('/materials/'+m.slug+'/',m.name,'MATERIAL & FINAL CONDITION',m.strength));
 const industries=items=>items.slice(0,2).forEach(i=>add('/industries/'+i.slug+'/',i.name,'APPLICATION REQUIREMENTS',i.intro));
 const guides=items=>items.filter(a=>!body.includes('href="/blog/'+a.slug+'/"')).slice(0,2).forEach(a=>add('/blog/'+a.slug+'/',a.title,'ENGINEERING GUIDE',a.intro));
 const slug=url.split('/')[2];
 if(url.startsWith('/products/')&&productOptions.some(p=>p.slug===slug)){
  materials(materialFamilies.filter(m=>m.products.includes(slug)));industries(industryFamilies.filter(i=>i.products.includes(slug)));guides(articles.filter(a=>a.product===slug));
 }else if(url.startsWith('/capabilities/')&&processData.some(p=>p.slug===slug)){
  materials(materialFamilies.filter(m=>m.processes.includes(slug)));industries(industryFamilies.filter(i=>i.processes.includes(slug)));
  catalog.filter(p=>p.processes.includes(slug)&&!body.includes('href="/products/'+p.slug+'/"')).slice(0,2).forEach(p=>add('/products/'+p.slug+'/',p.name,'DRAWING-DEFINED DESIGN',p.desc));
 }else if(url.startsWith('/materials/')){
  const m=materialFamilies.find(m=>m.slug===slug);if(m){const explicit={'carbon-alloy-steel':['high-strength-screw-coatings-hydrogen-risk','coating-allowance-thread-shoulder'],'10b21-boron-steel':['cold-heading-vs-cnc-custom-screws','high-strength-screw-coatings-hydrogen-risk'],'stainless-steel-304-316':['stainless-screw-heat-treatment-grades','nickel-plating-vs-stainless-passivation'],'aluminum-alloys':['material-selection-custom-screws','prototype-to-production-fasteners'],'copper':['material-selection-custom-screws','custom-fastener-technical-cleanliness'],'brass':['rolled-vs-cut-thread-rfq','material-selection-custom-screws'],'titanium-alloys':['material-selection-custom-screws','first-article-custom-screw-approval']};guides((explicit[slug]||[]).map(s=>articles.find(a=>a.slug===s)).filter(Boolean));}
 }else if(url.startsWith('/industries/')){
  const i=industryFamilies.find(i=>i.slug===slug);if(i)guides(articles.map(a=>({article:a,score:(i.products.includes(a.product)?3:0)+(a.processes||[]).filter(p=>i.processes.includes(p)).length})).filter(x=>x.score>=3).sort((a,b)=>b.score-a.score).map(x=>x.article));
 }else if(url.startsWith('/blog/')&&url!=='/blog/'){
  const a=articles.find(a=>a.slug===slug);if(a){materials(materialFamilies.filter(m=>m.products.includes(a.product)).slice(0,2));industries(industryFamilies.filter(i=>i.products.includes(a.product)).slice(0,1));}
 }
 if(!links.length)return '';
 return '<section class="section topic-context"><div class="section-top"><div><small>CONNECTED SPECIFICATION TOPICS</small><h2>Connect the part to its requirements.</h2><p>Review these related topics for this design or route. Grade, treatment, geometry and acceptance remain drawing-specific.</p></div></div><div class="topic-context-grid">'+links.slice(0,6).map(x=>'<a href="'+x.path+'"><small>'+escape(x.kind)+'</small><h3>'+escape(x.name)+' ↗</h3><p>'+escape(x.description)+'</p></a>').join('')+'</div></section>';
}
