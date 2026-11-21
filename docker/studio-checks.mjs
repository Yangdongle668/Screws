import {assessWritingStyle} from '../lib/article-audit.mjs';
import {plainText,wordCount} from './studio-format.mjs';
// Local checks for Article Studio drafts. No model calls.
// level "block": must not be published (fabricated company facts, near-duplicate content)
// level "fix":   sent to the single revision call (SEO, style, structure)
// level "review": shown to the human reviewer only (values that need a quick verification)
const sentencesOf=text=>String(text).replace(/\]\([^)]*\)/g,']').split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])|\n+/).map(s=>s.trim()).filter(s=>s.length>3);
const words=text=>(String(text).toLowerCase().replace(/\]\([^)]*\)/g,']').match(/[a-z0-9]+/g)||[]);
const issue=(level,code,message,excerpt)=>({level,code,message,...(excerpt?{excerpt:String(excerpt).slice(0,240)}:{})});

// --- Truthfulness: claims about ZUFEK itself must come from COMPANY-FACTS.md ---
const COMPANY=/\b(?:ZUFEK|our|ours)\b/i,FIRST_PERSON=/\b(?:we|we're|we’re|we've|we’ve|our|ours|us)\b/i;
const CERT=/\b(?:ISO\s?9001|IATF\s?16949|ISO\s?14001|ISO\s?45001|AS\s?9100|certified|certification|accredited|approved supplier)\b/i;
const CUSTOMER=/\b(?:our (?:customers?|clients?)|customers? (?:include|such as)|clients? (?:include|such as)|trusted by|we (?:supply|supplied|serve|served) (?:to )?(?:[A-Z][a-z]+|leading|major|top))/;
const BRANDS=/\b(?:Mercedes(?:-Benz)?|BMW|Audi|Volkswagen|Porsche|Tesla|Toyota|Honda|Ford|General Motors|Bosch|Siemens|ABB|Schneider|Apple|Huawei|BYD|CATL|Foxconn|Caterpillar|John Deere)\b/;
const EXPERIENCE=/\b(?:we|our team|our engineers)\s+(?:have\s+)?(?:tested|measured|found|observed|seen|saw|recorded|verified|confirmed|proved)\b|\bin our (?:experience|tests?|testing|lab|laboratory|factory|plant|workshop)\b|\bour (?:lab|laboratory|test data|data|records) (?:show|shows|showed|indicate)/i;
const EQUIPMENT=/\b(?:our|ZUFEK(?:'s|’s)?)\s+(?:[a-z-]+\s+){0,2}(?:machines?|presses?|headers?|lathes?|CMMs?|equipment|production lines?|lines|capacity|workforce|engineers|team of)\b/i;
const VALUE=/\b\d+(?:[.,]\d+)?\s?(?:MPa|GPa|N·?m|Nm|kN|N\b|HRC|HV|%|°C|h\b|hours|µm|um)\b/i;
export function truthCheck(doc,facts){
 const allowed=new Set((String(facts).match(/\d+(?:[.,]\d+)?/g)||[]).map(x=>x.replace(',','.'))),out=[];
 for(const s of sentencesOf(plainText(doc))){
  const company=COMPANY.test(s);
  if(company&&CERT.test(s))out.push(issue('block','claim_certification','提到ZUFEK的认证或资质；只能使用公司事实文件中已批准的内容',s));
  else if(CUSTOMER.test(s)||company&&BRANDS.test(s))out.push(issue('block','claim_customer','提到客户、品牌或供货关系；公司事实文件未批准',s));
  else if(EXPERIENCE.test(s))out.push(issue('block','claim_experience','以“我们测试/观察/经验”口吻陈述事实；不能虚构测试或生产经验',s));
  else if(company&&/\d/.test(s)&&(s.match(/\d+(?:[.,]\d+)?/g)||[]).some(n=>!allowed.has(n.replace(',','.'))))out.push(issue('block','claim_company_number','关于ZUFEK的数字不在公司事实文件中',s));
  else if(EQUIPMENT.test(s))out.push(issue('review','claim_equipment','提到ZUFEK的设备、产能或团队；请确认属实',s));
  if(/\b(?:guarantee[sd]?|100\s?%|never fail(?:s|ed)?|zero defects?)\b/i.test(s))out.push(issue('fix','absolute_claim','绝对化承诺；改为带条件的说明',s));
  else if(!company&&VALUE.test(s))out.push(issue('review','specific_value','具体性能数值；请核对是否为通用工程事实或标准值',s));
 }
 const firstPerson=sentencesOf(plainText(doc)).filter(s=>FIRST_PERSON.test(s));if(firstPerson.length)out.push(issue('fix','first_person','正文使用了“we/our”第一人称；改为中性表述，只在引用公司事实时写ZUFEK',firstPerson[0]));
 return out;
}

// --- Duplicate check against every existing page (word 6-gram containment) ---
const shingles=(text,k=6)=>{const w=words(text),set=new Set();for(let i=0;i+k<=w.length;i++)set.add(w.slice(i,i+k).join(' '));return set;};
const terms=text=>[...new Set(words(text).filter(w=>w.length>2&&!['the','and','for','with','what','how','are','your','screw','screws'].includes(w)))];
const overlap=(a,b)=>{if(!a.length||!b.length)return 0;const B=new Set(b);return a.filter(w=>B.has(w)).length/Math.min(a.length,b.length);};
export function duplicateCheck(doc,pages,{ignorePath}={}){
 const own=shingles(plainText(doc)),out=[];let best={score:0,path:null};
 if(own.size){for(const p of pages){if(!p.bodyText||p.path===ignorePath)continue;const theirs=shingles(p.bodyText);let shared=0;for(const s of own)if(theirs.has(s))shared++;const score=shared/own.size;if(score>best.score)best={score,path:p.path,title:p.title};}}
 const pct=Math.round(best.score*100);
 if(best.score>0.2)out.push(issue('block','duplicate_content',`与 ${best.path} 有${pct}%的连续词句重合，属于重复内容`));
 else if(best.score>0.08)out.push(issue('fix','partial_overlap',`与 ${best.path} 有${pct}%的连续词句重合；请改写重合段落`));
 const titleTerms=terms(doc.title);for(const p of pages)if(/^\/(blog|guides|industry-insights)\//.test(p.path||'')&&p.path!==ignorePath&&overlap(titleTerms,terms(p.title))>=0.8){out.push(issue('block','duplicate_title','标题与已有文章几乎相同：'+p.path));break;}
 const seen=new Map();for(const s of sentencesOf(plainText(doc)).filter(s=>s.length>60)){const k=s.toLowerCase();seen.set(k,(seen.get(k)||0)+1);}const repeats=[...seen.entries()].filter(([,n])=>n>1);if(repeats.length)out.push(issue('fix','repeated_sentence','文中有重复的句子',repeats[0][0]));
 return {issues:out,maxOverlap:pct,closestPath:best.path};
}

// --- SEO ---
export function seoCheck(doc,{primaryKeyword='',validPaths=new Set(),targetPath='',slug='',takenSlugs=new Set()}={}){
 const out=[],kw=terms(primaryKeyword),has=text=>!kw.length||overlap(kw,terms(text))>=0.6,count=wordCount(doc);
 if(doc.title.length>70)out.push(issue('fix','title_length','标题超过70个字符'));
 if(!doc.metaTitle||doc.metaTitle.length>60)out.push(issue('fix','meta_title','搜索标题缺失或超过60个字符'));
 if(doc.metaDescription.length<110||doc.metaDescription.length>160)out.push(issue('fix','meta_description','Meta描述应为110–160个字符，当前'+doc.metaDescription.length));
 if(!has(doc.title)&&!has(doc.metaTitle))out.push(issue('fix','keyword_title','标题未包含主关键词：'+primaryKeyword));
 if(!has(doc.intro))out.push(issue('fix','keyword_intro','引言未包含主关键词'));
 const introSentences=sentencesOf(doc.intro).length;if(introSentences>4)out.push(issue('fix','intro_length','引言应在两三句内直接回答问题'));
 if(doc.sections.length<4||doc.sections.length>8)out.push(issue('fix','section_count','建议4–8个章节，当前'+doc.sections.length));
 if(count<800)out.push(issue('fix','too_short','正文约'+count+'词，少于800词'));if(count>2600)out.push(issue('fix','too_long','正文约'+count+'词，超过2600词'));
 const links=[...plainText(doc).matchAll(/\]\((\/[^)\s]*)\)/g)].map(m=>m[1]);
 const bad=links.filter(l=>!validPaths.has(l));if(bad.length)out.push(issue('fix','invalid_link','内链指向不存在的页面：'+[...new Set(bad)].join(', ')));
 if(new Set(links.filter(l=>validPaths.has(l))).size<3)out.push(issue('fix','few_links','有效内链少于3个'));
 if(targetPath&&!links.includes(targetPath))out.push(issue('fix','target_link','没有链接到目标页面 '+targetPath));
 if(doc.faq.length<3)out.push(issue('fix','faq','常见问题少于3条'));
 if(takenSlugs.has(slug))out.push(issue('block','slug_taken','网址已被占用：/blog/'+slug+'/'));
 return out;
}

// --- Style ("AI tone") ---
const MEMO=/\b(?:sources? (?:reviewed|we reviewed|consulted)|reviewed (?:sources|material)|(?:the )?evidence (?:supports|does not support|reviewed)|what the evidence|this article (?:cannot|does not|can not)|editorial (?:reading|working structure)|nothing in the reviewed|the honest summary)\b/i;
const STOCK=/\b(?:in conclusion|it is important to note|it's important to note|in today's|ever-evolving|delve into|game.changer|unlock the potential|seamlessly|plays? a crucial role|in the realm of|navigating the|a testament to|when it comes to)\b/i;
const CAVEAT=/\b(?:must be confirmed|should be confirmed|confirm(?:ed)? (?:with|against|during)|subject to (?:review|confirmation)|depends on the (?:actual|specific)|is not a guarantee|cannot be assumed|requires? (?:confirmation|review))\b/i;
export function styleCheck(doc){
 const out=[],sents=sentencesOf(plainText(doc)),count=Math.max(1,wordCount(doc));
 const memo=sents.filter(s=>MEMO.test(s));if(memo.length)out.push(issue('fix','research_memo','讨论“资料/证据本身”的句子，读者不需要；删除或改为直接结论',memo[0]));
 const stock=sents.filter(s=>STOCK.test(s));if(stock.length)out.push(issue('fix','stock_phrase','空泛套话，删除或改为具体内容',stock[0]));
 const caveats=sents.filter(s=>CAVEAT.test(s));if(caveats.length/count*1000>5)out.push(issue('fix','too_many_caveats',`“需确认/取决于”类保留说明过多（${caveats.length}处）；每个条件只在相关结论旁说一次`,caveats[1]||caveats[0]));
 const style=assessWritingStyle({title:doc.title,intro:doc.intro,sections:doc.sections,checklist:doc.checklist,example:doc.example});
 if(style.score>=50)out.push(issue('fix','style_risk','写作风格风险偏高：'+style.signals.filter(s=>s.points).map(s=>s.label).join('、')));
 return {issues:out,styleScore:style.score,signals:style.signals};
}

export function runChecks(doc,ctx){
 const truth=truthCheck(doc,ctx.facts||''),dup=duplicateCheck(doc,ctx.pages||[],{ignorePath:ctx.ignorePath}),seo=seoCheck(doc,ctx),style=styleCheck(doc);
 const issues=[...truth,...dup.issues,...seo,...style.issues];
 return {issues,blocking:issues.filter(i=>i.level==='block'),fixable:issues.filter(i=>i.level==='fix'),review:issues.filter(i=>i.level==='review'),metrics:{words:wordCount(doc),maxOverlapPercent:dup.maxOverlap,closestPage:dup.closestPath,styleScore:style.styleScore}};
}
