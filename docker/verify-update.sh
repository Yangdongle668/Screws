#!/usr/bin/env bash
set -Eeuo pipefail
source_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
temporary="$(mktemp -d "${TMPDIR:-/tmp}/zufek-update-qa.XXXXXXXX")"
cleanup() { [[ "$temporary" == "${TMPDIR:-/tmp}/zufek-update-qa."* ]] && rm -rf -- "$temporary"; }
trap cleanup EXIT
mkdir -p "$temporary/docker" "$temporary/bin" "$temporary/.deployment"
cp "$source_root/update.sh" "$temporary/"
cp "$source_root/docker/common.sh" "$temporary/docker/"
printf '%s\n' 'PUBLIC_URL=https://test.example.invalid' > "$temporary/.env.docker"
cp "$temporary/.env.docker" "$temporary/expected.env"
cat > "$temporary/bin/git" <<'MOCK'
#!/usr/bin/env bash
case "$*" in
  'status --porcelain') [[ "${QA_DIRTY:-0}" != 1 ]] || echo dirty ;;
  'branch --show-current') echo main ;;
  'rev-parse HEAD'|'rev-parse --short HEAD') echo 0123456789abcdef ;;
esac
exit 0
MOCK
cat > "$temporary/bin/docker" <<'MOCK'
#!/usr/bin/env bash
printf '%s | %s\n' "${APP_VERSION:-unset}" "$*" >> "$QA_LOG"
case " $* " in
  *' build '*) [[ "${QA_FAIL:-}" != build ]] || exit 1 ;;
  *' ps -q --status running app '*) echo previous-container ;;
  *' run --rm --network none '*) [[ "${QA_FAIL:-}" != backup ]] || exit 1 ;;
  *' up -d --wait --wait-timeout 120 app '*) [[ "${QA_FAIL:-}" != health ]] || exit 1 ;;
esac
MOCK
printf '#!/usr/bin/env bash\nexit 0\n' > "$temporary/bin/flock"
chmod +x "$temporary/bin/"*
export PATH="$temporary/bin:$PATH" QA_LOG="$temporary/commands.log"
cd "$temporary"
for scenario in success build backup health dirty; do
  printf '%s\n' old-image > .deployment/current
  : > "$QA_LOG"
  export QA_FAIL="$scenario" QA_DIRTY=0
  [[ "$scenario" != dirty ]] || export QA_DIRTY=1
  status=0; bash update.sh > "$temporary/result.log" 2>&1 || status=$?
  cmp .env.docker expected.env
  if [[ "$scenario" == success ]]; then
    if [[ "$status" != 0 ]]; then cat "$temporary/result.log"; exit 1; fi
    stop_line="$(grep -n ' stop -t 30 app' "$QA_LOG" | head -1 | cut -d: -f1)"
    backup_line="$(grep -n ' run --rm --network none ' "$QA_LOG" | head -1 | cut -d: -f1)"
    up_line="$(grep -n ' up -d --wait --wait-timeout 120 app' "$QA_LOG" | head -1 | cut -d: -f1)"
    [[ "$stop_line" -lt "$backup_line" && "$backup_line" -lt "$up_line" ]]
    [[ "$(cat .deployment/previous)" == old-image ]]
  else
    [[ "$status" != 0 && "$(cat .deployment/current)" == old-image ]]
    if [[ "$scenario" == build || "$scenario" == dirty ]]; then ! grep -q ' stop -t 30 app' "$QA_LOG"; fi
    if [[ "$scenario" == backup ]]; then grep -q '^old-image | .* up -d app' "$QA_LOG"; ! grep -q ' up -d --wait --wait-timeout 120 app' "$QA_LOG"; fi
    if [[ "$scenario" == health ]]; then ! grep -q '^old-image | .* up ' "$QA_LOG"; fi
  fi
done
echo 'Update checks passed: config preserved, snapshot before migration, build/backup failures stop safely, no blind database rollback.'
