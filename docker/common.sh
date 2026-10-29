#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd -- "$ROOT"
need_tools() {
  for tool in docker git flock; do command -v "$tool" >/dev/null || { echo "缺少 $tool，请先安装。" >&2; exit 1; }; done
  docker info >/dev/null 2>&1 || { echo 'Docker 未运行或当前用户无访问权限。' >&2; exit 1; }
  docker compose version >/dev/null
}
lock_deployment() { mkdir -p .deployment; exec 9>.deployment/operation.lock; flock -n 9 || { echo '已有部署、更新或备份正在运行。' >&2; exit 1; }; }
dc() { docker compose --env-file "$ROOT/.env.docker" -f "$ROOT/compose.yaml" "$@"; }
current_version() { if [[ -f .deployment/current ]]; then cat .deployment/current; else printf '%s' local; fi; }
RESUME_ON_EXIT=0
resume_old_service() { if [[ "$RESUME_ON_EXIT" == 1 ]]; then APP_VERSION="$(current_version)" dc up -d app || true; fi; }
trap resume_old_service EXIT
backup_data() {
  mkdir -p backups
  local stamp filename was_running=0
  stamp="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)"
  filename="zufek-$stamp.tar.gz"
  if [[ -n "$(dc ps -q --status running app)" ]]; then was_running=1; RESUME_ON_EXIT=1; dc stop -t 30 app; fi
  # Snapshot is taken with the only database writer stopped. Config is included
  # because encrypted mail settings require the same key when restored.
  if ! docker run --rm --network none --user 0:0 --entrypoint sh \
      -v "$ROOT:/source:ro" -v "$ROOT/backups:/backup" \
      "zufek-website:$(current_version)" -c 'umask 077; tar -czf "/backup/$1" -C /source data .env.docker && tar -tzf "/backup/$1" >/dev/null' sh "$filename"; then
    if [[ "$was_running" == 1 ]]; then APP_VERSION="$(current_version)" dc up -d app; RESUME_ON_EXIT=0; fi
    echo '备份失败，已停止更新；原数据保留。' >&2; return 1
  fi
  echo "已备份：$ROOT/backups/$filename（含敏感配置，请独立安全保存）"
}
