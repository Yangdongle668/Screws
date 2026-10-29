# Product and process illustration coverage

37 distinct AI-generated images are assigned by slug to 27 product families and 10 manufacturing topics. Every image has a full-width WebP and smaller responsive version. All 74 responsive files together are approximately 2.5 MB. The same family image is reused only in relevant overview cards, its own detail page and related editorial material.

## Files and provenance
- Web assets: `public/images/` and mirrored `static-site/images/`.
- Original generated PNG files: ignored `outputs/generated-images/`; original image-generator output remains in the Codex generated-images folder.
- Per-image geometry/operation briefs: `scripts/image-briefs.json`.
- Built-in image_gen prompt set: `scripts/image-generation-prompts.json`.
- Descriptive alt text and deterministic page mapping: `scripts/image-library.mjs`.
- Asset manifest: `public/images/manifest.json`.
- User-facing review index: `/resources/visual-library/` (noindex).

## Meaning of accuracy
Images are visually reviewed for representative category identity: head/drive, shoulder/thread arrangement, hole orientation, retained components, and process/tool contact. They are not dimensionally verified CAD, actual supplied part photographs, actual factory photographs or evidence of a process capability. Labels on collection pages and detail-image captions make that distinction visible.

The special-thread image was revised to show clear longitudinal cross-section profiles after the initial shaft visualization had ambiguous helices. Product dimensions, exact thread standards, pin positions, fit and factory equipment require original drawings, CAD or actual photography to establish exact correspondence.

## Checks
`node scripts/verify-images.mjs` checks 37 unique image hashes, 74 responsive files, correct detail-page mapping, existing image references, alt text, explicit image dimensions and illustration disclosure. Product images and all 10 process illustrations were visually reviewed in contact sheets; selected critical structures were also inspected individually.

Public page output remains complete static HTML with clean URLs. Forms and protected management functionality are unchanged.
