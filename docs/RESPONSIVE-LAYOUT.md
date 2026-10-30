# Responsive layout maintenance

Updated 2026-10-30. Shared rules live in `public/responsive.css`, loaded after the original design stylesheet by the page generator. This preserves the existing brand and desktop design while correcting intrinsic grid sizing and mobile typography.

- Homepage uses shrinkable grid tracks and fluid mobile headings; long localized labels cannot widen cards.
- Navigation collapses at 1100px, including tablets. The resource submenu becomes an in-flow accordion; navigation scrolls within the available viewport. Fine-pointer hover is limited to desktop navigation.
- Public tables receive keyboard-focusable, named scrolling regions at generation time. Table markup and content remain intact. Horizontal scrolling is local to the table rather than the whole document.
- Mobile forms use 16px input text, single-column fields, and no floating inquiry dock on the inquiry page. Contact controls respect safe-area insets. Images preserve their proportions.
- No global overflow hiding is used to conceal broken layouts.

## Browser verification

Browser viewport checks covered 320, 390, 768, 844 (landscape), 1024, 1440 and 1920 CSS pixels. Representative pages included home, product listing/detail, industries, materials, processes, technical blog, long industry articles, application studies, FAQ, privacy and inquiry forms. All six language homepages and additional German product/material and French inquiry pages were sampled.

The initial wider sweep identified a German card intrinsic-width defect. After correcting it, a second matrix of 55 page/viewport combinations passed with document scroll width equal to document client width. Phone navigation expansion, resource accordion, inquiry dock suppression, and independent keyboard-focusable material table scrolling were also checked.

These are browser viewport tests, not a claim that every physical device, mobile browser or operating system has been tested. Recheck representative layouts when changing long headings, navigation items, cards or tables. Maintain the ability to zoom and do not add fixed body widths or blanket horizontal-overflow clipping.
