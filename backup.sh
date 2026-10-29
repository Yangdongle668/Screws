#!/usr/bin/env bash
set -Eeuo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/docker/common.sh"
need_tools
lock_deployment
[[ -f .env.docker && -f .deployment/current ]] || { echo '尚未部署。'; exit 1; }
export APP_VERSION="$(current_version)"
backup_data
dc up -d --wait --wait-timeout 120 app
RESUME_ON_EXIT=0
echo '备份完成，服务已恢复。'
