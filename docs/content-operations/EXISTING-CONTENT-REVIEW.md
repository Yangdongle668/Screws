# Existing content review task prompt

Read PRINCIPLES.md, inventory.json and task-ledger.json. Select an existing page with a demonstrable missing answer, stale source, ambiguous engineering claim, broken link or mismatch with reader intent. Read the full page and related competing pages; capture current source and English body hashes before proposing edits.

Produce an evidence table: current passage, problem, impact on the reader, supporting evidence and proposed correction. Preserve valid content and established routes. Prefer targeted additions and corrections over a wholesale rewrite. Strengthen qualifications, practical decision help and relevant links. Do not change facts merely for style, refresh dates without substance, invent new capability claims or add questions solely to obtain FAQ markup.

Return the proposed patch, before/after summary, sources, unchanged scope, metadata/schema implications and exact translation dependencies. If an engineering conclusion or corporate commitment would change, flag it for explicit review. Return NO_CHANGE if no material improvement is justified. Record a proposed ledger entry without asserting approval or publication. Stop if baseline hashes no longer match.

## Search-intent and SEO deliverables

Identify the existing page's primary query and the missing answer, rather than changing its topic to chase traffic. At OUTLINE include seoBrief {primaryKeyword,secondaryKeywords,searchIntent,readerQuestion,competingPaths,coverageDecision,serpURLs,inferredQuestions,observedPAA:[]}; coverageDecision should normally be improve_existing. Use only supplied search observations, with no invented search metrics or PAA. At DRAFT include seo {title,description,internalLinks:[{path,label}]} and explain why each change improves the same reader decision. Preserve the canonical destination and valid existing schema relationships. Do not refresh publication dates merely to look current.

PAA is optional research context from the connected browser/SerpApi question library. Use relevant supplied questions or IDs as observedPAA. Put other useful or rephrased reader questions in inferredQuestions; they are valid topic ideas without a Google observation claim. The server normalizes provenance and retains country, language and capture time. An empty or unavailable library never blocks writing. PAA frequency is not search volume, and a question is not engineering evidence.

Apply WRITING-STYLE.md. Resolve the specific reader decision in natural, precise engineering language, with meaningful assumptions and evidence. Avoid empty transitions, repeated templates and unsupported absolutes. Do not invent personal experience or manipulate prose to fool AI detectors. A style-risk score is not an AI-authorship percentage. Preserve the specialist task structure and all technical facts.

## Complete article publication contract

For READY_FOR_REVIEW return a complete structured article, not only a Markdown body or before/after patch. Include slug, title, metaTitle, description, category, intro, sections as heading/body pairs, an existing product and cover, checklist, example, sources and relevant internal links. The server supplies existingArticle and updateTarget when revising an article: preserve its slug, path, valid technical content and unchanged sections, integrating the substantive corrections into the full replacement. A patch summary may accompany the complete article but cannot replace it. English approval authorizes server-managed overwrite, five-language translation and unified publication; the server stores a rollback snapshot. Preserve original first-publication dates. Do not publish yourself.

The final DRAFT must follow ARTICLE-OUTPUT.md and the supplied ARTICLE_OUTPUT_SCHEMA (zufek.article.v1). Return one complete article JSON object, including publication intent, the unchanged keyword brief, full article, SEO/social metadata, schema content, evidence claims and change summary. Do not return a second full Markdown body. Apply this format without weakening the specialist research and editorial requirements above.

Source policy override: external references are not required. Write from approved company facts, the supplied existing content and sound general engineering knowledge. Return sources:[] and article.sources:[] and do not append a reference section. Do not stop solely because no external source or PAA was supplied. Omit or qualify unverified precise data instead of inventing citations.

## Update eligibility and actual changes

This task updates an existing article only; coverageDecision must be improve_existing. Respect the supplied minimum update interval, except for an explicit server-authorized manual override. Compare published coverage, pending updates and reserved topics. Identify the exact target route. Preserve useful original passages; a recent publication or rewritten title is not a reason to generate another revision. The server compares old and new paragraphs and independently reviews the reader benefit. Cosmetic wording, reorganized headings, generic caveats, filler and paraphrases do not constitute a substantive update. Return NO_CHANGE when no concrete new decision, answer or correction remains. Sources are optional and must not become an eligibility gate.
