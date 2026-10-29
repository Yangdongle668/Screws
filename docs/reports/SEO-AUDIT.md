# ZUFEK metadata and Schema audit

Source audit, not a search-engine indexing or rich-result validation.

```json
{
  "generatedPages": 727,
  "indexablePages": 696,
  "metadataComplete": 696,
  "uniqueTitlesAndDescriptionsPerLanguage": true,
  "languageAlternates": 7,
  "schemas": {
    "Organization": 696,
    "WebSite": 6,
    "WebPage": 666,
    "BreadcrumbList": 690,
    "CollectionPage": 24,
    "Product": 162,
    "BlogPosting": 252,
    "ProfilePage": 6
  },
  "sitemapSections": 8,
  "sitemapURLs": 696,
  "descriptionOver200": 192
}
```

All indexable baseline pages have unique titles and descriptions within their language, self canonical, seven hreflang alternatives, one H1, Open Graph and Twitter image metadata, a company entity and a page entity. Product pages omit unverified prices, reviews and inventory. Articles include editorial authorship, image, dates and page relationships. Non-content/admin/legal pages remain intentionally noindex.

Descriptions above 200 characters are editorial review candidates, not technical errors: Google has no fixed character requirement and may rewrite snippets. Body word counts in the JSON are descriptive, not a quality score; Chinese text is not whitespace segmented. Content quality, engineering accuracy, language fluency and real evidence require editorial review.

Sitemap index is split into eight topics; public XML is valid crawler input, /sitemap is the readable directory. robots.txt is not authorization. llms.txt is optional and does not guarantee AI citations or ranking.
