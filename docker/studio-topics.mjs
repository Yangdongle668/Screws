import {selectPAA,coverageTargets,paaTerms} from './ai-editorial-inputs.mjs';
// Deterministic topic selection for Article Studio. No model calls.
const ARTICLE=/^\/(blog|guides|industry-insights)\/[^/]+\/$/;
const cleanTitle=t=>String(t||'').replace(/\s*\|.*$/,'').replace(/\s+to Drawing$/i,'').trim();
const overlap=(a,b)=>{if(!a.length||!b.length)return 0;const B=new Set(b);return a.filter(w=>B.has(w)).length/Math.min(a.length,b.length);};
const GENERIC=new Set(['custom','screw','bolt','fastener','zufek','drawing','metal','part','specify','specification','choose','choosing','select','selecting','guide','practical','detail','include','including','question','rfq','design','designing','review']);
const topicTerms=t=>paaTerms(t).filter(w=>!GENERIC.has(w));

export function isDuplicateTopic(text,existing){const t=topicTerms(text);return t.length>0&&existing.some(e=>overlap(t,topicTerms(e))>=0.7);}

// Pick the product page an article supports, and up to two related process pages.
export function matchPages(text,pages,{covers}={}){
 const t=topicTerms(text),score=p=>overlap(t,topicTerms(cleanTitle(p.title)+' '+p.path.split('/')[2].replace(/-/g,' ')));
 const products=pages.filter(p=>/^\/products\/[^/]+\/$/.test(p.path)&&(!covers||covers.has(p.path.split('/')[2]))).map(p=>({p,s:score(p)})).sort((a,b)=>b.s-a.s);
 const processes=pages.filter(p=>/^\/capabilities\/[^/]+\/$/.test(p.path)&&p.path!=='/capabilities/process-routes/').map(p=>({p,s:score(p)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
 const product=products[0]?.s>0?products[0].p.path.split('/')[2]:'custom-screws';
 return {product,processes:processes.slice(0,2).map(x=>x.p.path.split('/')[2])};
}

export function topicCandidates({hint='',gsc=[],paa=[],usedPAA=[],pages=[],pendingTopics=[]}){
 const articleTitles=pages.filter(p=>ARTICLE.test(p.path||'')).map(p=>cleanTitle(p.title)),avoid=[...articleTitles,...pendingTopics];
 const out=[],push=c=>{const text=c.question||c.keyword;if(!text||c.source!=='manual'&&isDuplicateTopic(text,avoid)||out.some(x=>isDuplicateTopic(text,[x.question||x.keyword])))return;out.push(c);};
 if(hint.trim())push({source:'manual',question:hint.trim(),keyword:hint.trim(),score:1000});
 for(const o of gsc.filter(o=>o.kind==='new_article'))push({source:'search_console',question:o.query,keyword:o.query,score:80+Math.min(40,o.impressions),evidence:{impressions:o.impressions,position:o.position,currentPage:o.page}});
 const vocabulary=coverageTargets(pages,{limit:12}).map(t=>cleanTitle(t.title)).join(' ');
 selectPAA(paa,vocabulary,{limit:40,requireMatch:false,exclude:usedPAA,coveredTitles:articleTitles}).filter(q=>!q.alreadyUsed&&!q.coveredByExistingPage).forEach((q,i)=>push({source:'paa',question:q.question,keyword:q.keyword,score:60-i*0.5,evidence:{paaId:q.id,capturedAt:q.capturedAt}}));
 for(const t of coverageTargets(pages,{limit:8}))push({source:'coverage',question:null,keyword:cleanTitle(t.title),targetPath:t.path,score:40+(t.articleCount===0?15:0),evidence:{articleCount:t.articleCount}});
 return out.sort((a,b)=>b.score-a.score);
}
