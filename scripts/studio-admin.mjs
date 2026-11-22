export const studioPanel=()=>`<section data-admin-panel="studio" hidden><div class="admin-section-heading"><div><h2>AI文章工坊</h2><p>新版文章生成：服务器选题 → 写作简报 → 正文 → 本地检查（真实性、查重、SEO、AI腔）→ 最多一次修订 → 人工审核 → 六语言翻译发布。每篇通常2次、最多3次模型调用；使用“AI内容维护”中已保存的模型与预算。</p></div><button class="btn outline" id="studio-refresh" type="button">刷新</button></div>
<p id="studio-status" role="status"></p>
<form id="studio-create" class="admin-filters"><label>选题提示（可选，英文）<input name="hint" maxlength="300" placeholder="留空则按 Search Console、PAA 和覆盖缺口自动选题"></label><button class="btn primary">生成一篇</button></form>
<details class="note-box"><summary>定时生成</summary><form id="studio-config" class="admin-record-form"><label class="admin-check"><input type="checkbox" name="enabled">启用定时生成（生成后进入待审核，不会自动发布）</label><label>星期（0周日，1周一…，逗号分隔）<input name="days" value="2"></label><label>北京时间（时）<input name="hour" type="number" min="0" max="23" value="10"></label><button class="btn outline">保存</button></form></details>
<h3>任务</h3><div id="studio-jobs"></div>
<div id="studio-detail" hidden></div></section>`;
