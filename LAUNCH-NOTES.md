# ZUFEK website

Public pages are complete pre-generated HTML. Run `node scripts/generate-site.mjs` after changing content. `static-site/` contains the standalone HTML export; copy `public/site.css`, `public/site.js`, `public/favicon.svg`, `public/robots.txt`, and `public/sitemap.xml` to its root when hosting independently. The form requires the accompanying server API. The hosted application serves the same generated HTML using clean URLs and no React hydration on public pages.

## Configured
- Company: DONGGUAN ZUFEK TECHNOLOGY CO., LTD.
- Contact and notification recipient: engineer@zufek.com
- Admin allowlist: engineer@zufek.com (authenticated ChatGPT email; modify ADMIN_EMAILS if the operator uses another account).
- D1 inquiry records and R2 drawings. Only authenticated allowlisted users can read records, download drawings or update status.

## Required before business launch
1. Add real product/factory images and verify every product family, technical article and manufacturing statement with the company. Existing screw illustrations are explicitly illustrative.
2. Configure RESEND_API_KEY and MAIL_FROM using a verified sending domain. Complete domain verification (SPF/DKIM; align DMARC as appropriate). Redeploy to apply runtime configuration. Test actual delivery to engineer@zufek.com; API acceptance alone is not inbox delivery.
3. Pending notifications are durable. The Worker retries a bounded batch after submissions and admin requests. Manual retry is available in the admin. No unattended retry schedule is configured. Configure a scheduled service before relying on periodic retries or overdue reminders when there is no traffic.
4. Provider delivery/bounce webhooks are not implemented; current notification state tracks API acceptance or request failure only.
5. CSV export is available, but independent automated database/drawing backup and restore verification are not yet configured. An export of inquiry fields does not back up the drawing files.
6. Approve a retention policy, privacy notice, business address, and confidential drawing handling requirements.
7. New Sites publication is owner-private. Public access and an optional company domain must be set explicitly before search crawlers or anonymous customers can visit. Update the site origin and regenerate canonical URLs/sitemap after connecting a domain.

## Reliability
Only persisted records return success. Retrying the same request key returns its prior reference. Attachments are stored before the database insert. Database uncertainty does not trigger deletion of possibly committed attachments. Provider errors cannot roll back the inquiry. Retry attempts use a conditional database lease and provider idempotency key. Confirmed provider acceptance is distinct from inbox delivery.

## Verification
Local smoke tests cover clean routes, internal links, authorization, input validation, file limits, attachment retrieval, retry deduplication, status changes and CSV formula escaping. Production notification delivery remains unverified until email credentials are connected.

## 2026-10-29 privacy and navigation update
- Sticky navigation, context-aware quote links, mobile quote/email bar, return-to-top, essential-storage notice and settings are implemented.
- No optional analytics/advertising scripts. External Google Fonts requests removed; browser system font fallback used.
- Privacy, cookies, company information and data request pages added. RFQ processing notice replaces mandatory bundled consent; no marketing subscription.
- Admin individual JSON export, age-based retention review hint, and explicit-reference-confirmed deletion of active inquiry row + R2 drawing added. Deletion does not remove previously sent mail, exports, provider backups or a notification already in flight. Process these separately for a verified rights request. Do not erase records subject to a legal hold.
- Inactive/unconverted inquiries: review at 12 months; manual review is required, no automatic destruction is configured.
- Before unrestricted public launch: obtain full registered address and applicable registration details; assess GDPR territorial scope and whether an EU representative is required; verify processor agreements, hosting locations, international transfer safeguards, platform authentication cookie inventory and provider retention. Current pages do not establish legal compliance by themselves.
- Mail delivery: verified sender + production mail secret still required. No test emails were sent. Confirm real inbox delivery, bounce handling and retries before reliance.
- Independent encrypted backup destination, schedule, retention and restore test remain unconfigured. CSV/JSON exports and drawing downloads support manual copies but are not an independent automated backup service.
- Site audience remains owner-private; admin allowlist must match the intended signed-in team account before production staff use. Do not widen access to inquiry data during public launch.
