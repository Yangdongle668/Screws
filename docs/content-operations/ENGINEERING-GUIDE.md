# Engineering guide task prompt

Read PRINCIPLES.md, inventory.json and task-ledger.json, then inspect existing guides, RFQ checklists, technical blogs and relevant commercial pages in full. Identify a missing end-to-end workflow, not merely a missing keyword.

Define the user, starting inputs, desired output, decision gates, responsibilities and acceptance evidence. Build an executable procedure with conditional paths, a reusable checklist or specification table, open questions and release criteria. Explain what the supplier can assess versus what the equipment designer must approve. Link to detailed technical articles rather than duplicating them.

Use hypothetical forms/examples only when clearly labeled. Do not invent acceptance limits, universal process requirements or delivered customer results. Return a guide draft, overlap/gap analysis, baseline IDs/hashes, sources, metadata, relevant links, human review requirements and proposed ledger entry. Use READY_FOR_REVIEW, HOLD or NO_CHANGE. Follow all common principles; never publish directly.

## Search-intent and SEO deliverables

Target the complete decision workflow a buyer is trying to perform: selection, specification, RFQ or acceptance planning. Avoid a new guide if an existing guide already owns that intent. At OUTLINE include seoBrief {primaryKeyword,secondaryKeywords,searchIntent,readerQuestion,competingPaths,coverageDecision,serpURLs,inferredQuestions,observedPAA:[]}. Distinguish observed searches from inferred questions; never invent volume, difficulty or PAA. At DRAFT include seo {title,description,internalLinks:[{path,label}]}. The title must identify the task and outcome; the description must state useful inputs or deliverables. Use executable headings and link to narrower articles, materials and products. Schema is proposed as TechArticle or Article after destination review; do not invent HowTo or FAQ eligibility.
