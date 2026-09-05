# Expresiv design and implementation review

Updated 5 September 2026.

## Direction

“Ideas, fully expressed.” A typographic identity pairs tightly set sans-serif headlines with italic serif accents. Open frames connect the homepage, project images and brand icon. Lime serves as the primary expression colour; project colours come from the supplied portfolio artwork.

The homepage now leads into real project work. Three project stories describe the available scope and design rationale. Beauty & Nails is explicitly presented as a visual design study. No performance outcomes, client quotes, awards or numerical business results have been invented.

## Implemented

- Home, Work, Expertise, Studio and Contact share one independent layout.
- Three service detail pages and three project stories extend that layout.
- The 404 page provides a clear route back to the homepage.
- Mobile navigation uses native details/summary, with Escape handling and an outside-click dismissal.
- Work filters progressively enhance the complete portfolio. Buttons expose their selected state and announce the result count.
- Motion uses finite entrance effects, small hover transitions and native cross-document transitions where supported. No scroll hijacking or autoplay is used. Reduced-motion preferences disable animations and transitions.
- Images reserve layout space, have descriptive alternative text and use WebP files. Below-fold project images load lazily.
- Primary pages are prerendered. The existing Node API remains available for enquiries.
- Agency pages use their own stylesheet and do not load the legacy Tailwind utility bundle, web fonts, React runtime or Astro client router. Legacy layouts explicitly retain their Tailwind stylesheet.
- The enquiry form preserves the existing API, includes labelled fields, a live status, pending state, request timeout and error recovery. Real email delivery was not tested.

## Completed checks

`npm run build` passes.

`node scripts/check-agency.mjs` passes for 12 generated routes, 232 link instances and 9 image references. It checks local destinations, unique page titles, descriptions, canonical URLs, main landmarks, h1 counts, duplicate IDs, image dimensions, image files, accessible link names, form labels and the enquiry endpoint.

Four used project assets total 75,922 bytes versus 534,497 bytes for the originals, an 86% reduction. Shared agency CSS is approximately 4.8 KB compressed. Page-owned scripts plus inline script text are approximately 0.7–1.2 KB compressed. These are local artifact measurements; they exclude external analytics downloads and do not establish real-world Core Web Vitals.

## Still to verify

Automatic approval review blocked the Chrome testing tool because of an account usage limit. No alternate browser automation was used to bypass that restriction.

The following remain pending: visual inspection at desktop and mobile widths, 200% zoom, keyboard navigation, work filtering, contact success/error flows using intercepted responses, a browser accessibility audit, and measured browser performance/Core Web Vitals. Structural HTML checks do not replace those tests.

The private local preview is running at http://127.0.0.1:4321/. Production publication and an award submission have not been performed. An award cannot be guaranteed by implementation or automated scores.
