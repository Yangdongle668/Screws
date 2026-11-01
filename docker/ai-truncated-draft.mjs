import {parseTextContract} from './ai-text-contract.mjs';
import {ARTICLE_OUTPUT_SCHEMA} from './ai-article-contract.mjs';
// Recovery is limited to an optional metadata tail after a complete article.
export function recoverTruncatedDraft(content){
 if(!String(content).startsWith('ZUFEK_FIELDS_V1'))return null;
 const headers=[...content.matchAll(/^@@FIELD (?:string|array|object|null|number|boolean) (\/\S*)$/gm)];const lastPath=headers.at(-1)?.[1];
 if(!/^\/(?:sources|changeSummary|uncertainties)(?:\/|$)/.test(lastPath||''))return null;
 const ends=[...content.matchAll(/^@@END\r?$/gm)],last=ends.at(-1);if(!last)return null;
 let doc;try{doc=parseTextContract(content.slice(0,last.index+last[0].length)+'\nZUFEK_FIELDS_END');}catch{return null;}
 if(doc.status!=='READY_FOR_REVIEW'||!doc.article||ARTICLE_OUTPUT_SCHEMA.properties.article.required.some(k=>!Object.hasOwn(doc.article,k)))return null;
 if(['schemaVersion','publication','keywordBrief','seo','schema','gapEvidence','reason'].some(k=>!Object.hasOwn(doc,k)))return null;
 if(!Array.isArray(doc.article.sections)||!doc.article.sections.length||doc.article.sections.some(x=>!Array.isArray(x)||x.length!==2||typeof x[0]!=='string'||!x[0].trim()||typeof x[1]!=='string'||!x[1].trim()))return null;
 const recovery={code:'OPTIONAL_TAIL_RECOVERED',truncatedAt:lastPath,discardedReferenceCount:Array.isArray(doc.sources)?doc.sources.length:0,requiresEditorialReview:true,message:'Provider output ended in supplementary metadata after the complete article. Incomplete reference metadata was omitted; no missing body text was invented.'};
 doc.sources=[];doc.article.sources=[];
 doc.changeSummary={summary:'Recovered complete article fields from a response truncated in supplementary metadata; editorial review required.',changes:[],preserved:['All completed article body fields were retained verbatim.']};
 doc.uncertainties=[...(Array.isArray(doc.uncertainties)?doc.uncertainties.filter(x=>typeof x==='string'):[]),recovery.message];
 return {value:doc,recovery};
}
