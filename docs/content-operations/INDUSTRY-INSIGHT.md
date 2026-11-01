# Industry insight task prompt

Read PRINCIPLES.md, inventory.json and task-ledger.json first, then read relevant existing industry insights and industry application pages in full. Do not write a technical tutorial disguised as news.

Identify a verified development not adequately covered: publication, market evidence, regulation, infrastructure change or supply-chain development. Record event date, source publication date, retrieval date, scope and what changed since existing coverage. Prefer official institutions, regulators and original reports. If no sufficiently relevant evidence is available, return HOLD rather than manufacture news.

Explain what happened, what the evidence actually supports, how it may affect a defined buyer or equipment interface, what remains uncertain and what purchasing teams should review. Separate source findings from ZUFEK editorial interpretation. Avoid claiming that a macro trend proves demand for a particular screw. Distinguish legal frameworks from product-specific obligations and effective dates. Do not imply regulatory advice or universal compliance.

Link to relevant technical explanations rather than repeating whole tutorials. Supply a substantive English draft, distinct intent, source-to-claim mapping, comparisons with current coverage, dates, proposed metadata, existing internal links and review questions. Return READY_FOR_REVIEW, HOLD or NO_CHANGE and a proposed ledger transition. No publication without the separate authorized workflow.

## Search-intent and SEO deliverables

Choose a query combining the verified development with its concrete purchasing or equipment implication. Do not target a generic trend merely for traffic. At OUTLINE provide seoBrief {primaryKeyword,secondaryKeywords,searchIntent,readerQuestion,competingPaths,coverageDecision,serpURLs,inferredQuestions,observedPAA:[]}. Distinguish observed search-result URLs from hypotheses; publisher reports alone do not establish Google demand or PAA. No invented volume, difficulty or ranking. At DRAFT provide seo {title,description,internalLinks:[{path,label}]}; accurately qualify event dates and scope in the headline and summary. Link to engineering explanations and the relevant industry page. Propose Article/BlogPosting semantics only after a real publication destination is chosen; do not invent NewsArticle status or dates.

When the server supplies observedPAA library records, they are timestamped browser observations from Google. You may select their exact question strings for seoBrief.observedPAA, retaining the supplied country/language/date context. An empty supplied list requires an empty observedPAA output. Do not relabel inferred questions as observed; PAA frequency is not search volume and an answer excerpt is not verified engineering evidence.

Apply WRITING-STYLE.md. Resolve the specific reader decision in natural, precise engineering language, with meaningful assumptions and evidence. Avoid empty transitions, repeated templates and unsupported absolutes. Do not invent personal experience or manipulate prose to fool AI detectors. A style-risk score is not an AI-authorship percentage. Preserve the specialist task structure and all technical facts.

## Complete article publication contract

For READY_FOR_REVIEW return a complete structured article, not only a Markdown body or before/after patch. Include slug, title, metaTitle, description, category, intro, sections as heading/body pairs, an existing product and cover, checklist, example, sources and relevant internal links. The server supplies existingArticle and updateTarget when revising an article: preserve its slug, path, valid technical content and unchanged sections, integrating the substantive corrections into the full replacement. A patch summary may accompany the complete article but cannot replace it. English approval authorizes server-managed overwrite, five-language translation and unified publication; the server stores a rollback snapshot. Preserve original first-publication dates. Do not publish yourself.

The final DRAFT must follow ARTICLE-OUTPUT.md and the supplied ARTICLE_OUTPUT_SCHEMA (zufek.article.v1). Return one complete article JSON object, including publication intent, the unchanged keyword brief, full article, SEO/social metadata, schema content, evidence claims and change summary. Do not return a second full Markdown body. Apply this format without weakening the specialist research and editorial requirements above.
