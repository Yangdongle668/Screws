# Canonical article document — zufek.article.v1

This is the server-owned stored and exported document format. It is not a list of admission gates for a writing model. The application assembles the complete canonical JSON from the article body, task settings and available model suggestions.

## Model writing task

Write a complete useful English article. Supply article.title, article.intro and article.sections as heading/body pairs when possible. Existing compatible section objects and Markdown content can also be organized by the application. Preserve all technical meaning, numbers and actual paragraphs. Do not output placeholder prose merely to fill a field.

The fixed-field ZUFEK_FIELDS_V1 transport remains supported. Valid JSON remains readable. No need to duplicate a full Markdown copy outside the structured article. Optional SEO and publication suggestions may accompany the article; missing bookkeeping or metadata does not justify HOLD or a request for sources.

Search results, PAA, publisher pages and other AI assessments are reference material. They are not proof of engineering correctness and are not prerequisites for writing. Useful inferred reader questions are valid without a Google observation claim. Avoid invented search metrics, measurements, certifications, customer cases or news; omit or qualify an unconfirmed precise assertion.

For updates return the full revised article. The server preserves its existing route and protects later manual edits. For new articles answer the selected reader question; actual route/title/content collisions are checked against the website. A formal gap-evidence paragraph is optional editorial context, not a publication license.

## Server assembly

The canonical document includes:

- schemaVersion, status, reason, editorial topic/comparison notes and uncertainties;
- publication action, article type and authoritative route from the task;
- keywordBrief with inferred keyword intent, existing comparison paths and optional observed PAA;
- seo title, description, valid related links and social metadata, derived from the article when absent;
- schema type and concise topics; server rendering supplies organization, author, URLs, actual dates and language alternates;
- article title, introduction, complete sections, category, existing product/cover, optional checklist/example/processes/references, keywords and links;
- optional sources and a change summary.

No model response has to copy all these fields perfectly. The application fills metadata from supplied content without inventing engineering evidence, records advisory notes and preserves the raw response. It does not request a second full-body rewrite solely for a missing meta field, schema shape or change-summary key.

A complete article returned early at OUTLINE can be retained as the draft. When there is no actual body, the application retains the response and reports that honestly rather than manufacturing an article. Network/authentication failure, cancellation, exhausted budgets or unreadable/truncated actual body output can still require retry.

## Review and publication

Editorial assessments, overlap suggestions and small-update findings are visible review notes, not third-party vetoes. Exact duplicate destinations, titles and clearly repeated content, simultaneous writes to the same article, and changes since approval remain application responsibilities. Completely unchanged updates do not produce another version.

English approval authorizes the established five-language translation and unified publication process. Updates retain original first-publication dates and rollback snapshots. Never claim that a model response has been published before the server publication transaction succeeds.

References are optional for all article types, including industry insights. The existing reference policy may omit unverified suggested links from the public bibliography while retaining notes; this does not block draft saving. Without fresh references, write qualitative industry analysis rather than fabricated reports of recent events.

The experimental BODY/SEO split remains disabled in production. Production uses one full-body DRAFT response and deterministic server metadata assembly.
