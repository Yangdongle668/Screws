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
 const identifiers=a=>fields(a).map(s=>[...s.matchAll(/\b(?:ISO|DIN|ASTM|AISI|SUS|MJ?|HV|HRC|VDA)\s*[-:]?\s*\d[.\d/-]*/gi)].map(m=>m[0].replace(/\s+/g,'').toUpperCase()).sort());
 const urls=a=>fields(a).map(s=>[...s.matchAll(/https?:\/\/[^\s)>\]]+|\]\((\/[^)\s]+)\)/g)].map(m=>m[1]||m[0]).sort());if(JSON.stringify(urls(source))!==JSON.stringify(urls(target)))throw Error('译文修改了正文中的链接');
 if(JSON.stringify(numbers(source))!==JSON.stringify(numbers(target))||JSON.stringify(identifiers(source))!==JSON.stringify(identifiers(target)))throw Error('译文中的数字或标准牌号与批准英文不一致，请人工核查');
 return target;
}
