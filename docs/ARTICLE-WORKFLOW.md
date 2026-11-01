# Approved article publication and editorial analysis

## Approval authorizes publication

For complete **technical blogs, industry insights, engineering guides and existing-article reviews**, the English approval action now authorizes this server workflow: save the validated English article, translate German/Spanish/Italian/Chinese/French through the saved model API, save each structured translation, then publish all six language versions in one database transaction. The existing model request/token budgets still apply. Generation of a draft alone never publishes it; existing-article reviews overwrite the approved target at its existing route. Non-article product/company page patches remain outside this article renderer.

New approvals create a durable publication request. Older approved tasks are not bulk-published by an update: their task details offer **启动五种翻译并发布六种语言**. The article management panel displays the article as soon as its English draft is saved, with workflow progress. Source badges distinguish manual AI tasks, scheduled AI tasks and manual editing. Historical records without provenance are marked as unknown rather than guessed.

Publication records and per-language steps are stored in `ai_publications` and `ai_publication_steps`. English article IDs, source fingerprints, immutable routes/assets, section/list structure, numeric values, standard identifiers and reference/internal-link targets are checked. Metadata and link labels are translated naturally. Checks are safeguards, not a certification of engineering or translation accuracy; model uncertainty or validation failures stop the workflow.

Each language keeps its successfully generated payload. An interrupted or failed workflow requires an explicit retry; previously successful translations are reused, not generated again. A language has at most three generation attempts. Ambiguous model timeouts are not silently replayed, and retained budget reservations are not provider billing statements. Budget exhaustion can leave the article pending until configuration is reviewed. Stop controls cancel unfinished publication, while manual withdrawal also stops an active automated workflow. Already committed publication can be withdrawn through article management.

Approval of an article update authorizes overwriting the target source and translations, with a pre-update six-language release snapshot. New articles do not overwrite occupied URLs; edits made after approval stop the running workflow. Publication validates all revisions and commits English plus five translations together; a concurrent revision change rolls back the transaction. Reopening an already completed workflow does not create duplicate publication versions. First-publication timestamps remain real, and repeat publication retains known original dates. Sitemap, language alternates and LLM resources use the existing runtime content inventory. Final publication state is attached to the task ledger separately from English approval.

## Article editor

The editor has a separate Meta title, description, focus/related keywords, matched cover/product selection, references and related internal links. Section bodies support visual bold/italic, lists, links and Markdown source. Text is stored as constrained Markdown; arbitrary HTML and scripts are escaped, clipboard HTML is not executed, and rendered links permit only HTTPS or root-relative site paths. Older plain-text articles remain plain until edited and saved. Title and meta title have separate purposes; the brand suffix is not duplicated.

A live SERP preview and per-dimension SEO checks are editing aids. They do not predict Google's snippet selection or ranking. The reading-time estimate is calculated from text length. Source provenance is shown in the backend, not as a public article badge. Translation editing also exposes the localized Meta title.

## AI writing-style assessment

The requested AI-content check is implemented as **writing-style risk**, not a reliable measurement of AI authorship. The visible 0–100 score is explicitly labelled as a heuristic editorial risk score, never an "AI percentage". Signals include dense em dashes, repeated stock phrases, repetitive paragraph openings, unusually uniform sentence lengths and unsupported absolute wording. These signals can occur in human technical writing; low scores do not prove human authorship and high scores do not prove AI origin. Known AI-assisted workflow provenance is retained even when style risk is low.

Every English master article receives a separate transparent SEO readiness score and heuristic style assessment. The SEO score covers topic/intent inputs, metadata, depth/actionability, internal links, declared references, reading structure and schema readiness. Its length bands and weights are local editorial choices, not Google rules. Source links are not automatically treated as verified engineering evidence. These checks do not impose a keyword-density target.

Single-article and bulk **AI风格与SEO复核** actions queue model review through the saved API and its shared budget. The model provides Chinese explanations, exact original passages and actionable improvements. It cannot claim an AI-generation probability or a Google score. Reports are persisted in `ai_article_audits` against a hash of the content and metadata. Unchanged current reports are reused; edits make old reports stale. Failed analyses can be retried up to three times per content version. Bulk review does not automatically rewrite or publish any article.

`docs/content-operations/WRITING-STYLE.md` is an English common instruction loaded into generation alongside the distinct task prompts. It prioritizes specific engineering decisions, assumptions, evidence and natural language; it rejects fabricated anecdotes, fake facts, deliberate errors and detector-evasion templates. Generation records local SEO/style checks for the human review stage.

## Verification

- `node docker/verify-ai-publishing.mjs`: real internal editorial APIs, five translations, resumability, numeric protections, origin badges, atomic rollback under concurrent edits, publication idempotency and collision protection; no external calls.
- `node docker/verify-ai-autoflow.mjs`: English approval triggers all five API translation calls and six published versions, management scores, model analysis and publication ledger, using an injected provider.
- `node docker/verify-article-audits.mjs`: transparent score limits, known AI provenance, safe Markdown, cached results, stale reports and validated quoted passages.
- Existing runtime checks continue to validate authentication, origin checks, mail, storage, metadata and translation publication. Live model quality and production delivery still require observation after deployment; repository tests do not call the owner's paid account.

## Troubleshooting task-to-article handoff

AI task drafts are not article-manager records until the approved publication workflow saves the English master. Legacy approved jobs need the explicit start-publication action. Body-only legacy jobs and patch-only legacy updates lack a complete article and must be regenerated or completed first. Full updates preserve their existing route and do not create duplicate articles. Job details now explain structural eligibility and the handoff stage; action errors are shown inside the open dialog rather than only behind it. Missing fields must be repaired and reviewed, not replaced with invented metadata or silently regenerated paid calls.

## Source matching and task deletion

Source fetches now preserve the allowed redirect chain and final URL. Citation validation normalizes URL syntax and fragments and rewrites verified aliases to the fetched final address. It never assumes different paths, query strings, www hosts or trailing slashes are equivalent without a verified redirect. Draft prompts receive an explicit citation registry. Validation diagnostics list unverified citations and the available fetched addresses; valid planning/research checkpoints can be reused on retry.

Task details provide permanent deletion with an explicit checkbox to include task-created articles (default selected). The confirmation warns that published English and translated pages will be removed. Deletion includes dependent translation jobs, task events, calls, publication workflow steps, owned article drafts, versions, translations, HTML publications, audit reports and task/checkpoint files. Other articles are preserved; legacy ownership is accepted only through an existing handover record without another owning task. Running generation, publication or analysis must finish or be cancelled first. Database changes are atomic; a cleanup queue retries failed file removal on restart. Inventory and ledger are refreshed. Existing independent backups are not rewritten.

Only month-level anonymous usage totals and scheduled-slot suppression remain, without task IDs, article bodies, URLs or error diagnostics. These prevent billing-limit resets and unwanted recreation of deleted scheduled jobs. Deleting does not refund already incurred provider charges.

## Unified article types and rollback

New technical articles use /blog/, industry insights /industry-insights/, and engineering guides /guides/. Their list pages, schema, canonical URLs, hreflang, sitemap and LLM inventory share the runtime article records. Existing repository resource articles are now exposed in article management as structured masters. Review tasks select existing articles and receive their full current article object. The server assigns updateTarget; it is not a model-authorized arbitrary page write.

An approved update snapshots the pre-update English and five translated release states in article_release_history, saves the complete replacement English master, regenerates all five translations, and commits the six published pages together. Existing URLs and known first-publication dates are preserved. Failed updates leave the current public HTML in place; per-language caches allow resumption. Concurrent edits after approval remain protected. Article management exposes “回滚并发布六种语言”, restoring the prior public HTML and article/translation records without extra AI calls; the replaced current version is itself retained. This is separate from the existing restore-to-draft action. Pure product/company patches are not treated as articles.

`node docker/verify-ai-article-types.mjs` verifies all article destinations, six-language routing, list links, crawl resources, overwrite, original-date preservation and six-language rollback using local fixtures, without paid calls.
