# ZUFEK metadata and Schema audit

Source audit, not a search-engine indexing or rich-result validation.

```json
{
  "generatedPages": 811,
  "indexablePages": 780,
  "metadataComplete": 780,
  "uniqueTitlesAndDescriptionsPerLanguage": true,
  "languageAlternates": 7,
  "schemas": {
    "Organization": 780,
    "WebSite": 6,
    "WebPage": 744,
    "BreadcrumbList": 774,
    "CollectionPage": 30,
    "Product": 162,
    "BlogPosting": 288,
    "ProfilePage": 6,
    "TechArticle": 30,
    "FAQPage": 6
  },
  "sitemapSections": 8,
  "sitemapURLs": 780,
  "descriptionOver200": 205
}
```

All indexable baseline pages have unique titles and descriptions within their language, self canonical, seven hreflang alternatives, one H1, Open Graph and Twitter image metadata, a company entity and a page entity. Product pages omit unverified prices, reviews and inventory. Articles include editorial authorship, image, dates and page relationships. Non-content/admin/legal pages remain intentionally noindex.

Descriptions above 200 characters are editorial review candidates, not technical errors: Google has no fixed character requirement and may rewrite snippets. Body word counts in the JSON are descriptive, not a quality score; Chinese text is not whitespace segmented. Content quality, engineering accuracy, language fluency and real evidence require editorial review.

Sitemap index is split into eight topics; public XML is valid crawler input, XML contains only sitemap elements and supported extensions; a separate XSL renders clickable links in compatible browsers; the legacy /sitemap route redirects to the XML index. robots.txt is not authorization. llms.txt is optional and does not guarantee AI citations or ranking.
