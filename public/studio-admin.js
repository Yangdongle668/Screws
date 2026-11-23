(()=>{'use strict';const $=s=>document.querySelector(s),root=$('[data-admin-panel="studio"]');if(!root)return;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n;};
const api=async(action,body)=>{const r=await fetch('/api/admin/'+action,{cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await r.json().catch(()=>({}));if(!r.ok){const err=Error(data.error||'操作失败');err.data=data;throw err;}return data;};
const stamp=s=>s?new Date(s).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}):'';
const STATUS={queued:'排队中',running:'生成中',review:'待审核',blocked:'被拦截',failed:'失败',approved:'已交付六语言发布',discarded:'已丢弃'};
const SOURCE={manual:'手动提示',search_console:'Search Console',paa:'PAA问题',coverage:'覆盖缺口'};
const LEVEL={block:'拦截',fix:'需修订',review:'人工核对'};
const STAGE={TOPIC:'选题',BRIEF:'写作简报',DRAFT:'正文',REVISE:'修订',DONE:'完成'};
const LANG={en:'英语',de:'德语',es:'西班牙语',it:'意大利语',fr:'法语',zh:'中文'};
const PUB={queued:'等待发布',working:'发布中',published:'六语言已发布',failed:'发布未完成',cancelled:'发布已取消',unknown:'状态未知'};
const STEP={pending:'等待翻译',queued:'等待翻译',generating:'翻译中',translated:'已翻译，待发布',ready:'已保存，待统一发布',published:'已发布',failed:'失败',cancelled:'已取消'};
const phaseText=p=>{if(!p?.phase)return '';if(p.phase.startsWith('translate:'))return '正在翻译'+(LANG[p.phase.split(':')[1]]||p.phase.split(':')[1]);return {prepare:'准备英文原稿',publish:'统一发布',complete:'完成'}[p.phase]||p.phase;};
const pubText=p=>p?(PUB[p.status]||p.status)+(p.status==='working'&&phaseText(p)?' · '+phaseText(p):''):'';
let current=null,timer=null;
const status=(text,error)=>{const s=$('#studio-status');s.textContent=text||'';s.style.color=error?'#b42318':'';};
async function load(){try{const d=await api('studio-state'),f=$('#studio-config');const cs=$('#studio-copyscape');if(cs&&d.copyscape){cs.elements.username.value=d.copyscape.username||'';cs.elements.mode.value=d.copyscape.mode;cs.elements.threshold.value=d.copyscape.threshold;cs.elements.spendLimit.value=d.copyscape.spendLimit;cs.elements.apiKey.placeholder=d.copyscape.keySaved?'已保存（留空保持）':'未保存';}f.elements.enabled.checked=!!d.config.enabled;f.elements.days.value=(d.config.days||[]).join(',');f.elements.hour.value=d.config.hour;
 const list=$('#studio-jobs');list.replaceChildren();if(!d.jobs.length){list.append(el('p','还没有任务。'));return;}
 const table=el('table'),head=el('tr');for(const h of ['创建时间','选题来源','选题','标题','状态','检查','操作'])head.append(el('th',h));const thead=el('thead');thead.append(head);const tbody=el('tbody');
 for(const j of d.jobs){const tr=el('tr'),open=el('button','查看','btn outline');open.type='button';open.addEventListener('click',()=>detail(j.id));
  const state=j.status==='approved'&&j.publication?pubText(j.publication):STATUS[j.status]||j.status,stage=j.status==='running'&&j.progress?.stage?'（'+(STAGE[j.progress.stage]||j.progress.stage)+'）':'';
  const checks=j.status==='queued'||j.status==='running'?'':`拦截${j.blocking} 修订${j.fixable} 核对${j.review}`;
  const actions=el('td');actions.append(open);tr.append(el('td',stamp(j.createdAt)),el('td',SOURCE[j.topicSource]||(j.status==='queued'?'待定':'—')),el('td',j.question||j.hint||'—'),el('td',j.title||'—'),el('td',state+stage+(j.error?'：'+j.error:'')),el('td',checks),actions);tbody.append(tr);}
 table.append(thead,tbody);list.append(table);
 clearTimeout(timer);if(d.jobs.some(j=>['queued','running'].includes(j.status)||['queued','working'].includes(j.publication?.status)))timer=setTimeout(()=>{void load();if(current&&!$('#studio-detail').hidden)void detail(current.id,true);},8000);}
 catch(e){status(e.message,true);}}
function section(title){const box=el('div',null,'note-box');box.append(el('h4',title));return box;}
async function detail(id,quiet){try{const j=await api('studio-job?id='+encodeURIComponent(id));current=j;const box=$('#studio-detail');box.hidden=false;box.replaceChildren();
 box.append(el('h3',(j.article?.title||j.brief?.title||j.title||j.question||'任务')+' · '+(j.status==='approved'&&j.publication?pubText(j.publication):STATUS[j.status]||j.status)));
 if(j.error)box.append(el('p','错误：'+j.error));
 if(j.publication){const p=j.publication,s=section('六语言发布：'+pubText(p));if(p.error)s.append(el('p','原因：'+p.error));
  const steps=new Map((p.languages||[]).map(l=>[l.locale,l])),table=el('table'),head=el('tr');for(const h of ['语言','状态','尝试次数','错误'])head.append(el('th',h));const thead=el('thead');thead.append(head);const tbody=el('tbody');
  const english=el('tr');english.append(el('td','英语'),el('td',p.status==='published'||p.phase&&p.phase!=='prepare'?'已保存':'准备中'),el('td',''),el('td',''));tbody.append(english);
  for(const code of ['de','es','it','fr','zh']){const l=steps.get(code)||{};const tr=el('tr');tr.append(el('td',LANG[code]),el('td',STEP[l.status]||l.status||'等待翻译'),el('td',l.attempts?String(l.attempts):''),el('td',l.error||''));tbody.append(tr);}
  table.append(thead,tbody);s.append(table);
  if(p.status==='published'&&j.slug){const a=el('a','查看已发布文章 ↗');a.href='/blog/'+j.slug+'/';a.target='_blank';a.rel='noopener';s.append(a);}
  if(['failed','cancelled'].includes(p.status)){const retry=el('button','重试未完成的翻译与发布','btn primary');retry.type='button';retry.addEventListener('click',()=>act('studio-publish-retry',{id:j.id},'已重新排队，已完成的语言不会重复翻译'));s.append(retry);s.append(el('p','已完成的语言会保留；每种语言最多尝试10次。格式问题导致的失败会优先重新解析已保存的模型输出，不重新收费。','fine'));}
  box.append(s);}
 if(j.topic){const t=section('选题');t.append(el('p','来源：'+(SOURCE[j.topic.source]||j.topic.source)+(j.topic.evidence?.impressions?' · 曝光 '+j.topic.evidence.impressions+' · 平均排名 '+j.topic.evidence.position:'')+(j.topic.evidence?.articleCount!==undefined?' · 该页面现有支持文章 '+j.topic.evidence.articleCount+' 篇':'')),el('p','读者问题：'+(j.topic.question||j.topic.keyword)),el('p','主产品页：'+j.topic.targetPath));if(j.topic.alternatives?.length)t.append(el('p','备选：'+j.topic.alternatives.map(a=>a.question).join('；')));box.append(t);}
 if(j.brief){const b=section('写作简报');b.append(el('p','主关键词：'+j.brief.primaryKeyword+(j.brief.secondaryKeywords.length?' · 相关词：'+j.brief.secondaryKeywords.join('、'):'')),el('p','分类：'+j.brief.category+' · 章节：'+j.brief.sections.map(s=>s.heading).join(' / ')),el('p','内链：'+j.brief.internalLinks.map(l=>l.anchor+' → '+l.path).join('；')));box.append(b);}
 if(j.checks){const c=section('检查结果');const m=j.checks.metrics||{};c.append(el('p',`正文约 ${m.words||0} 词 · 与站内最接近页面重合 ${m.maxOverlapPercent||0}%${m.closestPage?'（'+m.closestPage+'）':''} · 写作风格风险 ${m.styleScore??0}/100（风格提示，不是AI生成比例）`));
  const items=[...(j.checks.structure||[]).map(message=>({level:'block',message})),...(j.checks.issues||[])];if(!items.length)c.append(el('p','没有发现问题。'));const ul=el('ul');for(const i of items){const li=el('li','【'+(LEVEL[i.level]||i.level)+'】'+i.message);if(i.excerpt){li.append(el('br'));li.append(el('q',i.excerpt));}ul.append(li);}c.append(ul);box.append(c);}
 if(j.draftText&&['review','blocked','approved'].includes(j.status)){const x=j.externalCheck,s=section('外部查重（Copyscape）');
  if(!x)s.append(el('p','尚未检查。启用后，审核通过时会自动检查一次。'));else{s.append(el('p','与网上已有内容重合约 '+x.percent+'% · 匹配网页 '+x.count+' 个 · 检查 '+x.words+' 词 · 费用 $'+x.cost+' · '+stamp(x.checkedAt)+(x.stale?' · 正文已修改，结果已过期':'')));const ul=el('ul');for(const m of x.results){const li=el('li'),a=el('a',m.title||m.url);a.href=m.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,el('span',' · 重合 '+(m.wordsMatched??m.minWordsMatched)+' 词'+(m.percentMatched!==null?'（'+m.percentMatched+'%）':'')));const quote=m.matchedText||m.snippet;if(quote){li.append(el('br'));li.append(el('q',quote.slice(0,300)));}ul.append(li);}if(x.results.length)s.append(ul);}
  if(['review','blocked'].includes(j.status)){const run=el('button',x&&!x.stale?'重新外部查重':'运行外部查重（按 Copyscape 计费）','btn outline');run.type='button';run.addEventListener('click',()=>act('studio-external-check',{id:j.id},'外部查重完成'));s.append(run);
   if(x&&!x.stale&&x.results.length){const fix=el('button','按查重结果改写重合句子（1次模型调用）','btn outline');fix.type='button';fix.addEventListener('click',()=>{if(confirm('只改写与外部网页重合的句子，其余内容保持不变。改写后需要重新外部查重。继续吗？'))act('studio-external-rewrite',{id:j.id},'已改写重合句子并重新检查；请再运行一次外部查重');});s.append(fix);}}
  box.append(s);}
 if(j.draftText){const e=section('正文（可直接修改；保存后只在本地重新检查，不调用模型）');const area=el('textarea');area.value=j.draftText;area.rows=24;area.style.width='100%';area.spellcheck=false;e.append(area);
  if(['review','blocked'].includes(j.status)){const save=el('button','保存修改并重新检查','btn outline');save.type='button';save.addEventListener('click',()=>act('studio-save-text',{id:j.id,text:area.value},'已保存并重新检查'));e.append(save);}box.append(e);}
 const row=el('div',null,'button-row');const button=(label,cls,fn)=>{const b=el('button',label,cls);b.type='button';b.addEventListener('click',fn);row.append(b);};
 if(j.status==='review')button('审核通过，发布六种语言','btn primary',()=>{if(confirm('确认英文内容已人工审核？通过后将自动翻译并发布六种语言。'))approve(j.id);});
 if(['failed','blocked'].includes(j.status)){button('重试（保留选题和简报）','btn outline',()=>act('studio-retry',{id:j.id},'已重新排队'));button('重写正文','btn outline',()=>act('studio-retry',{id:j.id,rewrite:true},'已重新排队'));button('换一个选题','btn outline',()=>act('studio-retry',{id:j.id,newTopic:true},'已重新排队'));}
 if(!['running','approved','discarded'].includes(j.status))button('丢弃','btn outline',()=>{if(confirm('丢弃这个任务？'))act('studio-discard',{id:j.id},'已丢弃');});
 box.append(row);if(!quiet)box.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){status(e.message,true);}}
async function approve(id){status('正在检查并提交发布…');try{await api('studio-approve',{id});}catch(e){if(!e.data||!e.data.needsConfirmation){status(e.message,true);await detail(id,true);return;}await detail(id,true);if(!confirm(e.message+'\n\n仍然发布吗？')){status('已取消发布，可修改正文后重新查重',true);return;}try{await api('studio-approve',{id,acknowledgeExternal:true});}catch(err){status(err.message,true);return;}}status('已交付六语言发布，进度见下方');await load();await detail(id,true);}
async function act(action,body,done){try{await api(action,body);status(done);await load();if(current&&action!=='studio-discard')await detail(current.id);else $('#studio-detail').hidden=true;}catch(e){status(e.message,true);}}
$('#studio-create').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button');if(button)button.disabled=true;try{await api('studio-create',{hint:form.elements.hint.value});form.elements.hint.value='';status('已加入队列，通常几分钟内完成');await load();}catch(err){status(err.message,true);}finally{if(button)button.disabled=false;}});
$('#studio-config').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;try{await api('studio-config',{enabled:f.elements.enabled.checked,days:f.elements.days.value.split(/[,，\s]+/).filter(Boolean).map(Number),hour:Number(f.elements.hour.value)});status('已保存定时设置');}catch(err){status(err.message,true);}});
$('#studio-refresh').addEventListener('click',load);
$('#studio-copyscape').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;try{await api('studio-copyscape-settings',{username:f.elements.username.value,apiKey:f.elements.apiKey.value||undefined,clearKey:f.elements.clearKey.checked,mode:f.elements.mode.value,threshold:Number(f.elements.threshold.value),spendLimit:Number(f.elements.spendLimit.value)});f.elements.apiKey.value='';f.elements.clearKey.checked=false;status('已保存外部查重设置');await load();}catch(err){status(err.message,true);}});
$('#studio-copyscape-balance').addEventListener('click',async()=>{try{const b=await api('studio-copyscape-balance',{});status('Copyscape 余额：$'+b.value+(Number.isFinite(b.today)?' · 今日剩余检查次数 '+b.today:''));}catch(err){status(err.message,true);}});
void load();})();
