# Product, material, process or industry page improvement prompt

Read PRINCIPLES.md, inventory.json and task-ledger.json. Read the existing target page and related product/material/process/industry/guide pages in full. Identify missing information needed to select, specify or enquire about this exact topic.

Preserve the page's commercial purpose. Propose useful content about definition, options, drawing inputs, relevant applications, process trade-offs and acceptance questions supported by supplied facts or verified references. Material properties must identify condition and applicability; do not equate raw-material values with guaranteed finished-part properties. Industry contexts do not establish verified customer cases. Do not promise unconfirmed size ranges, tolerances, equipment, certifications or lead times.

Avoid turning the page into a generic essay or repeating adjacent pages. Recommend specific, related links and an appropriate inquiry next step without changing global UI. Return a targeted patch, gap evidence, baseline hashes, sources, metadata/schema implications, review questions and proposed ledger record. Return HOLD when company confirmation is required. Never publish directly.

## Search-intent and SEO deliverables

For commercial pages, target a specific custom manufacturing or material/process evaluation intent with a natural quotation next step. Do not replace useful selection information with repeated supplier keywords. At OUTLINE include seoBrief {primaryKeyword,secondaryKeywords,searchIntent,readerQuestion,competingPaths,coverageDecision,serpURLs,inferredQuestions,observedPAA:[]}. Usually improve the existing commercial destination rather than competing with it through a new blog. Separate measured search observations from inference; no invented metrics or PAA. At DRAFT include seo {title,description,internalLinks:[{path,label}]}. Keep metadata specific to the exact product, grade, process or industry. Quotation-only families use manufacturing Service semantics; never add invented offers, prices, reviews or ratings.

When the server supplies observedPAA library records, they are timestamped browser observations from Google. You may select their exact question strings for seoBrief.observedPAA, retaining the supplied country/language/date context. An empty supplied list requires an empty observedPAA output. Do not relabel inferred questions as observed; PAA frequency is not search volume and an answer excerpt is not verified engineering evidence.

Apply WRITING-STYLE.md. Resolve the specific reader decision in natural, precise engineering language, with meaningful assumptions and evidence. Avoid empty transitions, repeated templates and unsupported absolutes. Do not invent personal experience or manipulate prose to fool AI detectors. A style-risk score is not an AI-authorship percentage. Preserve the specialist task structure and all technical facts.
