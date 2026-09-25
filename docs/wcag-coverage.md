# WCAG Coverage Reference

56 success criteria implemented across three detection layers. This document
is the authoritative map: each rule, its WCAG level/version, the detection
layer that evaluates it, and what it flags. Live source: `GET /rules`.

Layers: **static** = string-scan of fetched HTML (every scan), **rendered** =
Browser Rendering trace (contrast census, focus cycle, target measurements),
**crosspage** = multi-page consistency (site scans only).

## Static layer (37 criteria)

| Criterion | Level | WCAG | What it flags |
|---|---|---|---|
| wcag-1.1.1 — Non-text Content | A | 2.0 | img/area/image-input/embed/svg/canvas/object missing alt, title, or fallback text |
| wcag-1.3.1 — Info and Relationships | A | 2.0 | heading skips/no <h1>/no headings, missing <main> landmark, stray <li>/<dt>/<dd>, <fieldset> w/o <legend>, <optgroup> w/o label, tables w/o <th>, duplicate landmarks |
| wcag-1.3.3 — Sensory Characteristics | A | 2.0 | instructions relying on position/shape/sound alone (e.g. 'the menu on the left') |
| wcag-1.3.4 — Orientation | AA | 2.1 | CSS locking orientation (orientation: media query w/o fallback) |
| wcag-1.3.5 — Identify Input Purpose | AA | 2.1 | personal-data fields (email/name/tel/etc.) missing autocomplete |
| wcag-1.4.10 — Reflow | AA | 2.1 | fixed pixel widths on content containers that prevent reflow at 320px |
| wcag-1.4.13 — Content on Hover or Focus | AAA | 2.1 | title-attr/popup content with no dismiss mechanism (warn-class heuristic) |
| wcag-1.4.2 — Audio Control | A | 2.0 | autoplaying <audio>/<video> (unmuted) without pause/stop controls |
| wcag-1.4.4 — Resize Text | AA | 2.0 | viewport user-scalable=no or maximum-scale < 2 |
| wcag-1.4.5 — Images of Text | AA | 2.0 | images whose alt text suggests they carry significant text (heuristic) |
| wcag-1.4.8 — Visual Presentation | AAA | 2.0 | text-align: justify without hyphenation support |
| wcag-2.1.4 — Character Key Shortcuts | A | 2.1 | accesskey attributes / single-character key handlers with no remapping or off switch |
| wcag-2.2.1 — Timing Adjustable | A | 2.0 | <meta http-equiv=refresh> timed reload/redirect |
| wcag-2.2.2 — Pause, Stop, Hide | A | 2.0 | <marquee> and auto-moving content with no pause control |
| wcag-2.3.1 — Three Flashes | A | 2.0 | <blink> / text-decoration:blink flashing content |
| wcag-2.3.3 — Animation from Interactions | AAA | 2.1 | transition/animation on :hover/:focus/:active with no prefers-reduced-motion support (warn-class, inline <style> only) |
| wcag-2.4.10 — Section Headings | AAA | 2.0 | long text content organized without headings |
| wcag-2.4.2 — Page Titled | A | 2.0 | missing or empty <title> |
| wcag-2.4.4 — Link Purpose (In Context) | A | 2.0 | vague link text ('click here'), javascript:/dead '#'-only links, dangling fragment targets |
| wcag-2.4.5 — Multiple Ways | AA | 2.0 | sites offering only one way to find pages (no search/sitemap/consistent nav) |
| wcag-2.4.6 — Headings and Labels | AA | 2.0 | empty headings, empty <label> wrapping no control |
| wcag-2.4.7 — Focus Visible | AA | 2.0 | inline or stylesheet outline:none/0 without a :focus-visible replacement |
| wcag-2.5.1 — Pointer Gestures | A | 2.1 | multipoint/path-based gesture handlers (pointerdown+pointermove, ongesture*) with no single-pointer equivalent |
| wcag-2.5.2 — Pointer Cancellation | A | 2.1 | actions firing on the down-event (mousedown/touchstart navigate/submit) with no way to abort |
| wcag-2.5.3 — Label in Name | A | 2.1 | aria-label that doesn't contain the control's visible text |
| wcag-2.5.4 — Motion Actuation | A | 2.1 | deviceorientation/devicemotion handlers driving functionality with no equivalent control |
| wcag-2.5.7 — Dragging Movements | AA | 2.2 | draggable elements / drag-event handlers with no single-pointer alternative |
| wcag-3.1.1 — Language of Page | A | 2.0 | <html> missing lang |
| wcag-3.1.2 — Language of Parts | AA | 2.0 | content in a different language than the page without a lang attribute |
| wcag-3.1.4 — Abbreviations | AAA | 2.0 | <abbr> without title/aria-label — no expanded-form mechanism |
| wcag-3.2.1 — On Focus | A | 2.0 | autofocus and onfocus handlers that navigate/submit/click |
| wcag-3.2.2 — On Input | A | 2.0 | onchange/oninput auto-submission and select jump-menus |
| wcag-3.3.2 — Labels or Instructions | A | 2.0 | inputs without label/aria-label/aria-labelledby (placeholders don't count) |
| wcag-3.3.7 — Redundant Entry | A | 2.2 | same information requested twice in one form (duplicate fields) |
| wcag-3.3.8 — Accessible Authentication (Minimum) | AA | 2.2 | password fields blocking paste or missing autocomplete, forcing cognitive recall |
| wcag-4.1.2 — Name, Role, Value | A | 2.0 | icon-only controls with no accessible name, iframes w/o title, invalid aria-* names, aria-hidden on <body> or focusable content, nested interactive elements |
| wcag-4.1.3 — Status Messages | AA | 2.1 | status/alert regions without role=status/alert or aria-live |

## Rendered layer (16 criteria)

| Criterion | Level | WCAG | What it flags |
|---|---|---|---|
| wcag-1.2.1 — Audio-only and Video-only (Prerecorded) | A | 2.0 | <video>/<audio> elements without captions or a text alternative |
| wcag-1.4.1 — Use of Color | A | 2.0 | links inside prose distinguished by color alone (<3:1 vs body text, no underline) |
| wcag-1.4.11 — Non-text Contrast | AA | 2.1 | control boundaries/states below 3:1 against adjacent colors |
| wcag-1.4.12 — Text Spacing | AA | 2.1 | content clipped when WCAG text-spacing metrics are applied |
| wcag-1.4.3 — Contrast (Minimum) | AA | 2.0 | text below 4.5:1 contrast ratio (3:1 large text) |
| wcag-1.4.6 — Contrast (Enhanced) | AAA | 2.0 | text below 7:1 contrast ratio — reported separately from AA failures |
| wcag-2.1.1 — Keyboard | A | 2.0 | no focusable elements, unreachable focusables, tabindex=-1 on natively focusable elements, scrollable regions not keyboard-reachable |
| wcag-2.1.2 — No Keyboard Trap | A | 2.0 | Tab-swallowing keydown handlers, undismissable dialogs, focus stall/cycle in a real 24-press Tab trace, Escape ignored inside dialogs |
| wcag-2.4.1 — Bypass Blocks | A | 2.0 | no skip-navigation link to main content |
| wcag-2.4.11 — Focus Not Obscured (Minimum) | AA | 2.2 | focused element covered by sticky/fixed overlays at its scroll position |
| wcag-2.4.13 — Focus Appearance | AAA | 2.2 | focus indicator absent or below size/contrast thresholds in the live trace |
| wcag-2.4.3 — Focus Order | A | 2.0 | positive tabindex, focusables Tab never reaches, focus entering regions it can't exit |
| wcag-2.5.5 — Target Size (Enhanced) | AAA | 2.1 | interactive targets in the 24–43px band — pass AA but miss the AAA 44×44 minimum |
| wcag-2.5.8 — Target Size (Minimum) | AA | 2.2 | interactive targets under 24×24 CSS px (exempting inline-text links and UA-default controls) |
| wcag-3.2.5 — Change on Request | AAA | 2.0 | target=_blank links without rel=noopener (context changes users can't control) |
| wcag-4.1.1 — Parsing | A | 2.0 | duplicate id attributes |

## Crosspage layer (3 criteria)

| Criterion | Level | WCAG | What it flags |
|---|---|---|---|
| wcag-3.2.3 — Consistent Navigation | AA | 2.0 | shared nav links appearing in different relative order across pages |
| wcag-3.2.4 — Consistent Identification | AA | 2.0 | same link target carrying different accessible names on different pages |
| wcag-3.2.6 — Consistent Help | A | 2.2 | help mechanisms missing on some pages or appearing in inconsistent order |
