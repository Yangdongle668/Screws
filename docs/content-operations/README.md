# AI content operations

This package records existing content and defines separate English prompts. It does not configure an AI API, run scheduled jobs or authorize automatic publication.

## Read before every job

1. Regenerate the website if content sources have changed, following the repository validation workflow.
2. Run `node scripts/content-inventory.mjs`, then `node scripts/content-inventory.mjs --check`.
3. Read PRINCIPLES.md and task-ledger.json. Read inventory.json summary first, then relevant complete page records. Do not send the entire inventory blindly to the model; retrieve candidate records and their linked context within a token budget.
4. Select exactly one specialist prompt. All require PRINCIPLES.md; the specialist supplies its own task-specific requirements.

| Task | Prompt | What it must demonstrate |
|---|---|---|
| Technical blog | TECHNICAL-BLOG.md | An unanswered engineering/purchasing decision, a direct answer and practical checks |
| Industry insight | INDUSTRY-INSIGHT.md | A verified development, dates, change from prior coverage and qualified buyer implications |
| Existing-page review | EXISTING-CONTENT-REVIEW.md | Passage-level gaps, evidence, patch and revision comparison |
| Engineering guide | ENGINEERING-GUIDE.md | Inputs, decision gates, responsibilities and usable release/checklist outputs |
| Product/material/process/industry page | COMMERCIAL-PAGE.md | Missing selection/specification information for that exact commercial page |
| Translation | TRANSLATION.md | Explicitly approved English revision, contextual terminology and numerical fidelity |

## Write-back contract

Before researching, add a task record with an immutable ID, chosen prompt, compared inventory IDs/hashes, intended question and gap evidence. Record state transitions and tool-confirmed results. After drafting, store the artifact separately and record its location/hash in the ledger with `drafted` or `in_review`. Do not add it to the published inventory merely because it exists.

After approved content is integrated into source, regenerate the website and inventory and verify freshness. Preserve prior task/review history. Record production publication only when deployment and URL verification confirm it. Record the actual English revision for approved translations; existing translation presence alone proves neither approval nor revision alignment.

Repository presence, source verification, editorial approval and production publication are separate facts. Recorded source links have NOT been reverified by the inventory generator. Descriptions and word counts are not evidence of content depth or missing coverage. Gap proposals must cite the relevant body passages.

The future backend must implement file locking, atomic ledger updates, immutable artifacts/history, duplicate-job prevention, source-hash checks, approval permissions, budgets and failure alerts. Do not rely on prompt instructions as enforcement. The generator writes only inventory.json and never resets task-ledger.json.

## Task record fields

Use: id, taskType, promptVersionHash, status, createdAt, updatedAt, intent, gapEvidence, comparedPages (path + hash), sources (URL + retrievedAt + claims), artifactPath, artifactHash, reviewer, checks, sourceRevision, deployedRevision, translations, cost and error. Use null for unknown facts, never invented values.

## Initial snapshot

135 English public repository pages: 42 technical blog articles, 6 industry insights, 8 engineering guides, plus core, hub and commercial pages. Commercial categories include their hub pages. Five target-language editions are tracked per English page. Admin and private inquiry data are excluded.
