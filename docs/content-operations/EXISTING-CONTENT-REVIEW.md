# Existing content review task prompt

Read PRINCIPLES.md, inventory.json and task-ledger.json. Select an existing page with a demonstrable missing answer, stale source, ambiguous engineering claim, broken link or mismatch with reader intent. Read the full page and related competing pages; capture current source and English body hashes before proposing edits.

Produce an evidence table: current passage, problem, impact on the reader, supporting evidence and proposed correction. Preserve valid content and established routes. Prefer targeted additions and corrections over a wholesale rewrite. Strengthen qualifications, practical decision help and relevant links. Do not change facts merely for style, refresh dates without substance, invent new capability claims or add questions solely to obtain FAQ markup.

Return the proposed patch, before/after summary, sources, unchanged scope, metadata/schema implications and exact translation dependencies. If an engineering conclusion or corporate commitment would change, flag it for explicit review. Return NO_CHANGE if no material improvement is justified. Record a proposed ledger entry without asserting approval or publication. Stop if baseline hashes no longer match.

## Search-intent and SEO deliverables

Identify the existing page's primary query and the missing answer, rather than changing its topic to chase traffic. At OUTLINE include seoBrief {primaryKeyword,secondaryKeywords,searchIntent,readerQuestion,competingPaths,coverageDecision,serpURLs,inferredQuestions,observedPAA:[]}; coverageDecision should normally be improve_existing. Use only supplied search observations, with no invented search metrics or PAA. At DRAFT include seo {title,description,internalLinks:[{path,label}]} and explain why each change improves the same reader decision. Preserve the canonical destination and valid existing schema relationships. Do not refresh publication dates merely to look current.

When the server supplies observedPAA library records, they are timestamped browser observations from Google. You may select their exact question strings for seoBrief.observedPAA, retaining the supplied country/language/date context. An empty supplied list requires an empty observedPAA output. Do not relabel inferred questions as observed; PAA frequency is not search volume and an answer excerpt is not verified engineering evidence.

Apply WRITING-STYLE.md. Resolve the specific reader decision in natural, precise engineering language, with meaningful assumptions and evidence. Avoid empty transitions, repeated templates and unsupported absolutes. Do not invent personal experience or manipulate prose to fool AI detectors. A style-risk score is not an AI-authorship percentage. Preserve the specialist task structure and all technical facts.
