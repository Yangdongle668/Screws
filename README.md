# ZUFEK 非标金属螺丝网站

DONGGUAN ZUFEK PRECISION CO., LTD. 的英文 B2B 网站及中文管理后台。正式源码仓库为 [Yangdongle668/Screws](https://github.com/Yangdongle668/Screws)。

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

服务器先准备 Docker Engine、Docker Compose v2、Git、Bash 和 `flock`。默认通过 **HTTP 1573端口** 访问，不要求域名、证书或Nginx；后续可以自行配置反向代理。以下命令在服务器终端执行。

**首次一键部署：**

```bash
git clone https://github.com/Yangdongle668/Screws.git
cd Screws
bash deploy.sh
```

只需按提示填写后台管理员邮箱和密码。构建完成后访问 `http://服务器IP:1573/`，后台为 `http://服务器IP:1573/admin/`。如果已经克隆仓库，直接进入现有目录运行脚本。SMTP服务器、465 SSL/TLS或587 STARTTLS、邮箱密码及收件人都在后台“邮件通知”中设置。

如果旧部署在 `chown /data` 处失败，执行 `git pull --ff-only origin main` 后重新运行 `bash deploy.sh` 即可。脚本会备份旧配置并保留账号和密钥，勿删除 `data/`、`.env.docker` 或 `backups/`。以后仍使用 `bash update.sh` 更新。

**后续一键更新：**

```bash
cd Screws
bash update.sh
```

脚本会拉取 GitHub 的 `main` 分支，构建新版，停写备份后切换服务并检查健康状态。保留询盘、图纸、后台文章及邮件配置；源码有未处理修改时会停止更新。备份与切换期间有短暂停机，失败处理详见部署说明。

**一键备份：**

```bash
cd Screws
bash backup.sh
```

备份保存在 `backups/`，包含敏感配置，需另存到安全位置。脚本暂停写入后备份，再恢复服务；未自动启用定时备份。

**查看服务状态和日志：**

```bash
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs --tail=100 app
```

以上命令均从仓库根目录执行；若已在该目录，不必重复 `cd Screws`。更新脚本已经负责拉取代码，无需先手动执行 `git pull`。运行数据在 `data/`，受保护配置在 `.env.docker`，不要删除或提交到 GitHub。现有 Sites 数据不会自动迁入 Docker。

包含独立后台登录、持久化数据库/图纸和内置 SMTP 转接。不占用80/443端口、不启动Caddy、不要求修改邮件环境变量。可选Nginx配置、正式域名、恢复与故障处理见 [Docker部署说明](docs/DOCKER.md)。

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

## AI API 与定时内容维护

独立Docker更新后进入 `/admin/#ai`，在中文后台配置Chat Completions兼容API、模型、密钥、可选Brave检索及任务预算。默认关闭定时执行；可按北京时间安排每周技术博客、每月行业洞察与旧文复核。先读取现有内容台账，生成稿件后进入审核队列；不会自动发布。英文审批后可生成指定语言译稿。

配置、稿件及执行记录存入持久化data目录；完整迁移使用 `bash backup.sh`。使用说明及限制见 [AI维护后台](docs/AI-CONTENT-ADMIN.md)。测试：`node docker/verify-ai.mjs`（临时数据，无外部付费调用）。

## 询盘收件箱与访问分析

独立Docker后台新增资料完整度、优先级、未读/垃圾/归档、来源关联、漏斗及通知队列。完整IP采集保持关闭；访问分析框架支持本地DB-IP Lite国家估算及保留策略。需正确配置受信Nginx，否则可能只记录代理IP。询盘入库暂时失败时提供加密落盘与幂等恢复。现有隐私说明与Cookie同意机制保持不变。

更新：`bash update.sh`。使用、真实IP配置、数据保留及功能对照见 [询盘与访问分析升级](docs/INQUIRY-ANALYTICS-UPGRADE.md)。
