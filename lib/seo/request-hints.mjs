import {splitLocale} from '../i18n/core.mjs';

// Product selection changes the RFQ form state, not the document's language
// identity. Only the canonical form participates in the hreflang cluster.
export function requestCrawlHints(html, requestUrl) {
 const url=new URL(requestUrl);
 if(splitLocale(url.pathname).path!=='/request-a-quote/'||!url.searchParams.has('product'))return html;
 return html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i,head=>head.replace(/<link\b(?=[^>]*\bhreflang\s*=)[^>]*>/gi,''));
}
