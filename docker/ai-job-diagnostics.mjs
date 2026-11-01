export function publicationDiagnostic(job,prepare){
 const result=job.result||{},stage=job.progress?.stage||result.stopStage||'';const base={ready:false,slug:result.article?.slug||null,stage};
 if(['queued','running'].includes(job.status))return {...base,reason:'任务仍在排队或执行，尚未完成文章生成。'};
 if(job.status==='hold')return {...base,reason:'任务在'+({PLAN:'选题',RESEARCH:'资料检索',OUTLINE:'全文对照与提纲',OUTLINE_FOLLOWUP:'补查后的提纲',RESEARCH_FOLLOWUP:'补充检索',DRAFT:'正文生成'}[stage]||'资料评估')+'阶段暂缓，尚未生成可发布正文；不是旧稿缺少article。请查看暂缓原因及补查记录。'};
 if(job.status==='no_change')return {...base,reason:'已判断无需新增或更新文章，因此没有创建草稿。'};
 if(['failed','cancelled'].includes(job.status))return {...base,reason:'任务未完成，请先处理执行错误或取消状态；不能进入审核发布。'};
 if(job.type==='translation')return {...base,reason:'这是独立翻译任务，请查看对应英文文章的发布流程。'};
 if(!result.article)return {...base,reason:'此稿只有任务正文，缺少结构化article数据；旧稿需整理为完整文章，不要盲目重新调用模型。'};
 try{prepare?.(job);return {...base,ready:true,reason:job.status==='in_review'?'英文待审核；审核通过后建立文章草稿，自动翻译并统一发布。':job.status==='approved'?'英文已审核，请查看六语言发布进度；旧审批记录需显式启动发布流程。':'文章结构有效，等待审核。'};}catch(e){return {...base,reason:'文章结构校验未通过：'+String(e.message||e).slice(0,400)};}
}
