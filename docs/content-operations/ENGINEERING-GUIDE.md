# Engineering guide task prompt

Read PRINCIPLES.md, inventory.json and task-ledger.json, then inspect existing guides, RFQ checklists, technical blogs and relevant commercial pages in full. Identify a missing end-to-end workflow, not merely a missing keyword.

Define the user, starting inputs, desired output, decision gates, responsibilities and acceptance evidence. Build an executable procedure with conditional paths, a reusable checklist or specification table, open questions and release criteria. Explain what the supplier can assess versus what the equipment designer must approve. Link to detailed technical articles rather than duplicating them.

Use hypothetical forms/examples only when clearly labeled. Do not invent acceptance limits, universal process requirements or delivered customer results. Return a guide draft, overlap/gap analysis, baseline IDs/hashes, sources, metadata, relevant links, human review requirements and proposed ledger entry. Use READY_FOR_REVIEW, HOLD or NO_CHANGE. Follow all common principles; never publish directly.

## Search-intent and SEO deliverables

Target the complete decision workflow a buyer is trying to perform: selection, specification, RFQ or acceptance planning. Avoid a new guide if an existing guide already owns that intent. At OUTLINE include seoBrief {primaryKeyword,secondaryKeywords,searchIntent,readerQuestion,competingPaths,coverageDecision,serpURLs,inferredQuestions,observedPAA:[]}. Distinguish observed searches from inferred questions; never invent volume, difficulty or PAA. At DRAFT include seo {title,description,internalLinks:[{path,label}]}. The title must identify the task and outcome; the description must state useful inputs or deliverables. Use executable headings and link to narrower articles, materials and products. Schema is proposed as TechArticle or Article after destination review; do not invent HowTo or FAQ eligibility.

When the server supplies observedPAA library records, they are timestamped browser observations from Google. You may select their exact question strings for seoBrief.observedPAA, retaining the supplied country/language/date context. An empty supplied list requires an empty observedPAA output. Do not relabel inferred questions as observed; PAA frequency is not search volume and an answer excerpt is not verified engineering evidence.

Apply WRITING-STYLE.md. Resolve the specific reader decision in natural, precise engineering language, with meaningful assumptions and evidence. Avoid empty transitions, repeated templates and unsupported absolutes. Do not invent personal experience or manipulate prose to fool AI detectors. A style-risk score is not an AI-authorship percentage. Preserve the specialist task structure and all technical facts.

## Complete article publication contract

For READY_FOR_REVIEW return a complete structured article, not only a Markdown body or before/after patch. Include slug, title, metaTitle, description, category, intro, sections as heading/body pairs, an existing product and cover, checklist, example, sources and relevant internal links. The server supplies existingArticle and updateTarget when revising an article: preserve its slug, path, valid technical content and unchanged sections, integrating the substantive corrections into the full replacement. A patch summary may accompany the complete article but cannot replace it. English approval authorizes server-managed overwrite, five-language translation and unified publication; the server stores a rollback snapshot. Preserve original first-publication dates. Do not publish yourself.

The final DRAFT must follow ARTICLE-OUTPUT.md and the supplied ARTICLE_OUTPUT_SCHEMA (zufek.article.v1). Return one complete article JSON object, including publication intent, the unchanged keyword brief, full article, SEO/social metadata, schema content, evidence claims and change summary. Do not return a second full Markdown body. Apply this format without weakening the specialist research and editorial requirements above.

Source policy override: external references are not required. Write from approved company facts, the supplied existing content and sound general engineering knowledge. Return sources:[] and article.sources:[] and do not append a reference section. Do not stop solely because no external source or PAA was supplied. Omit or qualify unverified precise data instead of inventing citations.
