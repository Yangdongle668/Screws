# SEO抓取文件维护

后台入口：`/admin/#seo`（中文，需管理员登录）。

- `robots.txt`：在线编辑、纯文本校验、生效预览、全站屏蔽风险确认，保留最近五版；支持恢复模板及历史版本。
- `llms.txt` / `llms-full.txt`：按语言及八类主题生成，后台可补充公开背景说明。不是任意文件上传入口，不要填写密码或客户资料。
- `sitemap_index.xml`：总索引，`sitemap.xml` 为兼容入口。按企业、产品、文章、工艺、材料、行业、应用示例和指南拆分；包含语言对应链接及正文图片。无可靠修改日期的页面不填造 lastmod。
- `/sitemap`：蓝色表头的可阅读目录，可查看分组、robots和AI目录。XML 使用原生CSS，避免依赖浏览器逐渐停止支持的XSLT。TXT保持标准纯文本。
- 草稿不进入资源目录；公开文章和译文的发布、撤回更新地图和LLMS。缓存最长60秒。
- 配置保存到数据库 `site_settings` 的 `seo:policy`，不修改代码，不会因Docker更新丢失。Docker全量数据库备份包含此配置；后台内容导出不包含系统配置。
- 正式域名尚未确认。Docker未配置 PUBLIC_URL 时按访问地址生成，反向代理须采用可信代理配置；上线后固定正式地址，避免多个主机地址同时被搜索引擎收录。

审计：`node scripts/audit-seo.mjs`，输出 `docs/reports/seo-audit.json` 的逐页数据与 `docs/reports/SEO-AUDIT.md` 摘要。检查通过不代表Google已抓取、收录或授予富媒体展示。
