(()=>{'use strict';const $=s=>document.querySelector(s),root=$('[data-admin-panel="studio"]');if(!root)return;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n;};
const api=async(action,body)=>{const r=await fetch('/api/admin/'+action,{cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||'操作失败');return data;};
const stamp=s=>s?new Date(s).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}):'';
const STATUS={queued:'排队中',running:'生成中',review:'待审核',blocked:'被拦截',failed:'失败',approved:'已交付六语言发布',discarded:'已丢弃'};
const SOURCE={manual:'手动提示',search_console:'Search Console',paa:'PAA问题',coverage:'覆盖缺口'};
const LEVEL={block:'拦截',fix:'需修订',review:'人工核对'};
const STAGE={TOPIC:'选题',BRIEF:'写作简报',DRAFT:'正文',REVISE:'修订',DONE:'完成'};
let current=null,timer=null;
const status=(text,error)=>{const s=$('#studio-status');s.textContent=text||'';s.style.color=error?'#b42318':'';};
async function load(){try{const d=await api('studio-state'),f=$('#studio-config');f.elements.enabled.checked=!!d.config.enabled;f.elements.days.value=(d.config.days||[]).join(',');f.elements.hour.value=d.config.hour;
 const list=$('#studio-jobs');list.replaceChildren();if(!d.jobs.length){list.append(el('p','还没有任务。'));return;}
 const table=el('table'),head=el('tr');for(const h of ['创建时间','选题来源','选题','标题','状态','检查','操作'])head.append(el('th',h));const thead=el('thead');thead.append(head);const tbody=el('tbody');
 for(const j of d.jobs){const tr=el('tr'),open=el('button','查看','btn outline');open.type='button';open.addEventListener('click',()=>detail(j.id));
  const state=STATUS[j.status]||j.status,stage=j.status==='running'&&j.progress?.stage?'（'+(STAGE[j.progress.stage]||j.progress.stage)+'）':'';
  const checks=j.status==='queued'||j.status==='running'?'':`拦截${j.blocking} 修订${j.fixable} 核对${j.review}`;
  const actions=el('td');actions.append(open);tr.append(el('td',stamp(j.createdAt)),el('td',SOURCE[j.topicSource]||(j.status==='queued'?'待定':'—')),el('td',j.question||j.hint||'—'),el('td',j.title||'—'),el('td',state+stage+(j.error?'：'+j.error:'')),el('td',checks),actions);tbody.append(tr);}
 table.append(thead,tbody);list.append(table);
 clearTimeout(timer);if(d.jobs.some(j=>['queued','running'].includes(j.status)))timer=setTimeout(load,8000);}
 catch(e){status(e.message,true);}}
function section(title){const box=el('div',null,'note-box');box.append(el('h4',title));return box;}
async function detail(id){try{const j=await api('studio-job?id='+encodeURIComponent(id));current=j;const box=$('#studio-detail');box.hidden=false;box.replaceChildren();
 box.append(el('h3',(j.article?.title||j.brief?.title||j.question||'任务')+' · '+(STATUS[j.status]||j.status)));
 if(j.error)box.append(el('p','错误：'+j.error));
 if(j.topic){const t=section('选题');t.append(el('p','来源：'+(SOURCE[j.topic.source]||j.topic.source)+(j.topic.evidence?.impressions?' · 曝光 '+j.topic.evidence.impressions+' · 平均排名 '+j.topic.evidence.position:'')+(j.topic.evidence?.articleCount!==undefined?' · 该页面现有支持文章 '+j.topic.evidence.articleCount+' 篇':'')),el('p','读者问题：'+(j.topic.question||j.topic.keyword)),el('p','主产品页：'+j.topic.targetPath));if(j.topic.alternatives?.length)t.append(el('p','备选：'+j.topic.alternatives.map(a=>a.question).join('；')));box.append(t);}
 if(j.brief){const b=section('写作简报');b.append(el('p','主关键词：'+j.brief.primaryKeyword+(j.brief.secondaryKeywords.length?' · 相关词：'+j.brief.secondaryKeywords.join('、'):'')),el('p','分类：'+j.brief.category+' · 章节：'+j.brief.sections.map(s=>s.heading).join(' / ')),el('p','内链：'+j.brief.internalLinks.map(l=>l.anchor+' → '+l.path).join('；')));box.append(b);}
 if(j.checks){const c=section('检查结果');const m=j.checks.metrics||{};c.append(el('p',`正文约 ${m.words||0} 词 · 与站内最接近页面重合 ${m.maxOverlapPercent||0}%${m.closestPage?'（'+m.closestPage+'）':''} · 写作风格风险 ${m.styleScore??0}/100（风格提示，不是AI生成比例）`));
  const items=[...(j.checks.structure||[]).map(message=>({level:'block',message})),...(j.checks.issues||[])];if(!items.length)c.append(el('p','没有发现问题。'));const ul=el('ul');for(const i of items){const li=el('li','【'+(LEVEL[i.level]||i.level)+'】'+i.message);if(i.excerpt){li.append(el('br'));li.append(el('q',i.excerpt));}ul.append(li);}c.append(ul);box.append(c);}
 if(j.draftText){const e=section('正文（可直接修改；保存后只在本地重新检查，不调用模型）');const area=el('textarea');area.value=j.draftText;area.rows=24;area.style.width='100%';area.spellcheck=false;e.append(area);
  if(['review','blocked'].includes(j.status)){const save=el('button','保存修改并重新检查','btn outline');save.type='button';save.addEventListener('click',()=>act('studio-save-text',{id:j.id,text:area.value},'已保存并重新检查'));e.append(save);}box.append(e);}
 const row=el('div',null,'button-row');const button=(label,cls,fn)=>{const b=el('button',label,cls);b.type='button';b.addEventListener('click',fn);row.append(b);};
 if(j.status==='review')button('审核通过，发布六种语言','btn primary',()=>{if(confirm('确认英文内容已人工审核？通过后将自动翻译并发布六种语言。'))act('studio-approve',{id:j.id},'已交付发布流程，可在“AI内容维护”查看翻译进度');});
 if(['failed','blocked'].includes(j.status)){button('重试（保留选题和简报）','btn outline',()=>act('studio-retry',{id:j.id},'已重新排队'));button('重写正文','btn outline',()=>act('studio-retry',{id:j.id,rewrite:true},'已重新排队'));button('换一个选题','btn outline',()=>act('studio-retry',{id:j.id,newTopic:true},'已重新排队'));}
 if(!['running','approved','discarded'].includes(j.status))button('丢弃','btn outline',()=>{if(confirm('丢弃这个任务？'))act('studio-discard',{id:j.id},'已丢弃');});
 box.append(row);box.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){status(e.message,true);}}
async function act(action,body,done){try{await api(action,body);status(done);await load();if(current&&action!=='studio-discard')await detail(current.id);else $('#studio-detail').hidden=true;}catch(e){status(e.message,true);}}
$('#studio-create').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button');if(button)button.disabled=true;try{await api('studio-create',{hint:form.elements.hint.value});form.elements.hint.value='';status('已加入队列，通常几分钟内完成');await load();}catch(err){status(err.message,true);}finally{if(button)button.disabled=false;}});
$('#studio-config').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;try{await api('studio-config',{enabled:f.elements.enabled.checked,days:f.elements.days.value.split(/[,，\s]+/).filter(Boolean).map(Number),hour:Number(f.elements.hour.value)});status('已保存定时设置');}catch(err){status(err.message,true);}});
$('#studio-refresh').addEventListener('click',load);
void load();})();
