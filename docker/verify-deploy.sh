#!/usr/bin/env bash
set -Eeuo pipefail
source_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
temporary="$(mktemp -d "${TMPDIR:-/tmp}/zufek-deploy-qa.XXXXXXXX")"
cleanup() { [[ "$temporary" == "${TMPDIR:-/tmp}/zufek-deploy-qa."* ]] && rm -rf -- "$temporary"; }
trap cleanup EXIT
mkdir -p "$temporary/docker" "$temporary/bin"
cp "$source_root/deploy.sh" "$temporary/"
cp "$source_root/docker/common.sh" "$temporary/docker/"
cat > "$temporary/bin/git" <<'MOCK'
#!/usr/bin/env bash
echo 0123456789abcdef0123456789abcdef01234567
MOCK
cat > "$temporary/bin/docker" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$QA_LOG"
case "$*" in
 'run --rm -i node:24-alpine '*) cat >/dev/null; printf 'test-only-hash\n' ;;
 'run --rm node:24-alpine '*) printf 'test-only-session\ntest-only-encryption\ntest-only-token\n' ;;
 *'docker/initialize-volume.mjs'*)
  [[ "$*" == *'--cap-add CHOWN'* && "$*" == *'--cap-add FOWNER'* && "$*" == *'--cap-add DAC_OVERRIDE'* ]]
  [[ "${QA_INIT_FAIL:-0}" != 1 ]] ;;
esac
MOCK
printf '#!/usr/bin/env bash\nexit 0\n' > "$temporary/bin/flock"
chmod +x "$temporary/bin/"*
export PATH="$temporary/bin:$PATH" QA_LOG="$temporary/commands.log"
cd "$temporary"
# Invalid input retries locally, without restarting the deployment.
printf 'bad-email\nqa@example.invalid\nshort\nshort\ntest-password-long-enough\ntest-password-long-enough\n' | bash deploy.sh > result.log 2>&1
grep -q '^HTTP_PORT=1573$' .env.docker
! grep -Eq '^(PUBLIC_URL|SITE_HOST|TLS_EMAIL|SMTP_ALLOWED_HOSTS|SMTP_FROM_DOMAINS)=' .env.docker
[[ -f .deployment/current ]]
! grep -q 'app https' "$QA_LOG"
# Recover the exact failed-setup state: retain account and all cryptographic keys.
rm .deployment/current
printf '%s\n' 'PUBLIC_URL=https://old.example.invalid' 'SITE_HOST=old.example.invalid' 'TLS_EMAIL=qa@example.invalid' 'SMTP_ALLOWED_HOSTS=mail.old.invalid' 'ADMIN_EMAIL=qa@example.invalid' 'SESSION_SECRET=preserve-session' 'MAIL_CONFIG_KEY=preserve-mail' 'LOCAL_SMTP_TOKEN=preserve-token' > .env.docker
export QA_INIT_FAIL=1
status=0; bash deploy.sh > result.log 2>&1 || status=$?
[[ "$status" != 0 && ! -f .deployment/current ]]
grep -q '^SESSION_SECRET=preserve-session$' .env.docker
grep -q '^MAIL_CONFIG_KEY=preserve-mail$' .env.docker
grep -q '^LOCAL_SMTP_TOKEN=preserve-token$' .env.docker
! grep -q '^PUBLIC_URL=' .env.docker
[[ -n "$(find backups -name 'setup-config-*.env' -print -quit)" ]]
unset QA_INIT_FAIL
bash deploy.sh > result.log 2>&1
[[ -f .deployment/current ]]
echo 'Deploy checks passed: HTTP1573 defaults, input retries, privileged one-off initialization, failed-setup secret preservation and successful retry.'
