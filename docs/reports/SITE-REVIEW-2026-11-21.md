# ZUFEK 网站评审与改进清单（2026-11-21）

范围：架构、前台设计、内容、SEO、GEO（生成式引擎/AI 搜索可见性）。
依据：本地静态导出 `static-site/`（811 页，6 语言各约 135 页）量化检查 + 桌面/手机截图 + 源码与部署配置阅读 + 线上 https://zufek.net 对比（2026-11-21）。未执行构建，未登录后台。

优先级：**P0** 尽快处理；**P1** 1–2 个月内；**P2** 中长期。

---

## 〇、线上 zufek.net 对比结果

| 检查项 | 线上结果 | 结论 |
|---|---|---|
| canonical / hreflang / sitemap / robots | 均为 `https://zufek.net/` | ✅ 生产构建已使用正式域名（仓库内 `static-site/` 仍是临时域名，仅影响静态导出，见 P2） |
| http → https | `http://zufek.net/` 301 到 https | ✅ |
| HSTS、nosniff、Referrer-Policy | 已设置 | ✅ |
| 无尾斜杠 | 308 到带斜杠 URL | ✅ |
| 不存在的 URL | 返回真实 404 | ✅ |
| gzip | 首页 45 KB → 约 12 KB | ✅ |
| **www.zufek.net（https）** | 证书校验失败（self-signed in chain） | ❌ **P0**：访问 www 的用户会看到证书警告 |
| **www.zufek.net（http）** | 返回 nginx “404 Not Found” 页面，但状态码为 **200** | ❌ **P0**：软 404，且未 301 到主域 |
| 静态资源缓存头 | `site.css`、`site.js`、图片同时出现两条 `Cache-Control`（应用的 `public, max-age=…` + 反代追加的 `no-cache`） | ⚠️ P1：头冲突，浏览器按 `no-cache` 处理，每次都要回源校验 |
| CSS/JS 缓存时长 | `max-age=300`，文件名无版本哈希 | ⚠️ P1：加内容哈希后可设长缓存 |
| 字体 | H1 计算字体为 `Manrope, Arial`，线上未加载任何 Web 字体 | ❌ 与本地一致，实际显示为 Arial |
| 手机 Cookie 弹窗 | 线上仍遮挡约半屏首屏 | ❌ 与本地一致 |
| 产品页 FAQPage schema | 无 | 与本地一致 |
| llms.txt 中奔驰/宝马品牌名 | 仍存在 | 与本地一致 |
| 博客 sitemap lastmod | 306 条中 209 条为 2026-10-29 | 批量发布特征在线上同样可见 |
| Cookie 文案 | 线上已通过后台改为 GDPR 表述，与仓库源不同 | ⚠️ 印证“两个内容来源”问题：后台修改未回写源码 |

**www 修复建议**：为 `www.zufek.net` 签发有效证书（或与主域共用证书），并在 Nginx/OpenResty 配置 `http(s)://www.zufek.net/* → 301 https://zufek.net/$request_uri`。同时检查反代配置，不要对已带 `Cache-Control` 的上游响应再追加一条。

---

## 一、现状数据摘要

| 指标 | 结果 |
|---|---|
| 页面数 | en 136 / de·es·fr·it·zh 各 135 |
| 英文内容分布 | 产品 32、博客 43、行业洞察 7、指南 9、工艺 12、材料 8、行业 9、应用示例 3 |
| 标题 / 描述重复 | 0 / 0 |
| H1 异常、图片缺 alt | 0 / 0 |
| 标题 > 60 字符 | 45 页（英文） |
| 描述 > 160 字符 | 43 页（英文） |
| 结构化数据 | Organization、WebPage、BreadcrumbList、BlogPosting、TechArticle、Service、FAQPage（仅 /faq） |
| 首页体积 | 27 请求，约 265 KB |
| 产品页模板化程度 | 31 个产品页中，约 30% 的句子在 ≥3 个页面重复出现 |
| 博客发布日期 | 43 篇中 36 篇为同一天（2026-10-29），其余集中在 11-02/03 |
| 作者 | 全站唯一作者 “Theo Wan”，schema 中声明为笔名（Organization 类型） |
| Organization `sameAs` | 无 |
| llms.txt / llms-full.txt | 42 KB / 790 KB |

---

## 二、SEO 评价

### 做得好的
- 技术基础扎实：无后缀 URL、canonical、6 语言 hreflang + x-default、分类型 sitemap、robots 合理屏蔽后台与 API、法律类页面 noindex。
- 页面元信息零重复，H1 唯一，alt 全覆盖，面包屑 schema 完整。
- 话题架构清晰：产品 ↔ 工艺 ↔ 材料 ↔ 行业 ↔ 文章互相内链，主题集群（topic cluster）思路正确。
- 长尾选题方向对：如 “shoulder screw drawing guide”“coating allowance thread shoulder”“rolled vs cut thread RFQ”，贴合工程采购的真实搜索意图。
- 页面速度好，Core Web Vitals 有先天优势。

### 问题与改进

**P0**
1. **www 主机名**：https 证书无效、http 返回 200 状态的 404 页面（详见第〇节）。线上主域 canonical 已正确。
2. **批量同日发布风险**：36 篇博客同日发布、结构与篇幅（约 600–700 词）高度一致，容易被判定为规模化生成内容（Google “scaled content abuse”/有用内容系统）。建议：
   - 今后按周节奏发布，不再批量上线；
   - 对现有文章逐篇补充“只有工厂才写得出”的内容（见第四节），否则考虑合并薄弱篇目；
   - `dateModified` 只在实质修改时更新。

**P1**
3. **关键词蚕食（cannibalization）**：以下产品页主题高度重叠，需合并、或明确区分意图并互相 canonical/内链说明：
   - `custom-screws` vs `core-custom-screws`
   - `special-head-screws` vs `special-head-bolts`
   - `special-thread-screws` vs `special-thread-profiles` vs `fine-thread-screws`
   - `eye-bolts` vs `lifting-eye-bolts`
   - `shoulder-screws` vs `double-ended-shoulder-screws` vs `multi-step-screws`
4. **产品页模板化过重**：约 30% 句子跨页重复（交期、材料列表、“Share your drawing…”、路线说明等）。把通用段落收进一个共享组件并缩短，正文篇幅让给该产品独有的内容（典型尺寸范围、常见失效、图纸关键尺寸、工艺路线差异）。
5. **薄页面**：`/guides/rfq-checklist`（209 词）、`/guides/drive-types`（258 词）、`/guides/material-strength-selection`（512 词）、`/applications`（240 词）、`/industries`（320 词）、`/industry-insights`（183 词）。尤其 RFQ checklist 被全站大量内链，却是最薄的页面之一——应扩写为可下载的完整清单。
6. **结构化数据不足**：
   - 产品页 FAQ 未标记 `FAQPage`（目前只有 /faq 有）；
   - Organization 缺 `sameAs`、`foundingDate`、`numberOfEmployees`（如属实）、`logo` 校验；
   - 可为产品族增加 `Product`（不带价格/评分，避免虚构）或保持 `Service` 但补 `areaServed`、`serviceType`；
   - 作者用 Organization 类型的笔名，E-E-A-T 信号弱（见第三节）。
7. **标题 / 描述长度**：45 个标题 > 60 字符、43 个描述 > 160 字符，会被截断。核心关键词前置。
8. **缺少商业意图关键词落地页**：如 “custom screw manufacturer China”“non-standard fastener supplier”“OEM screw factory Dongguan”。首页承担了全部，可以考虑一个 “Why source from ZUFEK / 工厂介绍” 页承接。

**P2**
9. **外链与品牌信号几乎为零**：网站自身之外缺乏可被验证的存在。建议建立并在 `sameAs` 中关联：LinkedIn 公司页、Google 商家资料、行业目录（如 Thomasnet、Made-in-China、Global Sources 中选择适合的）、展会参展记录。
10. **多语言质量**：6 语言全量翻译，规模大但难以人工审校。建议优先保证 de 的质量（德语区是精密紧固件核心市场），其余语言先限于产品与核心页面，避免低质量译文拖累整体评价。

---

## 三、GEO（AI 搜索 / 大模型引用）评价

### 做得好的
- 提供 `llms.txt` 与 `llms-full.txt`，公司事实（成立年份、地点、产能、交期）集中、口径一致，便于模型抽取。
- robots 未屏蔽 AI 爬虫；页面为纯 HTML，无需 JS 渲染即可读取，对 GPTBot/ClaudeBot/PerplexityBot 友好。
- 内容事实克制，不虚构认证和案例，降低被模型“幻觉放大”的风险。

### 问题与改进

**P1**
1. **可引用的具体信息太少**：大模型更倾向引用含明确数字、定义、对比表的段落。目前大量句子是 “can be discussed / confirmed during quotation / subject to review”，以肩部螺丝页为例全页只出现 4 个数值。在**不虚构**的前提下可以补充：
   - 公开标准数据（ISO 7379 肩部螺丝尺寸、ISO 898-1 性能等级、ISO 4042 电镀、ISO 10683 锌片涂层的通用要求）并注明出处；
   - 工厂真实的加工范围（直径/长度范围、可做的头型与驱动、常用材料牌号），以“典型范围”表述；
   - 决策对比表（冷镦 vs 车削、滚丝 vs 切丝、镀镍 vs 钝化：适用场景、成本趋势、交期影响）。
2. **免责语过密**：同类声明在单页内多次出现，稀释了可被引用的信息密度，也让模型摘要时倾向于“无明确结论”。每页集中写一处即可。
3. **作者可信度**：唯一作者为笔名且声明无资历。AI 搜索与 Google 都看重“谁说的”。建议以真实工程/品质负责人署名（经本人同意，资历只写属实部分），或改为以公司技术部署名并附工厂介绍页。
4. **llms.txt 中出现 Mercedes-Benz、BMW 品牌名**（以否定句形式，且多语言页面中同样出现）。模型抽取时可能丢失否定语境，反而形成“ZUFEK—奔驰/宝马”关联，也有商标使用风险。建议改为“相关车型零部件供应链项目”之类不点名表述，或经法务确认后再保留。
5. **llms-full.txt 790 KB 过大**：多数抓取方只读前一部分。按语言或栏目拆分，英文主文件控制在 100–200 KB，优先放公司事实、产品族定义和核心指南。

**P2**
6. **问答型内容覆盖**：可从客户真实询盘问题（脱敏）整理 Q&A，每条一句话直接回答 + 展开说明，结构化为 FAQPage。这是 AI 搜索最常引用的形态。
7. **第三方提及**：生成式引擎很依赖站外语料（目录、论坛、媒体、展会名单）。与 SEO 第 9 条一起推进。
8. **监测**：定期在 ChatGPT / Perplexity / Gemini / Google AI Overviews 中检索 10–20 个目标问题，记录是否被提及和引用，作为 GEO 效果基线。

---

## 四、内容整体评价

- **优点**：选题专业，紧贴工程采购流程（图纸、公差、涂层、检验、首件、批次追溯）；口径一致，诚实克制；覆盖面完整。
- **主要不足**：读起来像“写得很好的通用顾问手册”，缺少**工厂的第一手痕迹**——没有车间/设备/检测实拍，没有真实的加工经验（如某类零件常见的返工原因、某材料镦制开裂的处理），没有真实的人。这是 SEO（E-E-A-T 中的 Experience）、GEO（可引用性）和询盘转化共同的短板。
- **建议补充（全部需真实素材，不虚构）**：
  - 工厂与设备实拍、品质检测实拍（CCD、投影仪、硬度计等实际拥有的设备）；
  - 完整地址、电话 / WhatsApp、工作时间、地图；
  - 体系认证（仅限实际持有的，附证书编号或扫描件）；
  - 经客户授权的匿名化案例（“某欧洲设备制造商的肩部螺丝从车削改为冷镦”这类，前提是真实发生且获准）；
  - 每篇技术文章至少一处“我们在实际生产中看到的情况”。

---

## 五、架构与前台设计（上一轮评审要点汇总）

**P0**
- www 证书与跳转（同第〇节）。
- CSS 中声明了 `Manrope`、`DM Sans`，但没有任何 `@font-face` 或字体引入，线上实际回落到 Arial：自托管字体（woff2 + `font-display: swap`）或改声明。
- 手机端 Cookie 弹窗遮挡约半屏首屏，加上底部固定报价栏，主视觉不可见：改为紧凑底部条。

**P1**
- 补充信任信号（工厂、联系方式、认证——仅限真实）。
- 精简重复免责文案；首页与产品页缩短，减少大段纯文本，修正“相关阅读”单卡片留白。
- 卡片正文字号与对比度偏低；文件上传控件使用原生样式。
- 删除未使用的 `components/ui/`（62 个文件）与相关依赖，修正 package 名称 `site-creator-vinext-starter`。

**P2**
- 仓库内 `static-site/` 与 `site-content.config.json` 仍使用临时域名 `precision-custom-fasteners-yang.boldshrew261.chatgpt.site`（线上已正确）：统一为 `https://zufek.net`，避免误用静态导出时带出错误 canonical。
- Cloudflare/Sites（vinext beta）与 Docker Node 双运行时并行，测试面翻倍：确定主运行时。
- 生成物入库（`static-site/` 49 MB、`lib/generated-pages.json` 31 MB、`translations/` 6.9 MB）：评估改为构建期生成。
- 内容同时存在于 `scripts/*.mjs` 与后台数据库覆盖层：书面规定优先级与冲突处理。
- 部分源码为压缩风格长行，人工维护成本高。
- AI 内容管线约 25 个模块并在运行镜像中带 Chromium 抓取 PAA：评估成本、维护量与搜索引擎服务条款风险。
- 文档分散（根目录 6 份 + `docs/` 17 份）：合并索引。

---

## 六、建议执行顺序

1. www 证书与 301 跳转 → 字体 → 手机 Cookie 条 → 反代缓存头（P0/P1）。
2. 合并蚕食产品页、扩写 RFQ checklist 等薄页、产品页 FAQ schema、Organization `sameAs`（P1，SEO）。
3. 收集真实工厂素材与联系方式，改写作者署名，llms.txt 去品牌名并拆分（P1，GEO/信任）。
4. 每周 1–2 篇带一线经验的文章替代批量发布；建立 AI 搜索可见性基线（P2）。
5. 架构收敛（P2）。
