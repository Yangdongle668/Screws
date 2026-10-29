#!/usr/bin/env bash
set -Eeuo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/docker/common.sh"
need_tools
lock_deployment
if [[ -e .env.docker ]]; then
  if [[ -f .deployment/current ]]; then echo '已有部署。后续更新请运行 bash update.sh。'; exit 1; fi
  echo '保留已有配置，重试尚未完成的首次部署。'
else
  while true; do
    read -r -p '管理员邮箱：' admin_email
    [[ "$admin_email" =~ ^[a-zA-Z0-9._+%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] && break
    echo '邮箱格式不正确，请重新输入。'
  done
  while true; do
    read -r -s -p '后台密码（14–256字符，不回显）：' password; printf '\n'
    read -r -s -p '再次输入后台密码：' repeated; printf '\n'
    if [[ ${#password} -lt 14 || ${#password} -gt 256 ]]; then echo "密码长度为${#password}，需要14–256字符，请重新输入。"; continue; fi
    [[ "$password" == "$repeated" ]] && break
    echo '两次密码不一致，请重新输入。'
  done
  docker pull node:24-alpine
  hash="$(printf '%s' "$password" | docker run --rm -i node:24-alpine node -e 'const c=require("node:crypto"),f=require("node:fs");const p=f.readFileSync(0,"utf8"),s=c.randomBytes(16).toString("hex");process.stdout.write(s+":"+c.scryptSync(p,s,64).toString("hex"))')"
  unset password repeated
  secrets="$(docker run --rm node:24-alpine node -e 'const c=require("node:crypto");console.log(c.randomBytes(32).toString("hex"));console.log(c.randomBytes(32).toString("base64"));console.log(c.randomBytes(32).toString("hex"))')"
  mapfile -t generated <<< "$secrets"
  cat > .env.docker <<EOF
HTTP_PORT=1573
BIND_ADDRESS=0.0.0.0
TRUST_PROXY=0
ADMIN_EMAIL=${admin_email,,}
ADMIN_PASSWORD_HASH=$hash
SESSION_SECRET=${generated[0]}
MAIL_CONFIG_KEY=${generated[1]}
LOCAL_SMTP_TOKEN=${generated[2]}
INQUIRY_TO=engineer@zufek.com
EOF
  unset secrets generated hash
  chmod 600 .env.docker
fi
# Preserve credentials from an earlier failed HTTPS setup before converting it.
if [[ ! -f .deployment/current ]] && grep -q '^SITE_HOST=' .env.docker; then
  mkdir -p backups
  cp -p .env.docker "backups/setup-config-$(date -u +%Y%m%dT%H%M%SZ).env"
  sed -i '/^PUBLIC_URL=/d; /^SITE_HOST=/d; /^TLS_EMAIL=/d; /^SMTP_ALLOWED_HOSTS=/d; /^SMTP_FROM_DOMAINS=/d' .env.docker
  printf '%s\n' 'HTTP_PORT=1573' 'BIND_ADDRESS=0.0.0.0' 'TRUST_PROXY=0' >> .env.docker
  echo '已保留账号和密钥，并将未完成的旧部署转换为HTTP模式；原配置已备份。'
fi
export APP_VERSION="$(git rev-parse HEAD)-$(date -u +%Y%m%dT%H%M%SZ)"
dc config --quiet
dc build --pull app
mkdir -p data
# Runtime drops all capabilities; only this one-off initializer can fix ownership.
dc run --rm --no-deps --user 0:0 --cap-add CHOWN --cap-add FOWNER --cap-add DAC_OVERRIDE --entrypoint node app docker/initialize-volume.mjs
dc up -d --wait --wait-timeout 120 --remove-orphans app
printf '%s\n' "$APP_VERSION" > .deployment/current
echo '部署已完成。访问 http://服务器IP:1573/，后台为 /admin/。'
echo 'SMTP服务器、账号、密码及收件人在后台“邮件通知”设置；后续可自行接入Nginx。'
echo '首次启动不会自动导入原Sites询盘。'
