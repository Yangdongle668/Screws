# AI maintenance: DeepSeek setup and recovery

The Docker worker runs every 60 seconds. Scheduled jobs and manual jobs use the same queue; every generated English result starts as a draft for human review. Approval of a complete technical blog, industry insight, engineering guide or existing-article update starts the authorized five-language translation and six-language publication workflow. Article updates overwrite their established routes with six-language rollback snapshots; non-article page patches remain manual integrations. See ARTICLE-WORKFLOW.md.

## Configuration

In the Chinese administration panel, open **AI内容维护** and select the official DeepSeek preset. Confirm `https://api.deepseek.com`, the model available to your account (the preset uses `deepseek-flash`), `max_tokens`, streaming enabled, and a 600-second request deadline. Reasoning is disabled by default for predictable editorial generation; low/high thinking can be selected for drafting. Planning and outline requests disable thinking. Third-party compatible endpoints do not automatically receive DeepSeek-specific parameters. Save configuration before testing; a test is a short API probe, not an end-to-end article test.

Search is separate from model generation. The default public-web mode reads public Bing/DuckDuckGo HTML result pages, follows regional search redirects, and fetches allowed publishers directly. It requires no search API key or subscription. If search engines supply no usable allowed results, it explores relevant links from trusted publisher home/technical pages with a bounded crawl. This is not unrestricted browsing: network failures, access challenges, PDF-only sources and publisher restrictions can still produce HOLD. The task records search result counts, domain filtering, publisher discovery and source failures. Legacy configurations migrate once to this public-web default; optional paid modes are used only when explicitly selected afterward. With the official DeepSeek endpoint, native search/fetch can use the same API key, subject to provider permission and tool charges. A monthly request cap applies to attempted search/fetch requests. Brave requires its separate key. Reference-only mode reads approved reference URLs and existing sources; it cannot discover current news. References are optional; missing web evidence does not block article generation. Omit unsupported precise assertions and write useful qualitative guidance.

## Execution sequence

1. Read the current published-content inventory, draft ledger, company facts, maintenance principles, and the prompt specific to the task type.
2. Compare relevant existing pages and identify an uncovered engineering or procurement question.
3. Research approved sources and record retrieved evidence, source failures, and retrieval mode.
4. Generate a structured outline and mandatory keyword brief: primary/related terms, search intent, reader question, existing competing paths and new-page versus improvement decision. Distinguish observed search URLs from inference; uncollected PAA and unavailable metrics must not be invented.
5. Draft from that outline and evidence. Structured technical articles are rendered into Markdown by the server instead of asking the model to duplicate the body.
6. Validate source references, descriptive existing internal links, mandatory SEO title/description, minimum content and response completeness; save a review draft and update the ledger. Translation uses an approved English revision and does not invent new research.

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

## SEO handoff and publication

Each review-ready draft must have `seo` metadata and a `keywordBrief`. Missing title/description, non-existing internal paths, fabricated SERP URLs or claimed PAA observations stop validation. Search volume and difficulty remain explicitly unavailable, not invented. Duplicate titles and long metadata are flagged for review; intent cannibalization still needs editorial judgment. A task proposing improvement of an existing page cannot be handed over as a new technical blog.

Technical handoff carries the validated title, description, topic keywords and descriptive related links into the article editor. The editor exposes keywords and internal links for adjustment and preserves them when saving. Keywords are article topics, not a meta-keywords tag or a density target. Publication renders canonical, social metadata, image, language, author/publisher, breadcrumbs and BlogPosting. New articles record the actual first publication timestamp, retaining it on subsequent revisions; older unknown first-publication dates are not fabricated. Related product references use the manufacturing-service entity. Translation generates locale-specific page URLs and metadata under the existing publication workflow.

Industry insights, guides and targeted page reviews receive SEO metadata and a schema plan, but continue to require manual merging into their respective destinations. A schema plan is not deployed JSON-LD. Only explicit English approval authorizes the technical-article publication workflow; no PAA rich-result eligibility, keyword-demand measurement, indexing or ranking is guaranteed.

## Bounded evidence recovery and accurate task diagnostics

A HOLD at PLAN, RESEARCH or OUTLINE is not a legacy manuscript missing article JSON: the pipeline has not produced a publication draft yet. Job details now distinguish these states, no-change outcomes and genuine legacy body-only manuscripts. Article JSON and SEO metadata remain required for READY_FOR_REVIEW article tasks.

Research ranks technical-page candidates above obvious catalogues and records page-type/term-match hints. These hints are not proof of engineering claims. A catalogue-only public search also triggers bounded publisher discovery. Default source domains now include ASME and NIST; existing custom domain lists are preserved, while exact prior-default lists receive the additional official domains.

OUTLINE may request INSUFFICIENT_EVIDENCE with missingEvidence and targeted researchQueries. The server performs at most one additional research pass and one additional outline assessment, under existing network, model and search budgets. Successful research/checkpoints are retained; HOLD retries invalidate both initial and follow-up research/outline checkpoints. A supported delta may become improve_existing; no material delta means NO_CHANGE. Missing PAA alone never requires HOLD. If the additional sources still do not support the claim, the task remains HOLD instead of fabricating an article.

## Current source policy (overrides earlier mandatory-source descriptions)

External references are optional for all article types, including industry insights. Technical blogs, guides and ordinary updates skip external research and normally publish with sources:[] and article.sources:[]. Industry insights may enable insightResearch in the panel (default false); research failures or empty responses do not block qualitative writing. No search request is made when this option is off. Unknown references are omitted from the optional reference list and recorded in task referenceNotes rather than used as an article-generation gate. Missing JSON fields, broken destinations and invalid article structure remain validation errors.

Approved company facts, existing full page content and general engineering knowledge guide writing. Unsupported precise figures, invented current events, credentials and measured customer results remain prohibited. A source-only HOLD is reconsidered once with a narrower qualitative scope. SEO scoring no longer allocates points by citation count; it evaluates applicability and decision support instead.
