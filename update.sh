#!/usr/bin/env bash
set -Eeuo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/docker/common.sh"
need_tools
lock_deployment
[[ -f .env.docker && -f .deployment/current ]] || { echo '请先运行 bash deploy.sh。'; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo '源码有本地修改，请先提交或处理；更新不会覆盖本地修改。'; exit 1; }
[[ "$(git branch --show-current)" == main ]] || { echo '请在main分支更新。'; exit 1; }
git fetch origin main
git merge --ff-only origin/main
previous="$(current_version)"
export APP_VERSION="$(git rev-parse HEAD)-$(date -u +%Y%m%dT%H%M%SZ)"
dc config --quiet
# Build while the old service is still running; a build failure changes no data.
dc build --pull app
dc pull https
backup_data
# From this point migrations may have run. Never blindly restore an older
# database or assume an older binary is compatible with a changed schema.
RESUME_ON_EXIT=0
if ! dc up -d --wait --wait-timeout 120 app; then
  echo "新版未通过健康检查。旧镜像 zufek-website:$previous 和更新前备份均保留。" >&2
  echo '请检查 docker compose --env-file .env.docker logs app；不要删除data或盲目覆盖已迁移的数据库。' >&2
  exit 1
fi
dc up -d --wait --wait-timeout 120 --force-recreate --no-deps https
printf '%s\n' "$previous" > .deployment/previous
printf '%s\n' "$APP_VERSION" > .deployment/current
echo '更新完成，健康检查通过，询盘、图纸、文章和配置均使用原持久化目录。'
