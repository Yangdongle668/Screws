# AI maintenance: DeepSeek setup and recovery

The Docker worker runs every 60 seconds. Scheduled jobs and manual jobs use the same queue; every generated result remains a draft for human review. Review approval and publication are separate actions.

## Configuration

In the Chinese administration panel, open **AI内容维护** and select the official DeepSeek preset. Confirm `https://api.deepseek.com`, the model available to your account (the preset uses `deepseek-flash`), `max_tokens`, streaming enabled, and a 600-second request deadline. Reasoning is disabled by default for predictable editorial generation; low/high thinking can be selected for drafting. Planning and outline requests disable thinking. Third-party compatible endpoints do not automatically receive DeepSeek-specific parameters. Save configuration before testing; a test is a short API probe, not an end-to-end article test.

Search is separate from model generation. The default public-web mode reads public Bing/DuckDuckGo HTML result pages, follows regional search redirects, and fetches allowed publishers directly. It requires no search API key or subscription. If search engines supply no usable allowed results, it explores relevant links from trusted publisher home/technical pages with a bounded crawl. This is not unrestricted browsing: network failures, access challenges, PDF-only sources and publisher restrictions can still produce HOLD. The task records search result counts, domain filtering, publisher discovery and source failures. Legacy configurations migrate once to this public-web default; optional paid modes are used only when explicitly selected afterward. With the official DeepSeek endpoint, native search/fetch can use the same API key, subject to provider permission and tool charges. A monthly request cap applies to attempted search/fetch requests. Brave requires its separate key. Reference-only mode reads approved reference URLs and existing sources; it cannot discover current news. Missing verifiable evidence produces HOLD instead of fabricated claims.

## Execution sequence

1. Read the current published-content inventory, draft ledger, company facts, maintenance principles, and the prompt specific to the task type.
2. Compare relevant existing pages and identify an uncovered engineering or procurement question.
3. Research approved sources and record retrieved evidence, source failures, and retrieval mode.
4. Generate a structured outline identifying the gap and intended sections.
5. Draft from that outline and evidence. Structured technical articles are rendered into Markdown by the server instead of asking the model to duplicate the body.
6. Validate source references, internal links, minimum content and response completeness; save a review draft and update the ledger. Translation uses an approved English revision and does not invent new research.

The task panel shows stage, elapsed time, received content size, checkpoints and sanitized call diagnostics. Reasoning text and API keys are not saved in task output. Each model request has connection, inactivity and total deadlines, and each job has a 20-minute upper bound.

## Failure recovery and accounting

Successful planning, research, outline and drafting stages are saved as checkpoints. Retry reuses them only when the content/configuration fingerprint still matches and the checkpoint is no older than 24 hours. HOLD retries refresh research. Validation failures regenerate the draft. Old jobs created before checkpoint support require a fresh run. Jobs allow at most three execution attempts; transient HTTP 429/5xx responses have a separately bounded retry setting. Ambiguous timeouts and interrupted streams do not automatically replay potentially billable requests. Running jobs can be canceled.

The dashboard separates provider-reported actual tokens from reservations whose usage is unknown. A timeout can still consume provider tokens, so an unknown reservation is retained against the monthly local budget; it is not presented as a confirmed provider charge. Search/fetch request counts are separate. Compare billing against the provider console when investigating costs.

## Deployment and verification

Run `bash update.sh` on the deployment server, then save the preset and test it in the backend. No production API keys were used in repository tests. Automated fixtures cover stream boundaries, keepalive, interrupted responses, parameter selection, bounded retries, cancellation, checkpoint recovery, budgets and source restrictions. Successful fixture tests do not prove that a production server can reach the provider or that an account has tool permissions.

## Quotation-only product pages

Product-family pages describe custom manufacturing subject to drawing review and quotation. Their structured entity is now `Service`, linked to the organization and page, rather than a `Product` lacking a real price or review. No free offers, invented prices or ratings are added. All six languages share this rule. Legacy quote-only Product overrides saved in the SEO editor are normalized when read, preserving their title and description.

This intentionally stops requesting Google Product rich-result eligibility for quotation-only families. After deployment, inspect the live URL in Search Console and request validation of the old issue. Reports reflect Google's last crawl and may continue showing the old Product error until recrawl; this change does not guarantee indexing or ranking.

## Topic-routing contract

PLAN is a preliminary routing stage, not the final gap assessment. Its request includes a refreshed inventory timestamp, baseline page hashes, source fingerprints, the coverage directory and separate draft/task summaries. It selects 1–4 exact existing path strings. Full bodies and baseline hashes are delivered to OUTLINE for the specialist assessment; DRAFT receives the same context. The routing prompt must not demand file access or a completed body comparison before selecting pages.

A malformed PLAN response receives one explicit format-correction request, counted against the normal model budget. If still invalid, the job stops with PLAN_SCHEMA_INVALID diagnostics (returned status, paths type/count and a bounded path preview). No arbitrary fallback pages are substituted and invalid plans are never checkpointed. Pipeline versioning invalidates checkpoints created under the old routing contract. This format correction is distinct from network retries and never turns missing evidence into approval.
