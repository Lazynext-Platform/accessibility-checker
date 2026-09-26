Deeper W3C Coverage
====================

### Status of this document (read before generating tasks)

This is a research/planning document. Rule sources live in `src/scanner.js` and
`src/rules/*.js`; the authoritative list of shipped criteria is `GET /rules`
(served by `src/rules/manifest.js`, which is test-enforced to match the code —
`test/rules-manifest.test.mjs` fails if they drift). Do not generate tasks to
"add" criteria listed as shipped here — check `/rules` first.

### Current shipped coverage (all live, all tested)

The scanner runs three analysis layers and reports every finding with a
remediation hint (`src/recommendations.js`) and a Section 508 clause mapping
(`src/rules/section508.js`):

**Static HTML rules** (`scanHtml` / `scanAdditionalHtml` / `scanKeyboardStatics`)
run on every scan path — pasted HTML, fetched pages, and every crawled page:

* 1.1.1 non-text alternatives; 1.2.1 media captions; 1.3.1 structure/landmarks
  (incl. duplicate unnamed landmarks); 1.3.3 sensory characteristics;
  1.3.4 orientation lock; 1.3.5 input purpose (autocomplete); 1.4.1 use of
  color (prose-scoped); 1.4.2/2.2.2 autoplay/marquee/blink; 1.4.4/1.4.8 resize
  and justify; 1.4.5 images of text (heuristic); 1.4.10 fixed-width reflow;
  2.1.1 keyboard (scrollable regions, tabindex -1 on focusables);
  2.1.2 keyboard-trap statics (Tab-swallowing handlers, undismissable dialogs);
  2.1.4 accesskey + single-char shortcuts; 2.2.1 meta refresh; 2.3.1 flashing
  markup; 2.4.1 skip-nav; 2.4.2 title; 2.4.3 positive tabindex;
  2.4.4 link purpose (javascript:/dead/dangling links); 2.4.5 multiple ways;
  2.4.6 headings/labels; 2.4.7 focus outline suppression (inline + stylesheet);
  2.3.3 interactive animation without prefers-reduced-motion (warn-class);
  2.5.1 pointer gestures; 2.5.2 down-event actions; 2.5.3 label-in-name;
  2.5.4 motion actuation; 3.1.1 missing lang; 3.1.2 language of parts;
  3.1.4 abbreviations without expansion (title/aria-label); 3.1.5 reading
  level beyond lower-secondary (Flesch–Kincaid >9 estimate, warn-class);
  3.2.1 onfocus/onchange navigation; 3.2.2 auto-submit select jump-menus;
  3.3.1 error identification (invalid-marked control with no associated
  error text, warn-class); 3.3.2 unlabeled inputs; 3.3.3 error suggestion
  (generic non-corrective error text, warn-class); 3.3.4 error prevention
  for transactional forms (no check/reverse/confirm, warn-class);
  3.3.5 context-sensitive help (3+ field forms with none, warn-class);
  3.3.6 error prevention all forms (AAA warn-class); 3.3.7 redundant entry;
  3.3.8 accessible authentication; 3.3.9 enhanced authentication (CAPTCHA
  markup — no cognitive exemption at AAA); 1.4.7 low/no background audio
  (unmuted <audio> advisory); 1.4.9 images of text no-exception (non-logo
  image-of-text); 2.2.4 interruptions (meta refresh + modal
  alert/confirm/prompt); 2.3.2 three flashes AAA (flashing markup banned
  outright); 4.1.1 duplicate ids; 4.1.2 name/role/value (invalid aria
  names, body aria-hidden, icon-only controls, aria-hidden focusables);
  4.1.3 status regions; plus dangling label/aria references, nested
  interactives, stray list/dl/table structure, deprecated presentational markup.

**Rendered checks** (real browser via Browser Rendering — computed styles,
layout boxes, and a live keyboard trace: 24 Tab presses + focusable census +
Escape probe):

* 1.4.3 contrast AA; 1.4.6 contrast AAA; 1.4.11 non-text contrast;
  1.4.12 text-spacing clipping; 1.4.13 hover/focus content;
  2.1.2 keyboard traps — dynamic (focus stall, tail cycles, dialogs that
  ignore Escape — verified live against `test/trap.html` / `/trap.html`);
  2.4.3 focus coverage gaps; 2.4.11 focus-not-obscured; 2.4.13 focus
  appearance; 2.5.7 dragging; 2.5.8 target size (AA 24px); 2.5.5 enhanced
  target size (AAA 44px — the 24–43px band reported separately from AA
  failures).

**Cross-page checks** (`site:true` scans, `src/rules/crosspage.js`):

* 3.2.3 consistent navigation; 3.2.4 consistent identification (accessible
  names, aria-aware); 3.2.6 consistent help.

### Genuinely remaining criteria — and why they're not shipped

The rest of WCAG 2.x is not statically/rendered-detectable without either
media-content analysis or human judgment. These are the honest remaining
frontier, grouped by why they're hard:

* **Media-content semantics** — 1.2.3/1.2.5 audio descriptions, 1.2.6 sign
  language, 1.2.7 extended audio description, 1.2.8/1.2.9 media alternatives.
  A `track kind="descriptions"` presence check is feasible but only proves
  the track exists, not that it describes anything (1.2.5/1.4.7 ship as
  presence/advisory warns for the same reason).
* **AAA-level criteria** — 2.1.3 (partially shipped via the scrollable-region
  leg), 2.2.3/2.2.5/2.2.6 timeouts/re-authentication (need session behaviour),
  2.4.12 (partially shipped), 2.5.6 concurrent input modalities, 1.3.6
  identify purpose (needs personalization semantics), 3.1.3 unusual words /
  3.1.6 pronunciation (need language judgment). Several are partially
  covered by shipped AA rules (3.3.8 ⊂ 3.3.9, 2.4.11 ⊂ 2.4.12/13);
  2.5.5, 3.1.4, 3.1.5, 1.4.7, 1.4.9, 2.3.2, 3.3.1/3.3.3–3.3.6/3.3.9 now ship
  as bounded warn-class versions — the full AAA forms need deeper analysis.
* **Judgment-required** — meaningful sequence under unusual layouts, help
  quality, cognitive accessibility. Static analysis can flag absence of
  patterns, not quality (3.3.x ship as pattern-absence warns).

### Deliberately not done (architecture decisions, not gaps)

* **axe-core integration** — possible but the product is dependency-free by
  design (single-file ES module, zero npm deps). axe-core is the industry
  standard; adopting it is a product/architecture decision, not a task.
* **"W3C validation service" calls** — the Nu Html Checker is a validator, not
  an accessibility evaluator; it would duplicate 4.1.1-class checks we already
  do internally. No external validation dependency is planned.
