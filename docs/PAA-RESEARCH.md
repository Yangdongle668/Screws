# PAA research module

The independent Docker administration panel exposes **PAA 调研** at `/admin/#paa`. No paid search API is required. Chromium is installed in the runtime Docker image and uses a separate temporary profile per query; it never connects to an administrator's personal browser. The browser is isolated by the existing non-root, capability-restricted container and restricts page requests to Google search asset domains. Chromium runs without its own sandbox because of the container restrictions; do not expose its debugging endpoint or mount personal browser profiles.

## Initial two-week trial

- Enabled when this module's persistent configuration is first created; existing schedules and configurations are not reset on update.
- Monday and Thursday, 09:00 Asia/Shanghai; rotates five enabled seed keywords per batch.
- 24 initial English engineering seed terms, editable by adding or enabling/disabling entries. At most 100 seeds and ten queued queries per rolling 24 hours.
- US/English/desktop settings. `gl=us` is a requested search-country setting, not proof of the server's geographical location.
- Stops adding scheduled queries after the displayed trial cutoff, initially 14 days after activation. Administrators can adjust the cutoff, schedule or pause it in the panel.
- Pausing cancels queued scheduled jobs. An already-running query is allowed to finish. Manual jobs remain independent; no automatic backlog replay from before module activation.

## Collection and provenance

The scheduler checks once per minute and runs one keyword at a time. The collector reads a recognized Google PAA container, expands at most four first-level questions and retains at most twenty observations to a maximum of two levels. A fresh profile, bounded command deadlines and a 105-second job deadline apply. No PAA is a valid empty result. A PAA heading with no recognized question structure is reported as a parser change. CAPTCHA, unusual-traffic and consent pages stop the current batch; no CAPTCHA solving, proxy rotation or bypass is attempted.

Records distinguish successful collection, no PAA, access challenge, consent required, changed parser, unrecognized page, interrupted restart and execution failure. A screenshot is retained when the collector reaches a readable page. This does not guarantee that the deployment server can access Google or that every keyword triggers a PAA box. A live development probe returned an access-challenge page and was correctly stopped; real-browser offline fixtures verify the positive extraction path without asserting live Google success.

The problem library records keyword, question, requested country/language, desktop device, first/last observation and count. Each observation retains answer excerpt (if exposed), source link, search URL, timestamp, depth and run ID. Individual run screenshots and history are available only behind the existing admin authentication. Source excerpts are discovery evidence, not automatically verified engineering facts. Three consecutive unsuccessful collection records show an administration-panel alert; no email or external message is sent.

## Article integration and storage

English article tasks may read matching observations from the last 30 days. Their keyword brief may cite only exact supplied PAA question strings; inferred questions stay separate. The observation timestamp/market and source run remain in the draft artifact, and changes in the library invalidate stale AI stage checkpoints. PAA frequency is never reported as search volume. Sources supporting article claims must still be fetched and reviewed through the article research pipeline. No article is automatically published.

SQLite tables `paa_config`, `paa_seeds`, `paa_runs`, `paa_questions` and `paa_observations` retain settings and history; screenshots are in `/data/paa-evidence`. Full `bash backup.sh` snapshots preserve them with the persistent data directory. The general inquiry JSON export is not a PAA backup. Updating the Docker image preserves existing data and module configuration. The first update downloads Chromium, increasing image size; keep normal disk/memory headroom and examine container logs if installation fails.

## Verification

`node docker/verify-paa.mjs` exercises the scheduler, deduplication, histories, evidence routes, revision conflicts, pause, restart and challenge-stop behavior with temporary data and an injected collector. `node docker/verify-paa-browser.mjs` uses installed Chromium against an offline DOM fixture, validating question, answer and source extraction without Google requests. Docker CI runs the browser fixture with network disabled. Existing production runtime tests check authenticated endpoints and the admin entry point. Actual Google reachability remains a deployment check.
