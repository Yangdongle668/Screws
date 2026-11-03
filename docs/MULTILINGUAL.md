# 多语言维护

英文保留根路径；德语 `/de/`、西班牙语 `/es/`、意大利语 `/it/`、简体中文 `/zh/`、法语 `/fr/`。公开页面共135个基础路径，每种语言各一份；后台仍为中文。没有 `.html` 后缀。

## 内容与翻译

英文内容源位于 `scripts/`。`translations/source.json` 是提取的源文，五份语言字典保存翻译。翻译只在编辑阶段处理，生成、请求及Docker启动不依赖在线翻译服务。技术长段做过工程语境复核，中文核心产品及说明另有人工改写；这不代表专业母语审校认证。修改后仍应结合实际图纸与业务口径检查。

产品和工艺术语由 `terminology.json` 统一，公共界面由 `interface.json` 统一。人工修订保存在 `editorial-review.json` 与 `zh-editorial.json`；应用顺序：

```
node scripts/review-terminology.mjs
node scripts/apply-editorial-review.mjs
node scripts/generate-site.mjs
node scripts/verify-multilingual.mjs
node scripts/verify-language-preference.mjs
```

不要直接改生成页面。新增英文内容须补全五份字典；生成器缺少翻译时会报错。检查包括页面覆盖、对应语言链接、规范网址、内链、占位符和技术数值。自动检查不能判定所有语句是否地道。

本轮语境校订在 `translations/quality-review.json`；`scripts/quality-context-review.mjs`维护对应人工审校映射。`node scripts/apply-editorial-review.mjs`在旧字典之后应用此映射，再应用采购决策校订，避免旧审校文件覆盖新版专业术语。修改后运行完整生成、内容台账及六语言验证。`generate-site.mjs --collect-only`仅用于采集新增英文翻译键，不能作为发布构建；随后必须完整生成。技术校订流程见 `docs/CONTENT-QUALITY-IMPROVEMENTS.md`。

2026-11-03新增采购决策算例与公共界面语境校订，来源为`scripts/buyer-localization.mjs`，生成记录在`translations/buyer-review.json`。该映射在旧审校层之后应用；更新内容时运行`node scripts/buyer-localization.mjs`，再执行完整生成。见`docs/SEO-IMPROVEMENTS-2026-11-03.md`。询盘产品参数响应保留canonical及表单状态，由不带参数的规范页声明语言对应关系。

## 语言入口与默认选择

顶部邮箱旁提供国旗、语言原名和当前项勾选。首次进入英文地址时，优先采用已保存的手动选择，否则按照浏览器语言列表匹配六种支持语言；未匹配保持英文。手动切换保存本机偏好，并保留对应页面、查询参数及锚点。明确访问带语言前缀的链接时保留该语言；站内浏览不反复跳转。搜索爬虫不做客户端自动跳转，全部语言保留可访问网址与 `hreflang`。

语言偏好使用 `zufek_language` 本地存储；本次访问标记使用会话存储，不用于追踪或跨站识别。用户禁用存储时仍可切换，偏好可能无法跨次保留。

## 后台文章与询盘

文章编辑器可分别保存、预览、发布和撤回每种语言。英文源更新后提示译文需要同步；过期译文不能直接重新发布，需核对并保存。撤回只影响对应语言，对应链接和站点地图随发布状态调整。新语言稿必须编辑，不能把英文标题和简介原样发布为译文。

询盘保存提交时语言，后台中文显示。客户原始留言不自动翻译；启用收件确认时按提交语言生成确认内容。翻译记录纳入备份。迁移文件 `drizzle/0006_curvy_squirrel_girl.sql` 创建翻译表并添加询盘语言字段，由既有部署流程应用。

## SEO 与部署

每份译文使用自身 canonical，并提供可用语言的双向 `hreflang`、`x-default`、本地化标题、描述、结构化数据和同语言内链。当前仓库基线的780个可索引语言页面进入站点地图；生产数据库发布文章会动态加入，不能把仓库数量当成生产总数。公共法律说明页保持`noindex,follow`，404和后台为`noindex,nofollow`。各语言提供 `llms.txt` 与 `llms-full.txt`。这些措施帮助发现与理解页面，不保证收录、排名或被模型引用。Sites若仍是私有访问，搜索引擎无法公开抓取。

Docker使用同一套内容与API；运行时从英文模板及本地字典生成语言页面，避免把所有完整页面同时打入服务。更新仍使用仓库现有 `update.sh`，保留数据库及邮件配置。当前没有自动从Sites导入生产数据的步骤。
