# ZUFEK 非标金属螺丝网站

DONGGUAN ZUFEK TECHNOLOGY CO., LTD. 的英文 B2B 网站及中文管理后台。正式源码仓库为 [Yangdongle668/Screws](https://github.com/Yangdongle668/Screws)。

包含产品、材料、工艺、行业、技术文章、应用设计示例、询盘、邮件设置和访问统计。营销页由脚本预生成 HTML；后台、询盘存储及文章发布使用服务端功能，不能仅上传静态文件来获得完整后台。

## 开始开发

需要 Node.js 24、npm 和 Git。Windows、Linux 和云端开发环境均可使用。

```sh
npm run install:ci
node scripts/generate-site.mjs
npm run dev
```

使用终端实际输出的本地地址，默认端口为 5173。开发环境登录是本机测试身份，不能填写真实邮箱密码。不要把开发服务器直接作为公网生产后台。

## 主要目录

| 位置 | 用途 |
|---|---|
| `scripts/catalog.mjs` | 产品与工艺数据 |
| `scripts/industry-material-content.mjs` | 材料、行业及主题关联 |
| `scripts/content-depth.mjs`、`scripts/priority-*.mjs` | 产品深度、核心文章及选型内容 |
| `scripts/application-*.mjs` | 应用设计、概念图引用和装配示意图 |
| `scripts/generate-site.mjs` | 生成 HTML、文章种子、站点地图与 LLMS |
| `public/` | 图片、样式及浏览器脚本 |
| `static-site/` | 基础营销内容静态导出，不含运行时数据库内容 |
| `lib/`、`app/`、`worker/` | 服务端路由、询盘、文章、统计、SMTP 设置与备份 |
| `drizzle/` | 数据库迁移，不含客户记录 |
| `smtp-bridge/` | 可独立部署到 Linux/Docker 的 SMTP 转接服务 |
| `site-content.config.json` | 规范网址，正式域名尚待确定 |
| `.openai/hosting.json` | 已有 Sites 项目与数据库/文件绑定声明 |

## 提交前检查

```sh
node scripts/generate-site.mjs
node scripts/verify-content.mjs
node scripts/verify-images.mjs
node scripts/verify-priorities.mjs
node scripts/audit-topology.mjs
npx tsc --noEmit
npm run build
```

`verify-site.mjs`、`verify-management.mjs`、`verify-seo-admin.mjs` 和 `verify-mail-settings.mjs` 需要本地服务器，可通过 `SITE_TEST_ORIGIN` 指定地址。这些测试可能写入本地测试记录，不得指向生产。SMTP 服务在其目录执行 `npm ci` 和 `npm test`。

GitHub Actions 在推送和 PR 时执行基础检查与构建，不会自动部署网站或发送真实邮件。

## 云端维护与部署

### 自建 Linux / Docker

首次执行 `bash deploy.sh`，后续执行 `bash update.sh`；手动备份使用 `bash backup.sh`。包含独立后台登录、持久化数据库/图纸、HTTPS 和内置 SMTP 转接，详见 [Docker部署说明](docs/DOCKER.md)。

### 保留原 Sites 托管

1. 从本仓库建立分支，修改源内容或功能。
2. 重新生成基础页面，提交对应的 `lib/` 和 `static-site/` 生成结果。
3. 检查 PR 和自动检查结果，再合并到 `main`。
4. 在具备 Sites 授权的环境中按发布流程更新现有项目，保留 `.openai/hosting.json` 中的项目 ID。GitHub 推送本身不会同步部署。

网站仍保留原私有访问权限。正式域名、公开抓取、Search Console 与 Bing 验证尚待配置，参见 [P0–P2 记录](SEO-RELEASE.md)。迁往独立平台时需另行配置数据库、文件存储、身份认证和生产密钥；当前服务依赖 Sites 的受信任身份入口，不能把任意请求头当作生产登录。

## 数据与邮件

GitHub 保存代码和基础内容，不保存实际询盘、上传图纸、后台发布记录、访客统计或 SMTP 密码。运行数据和受保护配置需独立备份与迁移。

询盘先保存再通知。独立 Docker 版内置 SMTP 转接；原 Sites 托管版需要另外部署转接服务，见 [SMTP 说明](smtp-bridge/README.md)。两种方式都需填写真实邮箱配置并验证收件。`.env.example` 仅为占位配置。

详见 [云端维护交接](docs/CLOUD-MAINTENANCE.md)。原框架说明保留于 [SITES-STARTER.md](docs/SITES-STARTER.md)。
