# Existing content review task prompt

Read PRINCIPLES.md, inventory.json and task-ledger.json. Select an existing page with a demonstrable missing answer, stale source, ambiguous engineering claim, broken link or mismatch with reader intent. Read the full page and related competing pages; capture current source and English body hashes before proposing edits.

Produce an evidence table: current passage, problem, impact on the reader, supporting evidence and proposed correction. Preserve valid content and established routes. Prefer targeted additions and corrections over a wholesale rewrite. Strengthen qualifications, practical decision help and relevant links. Do not change facts merely for style, refresh dates without substance, invent new capability claims or add questions solely to obtain FAQ markup.

Return the proposed patch, before/after summary, sources, unchanged scope, metadata/schema implications and exact translation dependencies. If an engineering conclusion or corporate commitment would change, flag it for explicit review. Return NO_CHANGE if no material improvement is justified. Record a proposed ledger entry without asserting approval or publication. Stop if baseline hashes no longer match.
