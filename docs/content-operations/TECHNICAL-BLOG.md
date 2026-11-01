# Technical blog task prompt

Read PRINCIPLES.md, inventory.json and task-ledger.json first. Focus on existing technical blogs and related product, material, process, guide and FAQ pages. Read their full content using the inventory paths. Do not reuse the industry-insight template.

Find one specific unresolved engineering or purchasing question. State the existing answer, exactly what is missing, and why it deserves an update or a separate article. Inspect current search questions if tools are available; never invent observed People Also Ask results. Reject a proposed new page if an existing page serves the same intent and can be improved.

Research only after gap analysis. Verify applicable definitions, material conditions, standards scope and methods. Write a direct answer, necessary assumptions, decision factors, failure modes, a practical check or example, and next steps. Use a worked example only with explicit assumptions; no invented test evidence. Do not force every article into identical sections. Write enough to resolve the question without padding or keyword-density targets.

Provide evidence-backed claims and relevant existing internal links, suggested title and meta description. Return READY_FOR_REVIEW, HOLD or NO_CHANGE, plus compared page IDs/hashes, gap evidence, primary intent, draft, source verification, uncertainty, proposed ledger update and suggested publication destination. Never mark the draft published. Follow the common lifecycle and company-fact restrictions.

## Search-intent and SEO deliverables

Target one specific engineering or procurement query, not a broad head term such as "screws". At OUTLINE, return seoBrief with a primaryKeyword, related secondaryKeywords, searchIntent, readerQuestion, competingPaths and coverageDecision (new_article or improve_existing). Compare the actual supplied bodies before choosing a new page. Use supplied search-result URLs as observations; if none are available, label the keyword rationale as inference from publisher sources and reader intent. No search volume, difficulty, rank or observed PAA can be invented. observedPAA must remain empty unless the server supplies a verified PAA block; infer useful reader questions separately.

At DRAFT, include seo {title, description, internalLinks:[{path,label}]} alongside the structured article. The title must clearly promise the answer actually delivered; the opening should answer it directly. Use the main phrase and related terminology naturally, without a density target. Provide a unique concise meta description and descriptive, contextually relevant link anchors. The article title/description and SEO fields must agree. Do not output raw JSON-LD, meta keywords, fake dates, ratings or offers: the publisher generates schema and canonical/social metadata from validated article data.

When the server supplies observedPAA library records, they are timestamped browser observations from Google. You may select their exact question strings for seoBrief.observedPAA, retaining the supplied country/language/date context. An empty supplied list requires an empty observedPAA output. Do not relabel inferred questions as observed; PAA frequency is not search volume and an answer excerpt is not verified engineering evidence.

Apply WRITING-STYLE.md. Resolve the specific reader decision in natural, precise engineering language, with meaningful assumptions and evidence. Avoid empty transitions, repeated templates and unsupported absolutes. Do not invent personal experience or manipulate prose to fool AI detectors. A style-risk score is not an AI-authorship percentage. Preserve the specialist task structure and all technical facts.
