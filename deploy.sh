#!/usr/bin/env bash
set -Eeuo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/docker/common.sh"
need_tools
lock_deployment
if [[ -e .env.docker ]]; then
  if [[ -f .deployment/current ]]; then echo '已有部署。后续更新请运行 bash update.sh。'; exit 1; fi
  echo '保留已有配置，重试尚未完成的首次部署。'
else
read -r -p '网站域名（例如 www.example.com，不含 https://）：' domain
if [[ ! "$domain" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$ ]]; then echo '请输入有效域名。'; exit 1; fi
read -r -p '管理员邮箱：' admin_email
read -r -p '证书通知邮箱（回车沿用管理员邮箱）：' tls_email
tls_email="${tls_email:-$admin_email}"
if [[ ! "$admin_email" =~ ^[a-zA-Z0-9._+%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ || ! "$tls_email" =~ ^[a-zA-Z0-9._+%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then echo '邮箱格式不正确。'; exit 1; fi
read -r -s -p '后台密码（至少14字符，不回显）：' password; printf '\n'
read -r -s -p '再次输入后台密码：' repeated; printf '\n'
if [[ "$password" != "$repeated" || ${#password} -lt 14 || ${#password} -gt 256 ]]; then unset password repeated; echo '密码不一致或长度不符合要求。'; exit 1; fi
read -r -p '允许连接的 SMTP 域名（回车默认 mail.zufek.com）：' smtp_host
smtp_host="${smtp_host:-mail.zufek.com}"
if [[ ! "$smtp_host" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$ ]]; then echo 'SMTP 域名不正确。'; exit 1; fi
docker pull node:24-alpine
# The password is read on stdin, never passed as an argument or logged.
hash="$(printf '%s' "$password" | docker run --rm -i node:24-alpine node -e 'const c=require("node:crypto"),f=require("node:fs");const p=f.readFileSync(0,"utf8"),s=c.randomBytes(16).toString("hex");process.stdout.write(s+":"+c.scryptSync(p,s,64).toString("hex"))')"
unset password repeated
secrets="$(docker run --rm node:24-alpine node -e 'const c=require("node:crypto");console.log(c.randomBytes(32).toString("hex"));console.log(c.randomBytes(32).toString("base64"));console.log(c.randomBytes(32).toString("hex"))')"
mapfile -t generated <<< "$secrets"
cat > .env.docker <<EOF
PUBLIC_URL=https://${domain,,}
SITE_HOST=${domain,,}
TLS_EMAIL=$tls_email
ADMIN_EMAIL=${admin_email,,}
ADMIN_PASSWORD_HASH=$hash
SESSION_SECRET=${generated[0]}
MAIL_CONFIG_KEY=${generated[1]}
LOCAL_SMTP_TOKEN=${generated[2]}
INQUIRY_TO=engineer@zufek.com
SMTP_ALLOWED_HOSTS=${smtp_host,,}
SMTP_FROM_DOMAINS=zufek.com
EOF
unset secrets generated hash
chmod 600 .env.docker
fi
export APP_VERSION="$(git rev-parse HEAD)-$(date -u +%Y%m%dT%H%M%SZ)"
dc config --quiet
dc build --pull app
mkdir -p data
dc run --rm --no-deps --user 0:0 --entrypoint node app docker/initialize-volume.mjs
dc up -d --wait --wait-timeout 120 app https
printf '%s\n' "$APP_VERSION" > .deployment/current
site_url="$(sed -n 's/^PUBLIC_URL=//p' .env.docker)"
echo "部署已完成。后台：$site_url/admin/"
echo '请确认域名DNS指向服务器且80/443端口可达。首次启动不会自动导入原Sites询盘。'
