// Number check across the whole article (a translation may legitimately move a number between sentences).
// Values stay strict. The only tolerance: a small count (1–12) not followed by a unit may be written as a word
// in one language and as a digit in the other, for example "five categories" and "5 类".
const diff=(a,b)=>{const pool=[...b],out=[];for(const x of a){const i=pool.indexOf(x);if(i>=0)pool.splice(i,1);else out.push(x);}return out;};
const NUMBER_WORDS={1:['one','eins','ein','eine','uno','una','un','une','一'],2:['two','zwei','dos','due','deux','二','两'],3:['three','drei','tres','tre','trois','三'],4:['four','vier','cuatro','quattro','quatre','四'],5:['five','fünf','cinco','cinque','cinq','五'],6:['six','sechs','seis','sei','六'],7:['seven','sieben','siete','sette','sept','七'],8:['eight','acht','ocho','otto','huit','八'],9:['nine','neun','nueve','nove','neuf','九'],10:['ten','zehn','diez','dieci','dix','十'],11:['eleven','elf','once','undici','onze','十一'],12:['twelve','zwölf','doce','dodici','douze','十二']};
const UNIT=/^\s*(?:mm|cm|m|µm|um|μm|nm|kn|n|mpa|gpa|hv|hrc|hrb|%|°|d\b|x\b|×|h\b|min|s\b|kg|g\b|bar|psi|in\b|inch)/i;
const hasWord=(text,n)=>NUMBER_WORDS[n]?.some(w=>/^[\u4e00-\u9fff]+$/.test(w)?text.includes(w):new RegExp('(^|[^\\p{L}])'+w+'(?![\\p{L}])','iu').test(text));
const countLike=(text,value)=>{const n=Number(value);if(!Number.isInteger(n)||n<1||n>12)return false;for(const m of text.matchAll(new RegExp('(^|[^\\d.,])'+value+'(?![\\d.,])','g'))){const after=text.slice(m.index+m[0].length);if(UNIT.test(after)||/^\s*[–-]\s*\d/.test(after))return false;}return true;};
export function numberMismatch(sourceFields,targetFields){
 const grab=list=>list.flatMap(s=>[...String(s).matchAll(/\d+(?:[.,]\d+)*/g)].map(m=>m[0].replaceAll(',','.')));
 const sourceText=sourceFields.join('\n'),targetText=targetFields.join('\n'),a=grab(sourceFields),b=grab(targetFields);
 return {missing:diff(a,b).filter(v=>!(countLike(sourceText,v)&&hasWord(targetText,Number(v)))),extra:diff(b,a).filter(v=>!(countLike(targetText,v)&&hasWord(sourceText,Number(v))))};
}
export function assertArticleTranslation(source,target){
 if(!target||typeof target!=='object')throw Error('译文必须返回结构化文章');
 for(const key of ['slug','path','product','cover','processes','bodyFormat'])if(JSON.stringify(target[key]??(key==='processes'?[]:null))!==JSON.stringify(source[key]??(key==='processes'?[]:null)))throw Error('译文修改了受保护的字段：'+key);
 for(const key of ['title','description','category','intro','example'])if(typeof target[key]!=='string')throw Error('译文缺少字段：'+key);
 if(!Array.isArray(target.sections)||target.sections.length!==source.sections.length||target.sections.some(x=>!Array.isArray(x)||x.length!==2||x.some(s=>typeof s!=='string'||!s.trim())))throw Error('译文章节缺失或结构变化');
 for(const key of ['checklist','keywords'])if(!Array.isArray(target[key]??[])||(target[key]??[]).length!==(source[key]??[]).length||(target[key]??[]).some(s=>typeof s!=='string'))throw Error('译文列表结构发生变化：'+key);
 for(const [key,index]of [['sources',1],['relatedLinks','path']]){const a=source[key]??[],b=target[key]??[];if(!Array.isArray(b)||a.length!==b.length||a.some((v,i)=>v[index]!==b[i]?.[index]))throw Error('译文修改了来源或内链网址');}
 if(!!source.social!==!!target.social||!!source.schemaContent!==!!target.schemaContent)throw Error('译文增加或遗漏了批准的元数据模块');
 if(source.social&&(!target.social||typeof target.social.title!=='string'||!target.social.title.trim()||typeof target.social.description!=='string'||!target.social.description.trim()))throw Error('译文缺少社交分享元数据');if(source.schemaContent&&(!target.schemaContent||target.schemaContent.type!==source.schemaContent.type||!Array.isArray(target.schemaContent.topics)||target.schemaContent.topics.length!==source.schemaContent.topics.length||target.schemaContent.topics.some(t=>typeof t!=='string'||!t.trim())))throw Error('译文缺少Schema主题或改变了文章类型');
 if(target.title===source.title&&target.intro===source.intro)throw Error('模型返回了未翻译的英文原文');
 const fields=a=>[a.title,a.metaTitle||a.title,a.description,a.category,a.intro,a.example,...a.sections.flat(),...a.checklist,...(a.keywords||[]),...(a.relatedLinks||[]).map(l=>l.label),...(a.sources||[]).map(s=>s[0]),...(a.social?[a.social.title,a.social.description]:[]),...(a.schemaContent?.topics||[])];
 const numbers=a=>fields(a).map(s=>[...s.matchAll(/\d+(?:[.,]\d+)*/g)].map(m=>m[0].replaceAll(',','.')).sort());
 const identifiers=a=>fields(a).map(s=>[...s.matchAll(/\b(?:ISO|DIN|ASTM|AISI|SUS|MJ?|HV|HRC|VDA)\s*[-:]?\s*\d[.\d/-]*/gi)].map(m=>m[0].replace(/\s+/g,'').replace(/[-./]+$/,'').toUpperCase()).sort());
 const urls=a=>fields(a).map(s=>[...s.matchAll(/https?:\/\/[^\s)>\]]+|\]\((\/[^)\s]+)\)/g)].map(m=>m[1]||m[0]).sort());if(JSON.stringify(urls(source))!==JSON.stringify(urls(target)))throw Error('译文修改了正文中的链接');
 const mismatch=numberMismatch(fields(source),fields(target)),ids=a=>identifiers(a).flat().sort(),missingIds=diff(ids(source),ids(target)),extraIds=diff(ids(target),ids(source));
 if(mismatch.missing.length||mismatch.extra.length||missingIds.length||extraIds.length){const show=(label,list)=>list.length?label+list.slice(0,6).join('、'):'';throw Error('译文中的数字或标准牌号与批准英文不一致，请人工核查：'+[show('缺少数字 ',mismatch.missing),show('多出数字 ',mismatch.extra),show('缺少牌号 ',missingIds),show('多出牌号 ',extraIds)].filter(Boolean).join('；'));}
 return target;
}
// Source URLs and related-link paths belong to the approved English article, so the server restores them
// instead of requiring the model to copy them perfectly. Translated labels are kept when they can be matched
// by URL or by position; otherwise the approved English label is used. Internal body links that the model
// prefixed with a language directory (for example /de/products/x/) are returned to the approved path, because
// links are localized at render time. No other text is changed.
const LOCALE_PREFIX=/^\/(?:de|es|it|fr|zh)(?=\/)/;
export function alignTranslationLinks(source,target){
 if(!source||!target||typeof target!=='object')return {article:target,repairs:[]};
 const repairs=[],out={...target},bare=p=>typeof p==='string'?p.replace(LOCALE_PREFIX,''):p;
 const align=(key,urlOf,labelIndex,build)=>{const a=Array.isArray(source[key])?source[key]:[],b=Array.isArray(target[key])?target[key]:[];if(!a.length&&!b.length)return;
  const next=a.map((item,i)=>{const byURL=b.find(x=>bare(urlOf(x))===urlOf(item)),byIndex=b.length===a.length?b[i]:null,label=[byURL,byIndex].map(x=>x?.[labelIndex]).find(v=>typeof v==='string'&&v.trim());return build(item,label??item[labelIndex]);});
  if(JSON.stringify(next)!==JSON.stringify(b)){out[key]=next;repairs.push('restored_'+key);}};
 align('sources',x=>Array.isArray(x)?x[1]:undefined,0,(item,label)=>[label,...item.slice(1)]);
 align('relatedLinks',x=>x?.path,'label',(item,label)=>({...item,label}));
 const approved=new Set();const collect=s=>{for(const m of String(s).matchAll(/\]\((\/[^)\s]+)\)/g))approved.add(m[1]);};
 for(const s of [source.intro,source.example,...(source.sections||[]).flat(),...(source.checklist||[])])collect(s);
 let fixed=0;const fix=s=>typeof s!=='string'?s:s.replace(/\]\((\/(?:de|es|it|fr|zh)(\/[^)\s]*))\)/g,(all,prefixed,path)=>approved.has(path)&&!approved.has(prefixed)?(fixed++,']('+path+')'):all);
 out.intro=fix(out.intro);out.example=fix(out.example);if(Array.isArray(out.sections))out.sections=out.sections.map(x=>Array.isArray(x)?x.map(fix):x);if(Array.isArray(out.checklist))out.checklist=out.checklist.map(fix);
 if(fixed)repairs.push('restored_body_link_paths');
 return {article:out,repairs};
}
