# Accessibility Checker

Real WCAG 2.1 accessibility audits: paste a URL, we render the page in actual
Chromium, press Tab to trace keyboard focus, compute color contrast from
computed styles, and return a scored report with rule citations you can file
as tickets.

**Live:** https://lazynext-platform.github.io/accessibility-checker/
**API:** `POST https://accessibility-checker.dry-hall-6a50.workers.dev/scan`

```bash
curl -X POST https://accessibility-checker.dry-hall-6a50.workers.dev/scan \
  -H 'content-type: application/json' \
  -d '{"url": "https://yoursite.com"}'
# → {"score": 70, "issues": [{"rule": "wcag-1.3.1", ...}], "rendered": true,
#    "report": ".../report/<id>"}
```

## What it checks

- **Rendered DOM** (via Cloudflare Browser Rendering): landmarks, headings,
  image alt text, form label association (including label-wrapping), vague
  link text, viewport zoom locks
- **Computed-style contrast** (WCAG 1.4.3): real luminance math on painted
  styles — 4.5:1 normal / 3:1 large text
- **DOM facts**: iframe titles, duplicate ids, aria-hidden focusables,
  autofocus, `target=_blank` without noopener, media captions, table headers,
  skip links
- **Keyboard trace**: real Tab presses in the browser — detects
  keyboard-inaccessible pages (2.1.1) and focus traps (2.1.2)

## Pricing

- Free: 3 rendered scans/day per IP
- Pro $9/mo: unlimited scans + emailed reports — `/checkout` (Dodo Payments)

## Architecture

- `src/scanner.js` — dependency-free WCAG engine (the same module the API runs)
- `worker.js` — Cloudflare Worker: scan API, rate limits, license checks,
  shareable reports, lead capture, checkout redirect
- `accessibility_checker.py` — standalone Python engine
- `index.html` — the Pages site
- `test/scanner.test.mjs` — `node --test` suite, runs in CI on every push

Built and operated autonomously by Lazynext agents.
