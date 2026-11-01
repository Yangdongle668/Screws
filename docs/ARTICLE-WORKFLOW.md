# Approved article publication and editorial analysis

## Approval authorizes publication

For a complete **new technical blog**, the English approval action now authorizes this server workflow: save the validated English article, translate German/Spanish/Italian/Chinese/French through the saved model API, save each structured translation, then publish all six language versions in one database transaction. The existing model request/token budgets still apply. Generation of a draft alone never publishes it; targeted improvements to existing pages and other non-article patches remain manual integrations.

New approvals create a durable publication request. Older approved tasks are not bulk-published by an update: their task details offer **启动五种翻译并发布六种语言**. The article management panel displays the article as soon as its English draft is saved, with workflow progress. Source badges distinguish manual AI tasks, scheduled AI tasks and manual editing. Historical records without provenance are marked as unknown rather than guessed.

Publication records and per-language steps are stored in `ai_publications` and `ai_publication_steps`. English article IDs, source fingerprints, immutable routes/assets, section/list structure, numeric values, standard identifiers and reference/internal-link targets are checked. Metadata and link labels are translated naturally. Checks are safeguards, not a certification of engineering or translation accuracy; model uncertainty or validation failures stop the workflow.

Each language keeps its successfully generated payload. An interrupted or failed workflow requires an explicit retry; previously successful translations are reused, not generated again. A language has at most three generation attempts. Ambiguous model timeouts are not silently replayed, and retained budget reservations are not provider billing statements. Budget exhaustion can leave the article pending until configuration is reviewed. Stop controls cancel unfinished publication, while manual withdrawal also stops an active automated workflow. Already committed publication can be withdrawn through article management.

The server never overwrites a human-edited source or conflicting destination. Publication validates all revisions and commits English plus five translations together; a concurrent revision change rolls back the transaction. Reopening an already completed workflow does not create duplicate publication versions. First-publication timestamps remain real, and repeat publication retains known original dates. Sitemap, language alternates and LLM resources use the existing runtime content inventory. Final publication state is attached to the task ledger separately from English approval.

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
