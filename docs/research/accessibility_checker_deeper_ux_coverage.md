# Deeper UX Coverage — interactive-layer audit results

> Scope: this doc covers the **UX/interactive layer** only — what the checker
> detects about focus behavior, keyboard access, dialogs, computed styles and
> click-activated UI. For the static-markup rule inventory see
> `docs/wcag-coverage.md` and the live `GET /rules` manifest (authoritative —
> `test/rules-manifest.test.mjs` asserts it matches every emitted rule).

## How the UX layer works

The string scanner alone cannot see these issues — they only exist at runtime.
Rendered scans call the platform `POST /render`, which drives a real
headless browser (Cloudflare Browser Rendering) and returns trace facts that
`src/rules/focuscycle.js` + `src/scanner.js` turn into findings.

Pipeline: `/scan {url}` → `env.PLATFORM /render` (browser) → facts → ruleset → report.
If the render path is unavailable the scan degrades to a plain fetch + string
rules and reports `rendered:false` — findings are still honest about their
detection layer.

## Verified coverage (all live-tested)

| Criterion | What it catches | Detection |
|---|---|---|
| 2.1.2 No Keyboard Trap | forward-cycle traps, stalls (>=4 presses on one element), backward (Shift+Tab) stalls/cycles, click-activated dialogs with dead Escape + no focusable controls | interactive |
| 2.4.3 Focus Order | focusables never reached in the Tab trace; dialog opens with focus left outside it | interactive |
| 2.4.11 Focus Not Obscured (Min) | focused element fully hidden behind author content (cookie-banner class) | rendered geometry |
| 2.4.12 Focus Not Obscured (Enhanced) | focused element *partially* covered (corner probes, disjoint from 2.4.11) | rendered geometry |
| 2.4.13 Focus Appearance | focused element with no outline/shadow indicator | rendered styles |
| 1.4.11 Non-text Contrast | interactive-component boundary <3:1 vs nearest non-transparent ancestor fill | rendered styles |
| 1.4.12 Text Spacing | content newly clipped under WCAG spacing overrides (delta vs pre-clipped) | rendered |
| 2.5.8 Target Size Min | targets <24px (radio/checkbox/inline-text exemptions) | rendered geometry |
| 2.5.5 Target Size Enhanced | targets 24-43px | rendered geometry |
| 1.4.6 Contrast Enhanced | text contrast <7:1 (AAA tier, beyond AA 4.5:1) | rendered styles |

## Interactive checks, markup layer (no browser needed)

These run on every scan including pasted HTML and crawled pages:

| Criterion | Signal |
|---|---|
| 2.1.2 (static) | inline `onkey*` handler calling `preventDefault()` on Tab; `<dialog open>` with no focusable/dismiss control |
| 2.4.3 (static) | positive `tabindex` (F44) |
| 1.4.13 Content on Hover/Focus | hover/focus content with no Escape-dismiss mechanism (warn-class) |
| 2.5.1 Pointer Gestures | `pointerdown`/`touchstart`+`pointermove` gesture paths with no single-point alternative (warn-class) |

## Render-probe budget (performance contract)

The browser trace is the expensive part of a rendered scan, so it is budgeted:

- **Early exit** when the census finds `focusable === 0` or the forward trace
  hard-stalls >=4 presses (trap signature already established)
- Backtrace exits on `body`, the first forward element, or a completed 2-cycle
- Escape probe merges before-state + in-dialog into one evaluate and skips
  entirely on `body` focus
- `esc()`/trace entries carry the element's census index (`idx:tag#id:text`)
  so same-label siblings don't collapse into false coverage gaps
- Measured: ~2.9s trivial page, ~9-12s typical, ~23-55s worst case (large
  pages with click probes) — see `docs/research/accessibility_checker_performance_optimization.md`

## What this layer cannot detect (honest gap)

- Focus order *intent* vs visual order (reading sequence disputes)
- Trap depth inside shadow DOM with `delegatesFocus` internals
- SPA state machines where a trap only exists after app state changes
- Drag-and-drop alternatives beyond handler heuristics
- Whether hover content that *does* dismiss is readable long enough

## Fixtures

- `trap.html` — real Tab-hijack cycle (flags 2.1.2 + 2.4.3)
- `trap2.html` — click-activated dialogs (flags 2.4.3 + 2.1.2)
- `targets2.html` — undersized + obscured + clipped + faint-focus fixtures
- `partial-obscured.html` — corner-occlusion fixture for 2.4.12
- `nav-a.html`/`nav-b.html` — wayfinding fixtures for 2.4.8

## Status

Live coverage is dynamic by design — this doc mirrors `src/rules/focuscycle.js`
and the `/render` probe list at write time. If the doc and `/rules` disagree,
`/rules` is authoritative.
