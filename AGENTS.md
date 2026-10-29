# ZUFEK 项目维护约定

- 正式源码仓库：`https://github.com/Yangdongle668/Screws`，默认分支 `main`。
- 先查看 Git 状态，保留用户修改。不要强制推送或更改仓库可见性。
- 内容源在 `scripts/`。不要只改 `lib/generated-pages.json` 或 `static-site/`；修改源后运行 `node scripts/generate-site.mjs` 并提交生成结果。
- 前台支持英文根路径及de/es/it/zh/fr语言目录，后台中文。翻译维护见 `docs/MULTILINGUAL.md`。保持无 `.html` 后缀的网址、规范链接、对应语言内链和询盘入口。
- 企业成立于 2005 年，位于东莞大朗，月产能约数百万件，受产品组合影响；含模具打样约 10–15 天，具体经技术评审和报价确认。
- 汽车背景仅为相关车型零部件供应链项目，不扩写为直接 OEM 认可。应用示例不是客户交付案例，不虚构测试结果、认证、设备能力或工程师资历。
- 不提交真实环境配置、凭据、询盘、附件、数据库、备份及 `node_modules`。生产数据独立备份。
- 基础检查：`verify-content.mjs`、`verify-images.mjs`、`verify-priorities.mjs`、`audit-topology.mjs`、TypeScript 和构建。运行时测试仅使用本机地址和测试数据，不对生产运行修改性测试。
- 发布使用已有 Sites 项目并遵循当前环境的 Sites 技能。保留 `.openai/hosting.json` 中的项目 ID、存储声明及原访问范围。推送 GitHub 不代表已经部署。
- 独立部署需正确配置身份边界、D1、R2、密钥与 SMTP 网关。开发测试身份不能用于生产，不信任互联网直接传入的身份请求头。
- 独立Docker入口为 `docker/server.mjs`，使用 `docker/storage.mjs` 将现有D1/R2接口适配到持久化SQLite和文件存储；仅Docker打包时替换 `cloudflare:workers`。不要把Docker会话认证或本机SMTP回调加入Sites的默认运行配置。
- 修改部署脚本需运行 `bash docker/verify-update.sh`；修改独立后台需构建 `node docker/build.mjs` 后运行 `node docker/verify-runtime.mjs`。这些测试只使用临时目录和虚构地址，不得指向生产数据。
- Docker默认不绑定域名，以HTTP1573端口运行，可另配Nginx。SMTP仅在后台配置；内置桥按已保存配置校验目标。首次目录初始化需显式CHOWN/FOWNER/DAC_OVERRIDE能力，应用运行时仍非root且cap_drop ALL。部署改动还需运行 `bash docker/verify-deploy.sh`。
