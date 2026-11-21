(()=>{'use strict';const $=s=>document.querySelector(s),root=$('#gsc-panel');if(!root)return;
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const api=async(action,body)=>{const r=await fetch('/api/admin/'+action,{cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||'Search Console 操作失败');return data;};
const stamp=s=>s?new Date(s).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}):'尚未同步';
const kinds={new_article:'适合写新文章',improve_page:'现有页面排名靠后，可改进'};
const status=(text,error)=>{const s=$('#gsc-status');s.textContent=text;s.style.color=error?'#b42318':'';};
async function load(){try{const d=await api('gsc-state'),f=$('#gsc-settings');f.elements.property.value=d.property||'';f.elements.enabled.checked=!!d.enabled;
 const parts=[d.configured?'已保存服务账号：'+d.clientEmail:'尚未配置服务账号','上次同步：'+stamp(d.lastSync),d.window?'数据范围：'+d.window.startDate+' 至 '+d.window.endDate:'','记录数：'+(d.rowCount||0)];if(d.lastError)parts.push('最近错误：'+d.lastError);status(parts.filter(Boolean).join(' · '),!!d.lastError);
 const list=$('#gsc-opportunities');list.replaceChildren();if(!d.opportunities.length){list.append(el('p',d.configured?'暂无符合条件的搜索词（新网站数据较少时属正常）。':'配置并同步后显示。'));return;}
 const table=el('table'),head=el('tr');for(const h of ['搜索词','类型','曝光','点击','平均排名','当前主要页面'])head.append(el('th',h));const thead=el('thead');thead.append(head);const tbody=el('tbody');
 for(const o of d.opportunities){const tr=el('tr');tr.append(el('td',o.query),el('td',kinds[o.kind]||o.kind),el('td',String(o.impressions)),el('td',String(o.clicks)),el('td',String(o.position)),el('td',o.page));tbody.append(tr);}table.append(thead,tbody);list.append(table);}
 catch(e){status(e.message,true);}}
$('#gsc-settings').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;try{await api('gsc-settings',{property:f.elements.property.value,credentials:f.elements.credentials.value.trim()||undefined,enabled:f.elements.enabled.checked});f.elements.credentials.value='';status('已保存');await load();}catch(err){status(err.message,true);}});
$('#gsc-sync').addEventListener('click',async e=>{const b=e.currentTarget;b.disabled=true;status('正在同步…');try{const r=await api('gsc-sync',{});status('同步完成：'+r.rows+' 条记录（'+r.startDate+' 至 '+r.endDate+'）');await load();}catch(err){status(err.message,true);}finally{b.disabled=false;}});
$('#gsc-clear').addEventListener('click',async()=>{if(!confirm('确定清除 Search Console 配置和已同步的数据？'))return;try{await api('gsc-settings',{clear:true});status('已清除');await load();}catch(err){status(err.message,true);}});
void load();})();
