# English-first content maintenance

Industry insight and guide originals are Markdown in `scripts/content/insights/` and `scripts/content/guides/`. `scripts/content/manifest.json` controls descriptions, images, primary-source references and related-page links. Publish English revisions first in the authoring workflow, review source facts separately from engineering interpretation, then update five translation dictionaries before generating the site. Builds do not call an online translation service.

The 2026-10-30 release contains six industry analyses (approximately 1,800–2,100 English words each), five additional guides (approximately 1,000–1,200 English words), and a 15-question general FAQ. The guide index now contains eight guides. Sources include IEA, IFR, European Commission/EUR-Lex, NASA and ISO scope pages. ISO abstracts identify scope and applicability, not the full licensed normative requirements. Publication titles may remain in their official source language.

Translations have automated coverage and technical-term checks plus contextual editorial corrections; this is not native-language certification or engineering sign-off for a customer design. Do not invent OEM approvals, customer outcomes, measured performance, material equivalence or universal compliance deadlines. Repairability/passport content explicitly distinguishes the regulatory framework from product-specific applicability.

Run `node scripts/verify-deep-content.mjs` for word counts, source links, related links, six-language presence and FAQ coverage. Its output is `docs/reports/deep-content-audit.json`. Run the normal content, multilingual, metadata and topology checks after every change.

Suggested ongoing cadence: one technical article each week, two sourced industry analyses each month, and review two existing pieces monthly. This is an editorial plan, not an automatic scheduler. Verify facts, approvals and translation completeness before publication. Update an article date when its content changes, not on every build.

## AI editorial inventory and specialist prompts

See [content operations](content-operations/README.md). Before planning any new content, refresh `node scripts/content-inventory.mjs` and verify with `node scripts/content-inventory.mjs --check`. Read the inventory, existing task ledger and the task-specific English prompt; demonstrate a real coverage gap before researching. Drafts and published content are recorded separately. This documentation does not enable a scheduler or AI API.
