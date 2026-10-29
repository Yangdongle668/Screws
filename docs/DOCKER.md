# Linux / Docker 一键部署与维护

默认运行独立生产服务：Node.js 24、SQLite数据库、本地图纸存储、管理员登录及内置SMTP转接。**默认HTTP端口1573，不要求域名或证书，不启动Caddy，不占用80/443。** 后续可自行通过Nginx反向代理。原Sites项目和数据不会被修改。

## 首次部署

需要Docker Engine、Docker Compose v2、Git、Bash、flock，并能下载GitHub源码、npm依赖和Docker镜像。直接通过服务器IP访问时放行1573端口。

```bash
git clone https://github.com/Yangdongle668/Screws.git
cd Screws
bash deploy.sh
```

只填写管理员邮箱和14–256字符密码。输入错误可以当场重试，不要求重新运行整段部署。密码不回显，服务端只保存scrypt散列。

访问 `http://服务器IP:1573/`，后台为 `http://服务器IP:1573/admin/`。域名、证书、SMTP均不在部署时询问。HTTP连接没有传输加密；对外使用后台时可按下文接入Nginx HTTPS。

脚本自动生成会话密钥、邮件加密密钥和内部SMTP转接令牌，保存在权限600的 `.env.docker`。不要分享或提交此文件。

## 已有部署失败：直接重试

```bash
cd ~/Screws
git pull --ff-only origin main
bash deploy.sh
```

适用于镜像已构建、但出现 `EPERM: operation not permitted, chown '/data'` 且尚未完成首次部署的情况。旧初始化容器继承应用的 `cap_drop: ALL`，即使指定root也缺少修改所有权的能力。修复后只为一次性初始化容器授予CHOWN、FOWNER和DAC_OVERRIDE，网站运行容器仍使用非root用户及原有能力限制。

脚本会备份未完成的旧域名配置到 `backups/setup-config-时间.env`，保留管理员账号、密码散列、会话与邮件密钥，转为HTTP1573模式。**不需要删除data、.env.docker、backups或重建数据库。** Docker宿主机文件系统仍需支持Unix所有权；若使用不支持chown的网络或Windows共享目录，请改为Linux本地目录。

脚本已设置可执行位，可使用 `./deploy.sh`；`bash deploy.sh` 也始终可用。首次启动失败可再次执行。已有 `.deployment/current` 的完整部署使用更新脚本。

## 后续一键更新

```bash
cd ~/Screws
bash update.sh
```

更新会检查本地修改与操作锁、拉取origin/main并仅允许快进合并，在旧服务运行时构建新镜像，再停写备份、启动新服务、执行数据库迁移及健康检查。构建失败不停止旧服务；备份失败中止更新并尝试恢复旧服务。备份及切换期间有短暂停机。

`data/`和`.env.docker`保留，后台发布的文章不会被源码覆盖。不会运行 `down -v`、删除数据或清理旧镜像。新版启动失败保留旧镜像及备份，不盲目回滚已迁移的数据库。旧版本自带的Caddy容器会作为旧服务移除，保留其命名数据卷。

## SMTP：只在后台设置

进入后台“邮件通知”，填写SMTP域名、465 SSL/TLS或587 STARTTLS、登录邮箱、密码、From和询盘接收人，保存后诊断和测试。内部SMTP转接自动配置，**无需填写网关令牌，也无需部署时指定SMTP允许列表或发件域。** 内置桥每次按后台已保存的SMTP域名和发件地址校验目标，修改后立即生效；TLS证书校验仍开启。

询盘先入库，再尝试邮件通知；每分钟重试待通知询盘。SMTP接受不等于进入收件箱，真实投递仍需验证邮箱及SPF/DKIM/DMARC。未配置邮件不影响询盘保存。独立运行smtp-bridge服务的原允许列表机制保留；上述自动配置仅用于Docker内置桥。

## 后续接入Nginx

在 `.env.docker` 中设置以下非秘密配置，随后运行 `bash update.sh`。PUBLIC_URL为可选项，不填写时按访问地址生成公开页面链接；正式域名确定后建议填写以固定canonical和站点地图。

```dotenv
HTTP_PORT=1573
BIND_ADDRESS=127.0.0.1
TRUST_PROXY=1
PUBLIC_URL=https://www.your-domain.com
```

只在启用可信反代时设置TRUST_PROXY=1，并将1573绑定到127.0.0.1，避免外网绕过代理传入转发头。默认直连模式TRUST_PROXY=0，不采信客户端的X-Forwarded-Proto和来源IP转发头。

已有Nginx站点的location示例：

```nginx
location / {
    proxy_pass http://127.0.0.1:1573;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
    client_max_body_size 12m;
    proxy_read_timeout 60s;
}
```

在自己的server配置中设置域名、监听端口和证书。代理必须覆盖这些请求头。HTTP直连使用HttpOnly、SameSite=Strict会话Cookie；可信HTTPS反代使用带Secure属性的__Host-会话Cookie。切换访问协议后重新登录。若Nginx本身也在Docker中，需根据容器网络调整上游地址及端口暴露范围。

PUBLIC_URL允许HTTP或HTTPS根地址，不含路径、账号或查询。修改后更新会重新生成网站规范链接、站点地图与LLMS。后台旧文章的其他手工绝对链接仍需核对。正式域名切换、旧网址跳转和搜索平台验证由管理员配置。

## 备份、状态与日志

```bash
# 在仓库根目录执行
bash backup.sh
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs --tail=100 app
```

备份脚本停写后快照，随后恢复服务。更新前也会备份。备份包含敏感信息，需安全存放异地副本并定期验证；尚未自动启用定时备份。

| 位置 | 内容 |
|---|---|
| data/website.sqlite及WAL文件 | 询盘、备注、文章、翻译、统计和加密邮件配置 |
| data/drawings/ | 客户图纸 |
| data/smtp-receipts/ | 邮件去重及结果不明回执 |
| .env.docker | 管理员密码散列、运行配置和密钥 |
| backups/ | 完整停写备份与旧配置备份 |
| .deployment/ | 新旧镜像版本及操作锁 |

不要删除数据或邮件加密密钥。恢复前停止写入，并保存当前数据；确认数据库、附件及.env.docker来自同一快照后再恢复。脚本不自动覆盖现有数据库。

手工运行会重建容器的Compose命令前，先执行：

```bash
export APP_VERSION="$(cat .deployment/current)"
```

查看日志和状态不需要设置该变量。脚本不记录客户正文或邮箱密码，不要额外开启敏感请求体日志。

## 数据与验证范围

这是新的独立数据库，原Sites的询盘、附件及后台发布文章不自动迁入。访问统计继续遵循同意设置；默认没有IP国家数据库，国家显示Unknown。主机或Nginx日志由管理员管理。

GitHub Actions构建默认无域名Docker镜像，验证受限数据目录初始化、HTTP登录、可信HTTPS代理、安全会话、后台SMTP配置、询盘和附件持久化及备份。测试不连接真实邮箱、不发送客户邮件。目标服务器的防火墙、Nginx、证书、实际邮件投递及生产数据迁移仍需验收。
