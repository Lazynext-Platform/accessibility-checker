# Accessibility Checker

Real WCAG 2.1 accessibility audits: paste a URL, we render the page in actual
Chromium, press Tab to trace keyboard focus, compute color contrast from
computed styles, and return a scored report with rule citations you can file
as tickets.

**Live:** https://lazynext-platform.github.io/accessibility-checker/
**API:** `https://accessibility-checker.dry-hall-6a50.workers.dev`

```bash
curl -X POST https://accessibility-checker.dry-hall-6a50.workers.dev/scan \
  -H 'content-type: application/json' \
  -d '{"url": "https://yoursite.com", "license": "you@example.com", "email_report": true}'
# → {"score": 70, "issues": [{"rule": "wcag-1.3.1", ...}], "rendered": true,
#    "report": ".../report/<id>"}
```

Endpoints: `POST /scan` (html or url), `GET /checkout` (trial → paid),
`POST /cancel` (self-service cancellation by purchase email),
`POST /lead` (email capture), `GET /report/:id` (shareable report),
`GET /health`.

## What it checks

- **Rendered DOM** (via Cloudflare Browser Rendering): landmarks, headings,
  image alt text, form label association (including label-wrapping), vague
  link text, viewport zoom locks
- **Computed-style contrast** (WCAG 1.4.3 + 1.4.6): real luminance math on
  painted styles — 4.5:1 normal / 3:1 large text, plus the 7:1 enhanced tier
- **Additional rules** (`src/rules/additional.js`): heading content (2.4.6),
  label-in-name (2.5.3), viewport max-scale (1.4.4), text spacing overrides
  (1.4.10), language-of-parts (3.1.2), status messages (4.1.3), focus
  visibility (2.4.7)
- **DOM facts**: iframe titles, duplicate ids, aria-hidden focusables,
  autofocus, `target=_blank` without noopener, media captions, table headers,
  skip links
- **Keyboard trace**: real Tab presses in the browser — detects
  keyboard-inaccessible pages (2.1.1) and focus traps (2.1.2)

## Pricing

- Free: 3 rendered scans/day per IP
- Pro $9/mo: unlimited scans + emailed reports — `/checkout` (Dodo Payments)
  - **14-day free trial**: card collected up front, auto-converts at day 14;
    cancel any time via `POST /cancel` or the site's cancel link
  - Trial-expiry reminder emailed at day 11

## Architecture

- `src/scanner.js` — dependency-free WCAG engine (the same module the API runs)
- `src/rules/additional.js` — 8 more WCAG checks, wired into all scan paths
- `worker.js` — Cloudflare Worker: scan API, rate limits, license checks,
  shareable reports, lead capture, trial checkout, self-service cancel,
  emailed Pro reports
- `accessibility_checker.py` — standalone Python engine
- `index.html` — the Pages site (scan UI, trial CTA, cancel, email-report opt-in,
  402 lead funnel)
- `test/scanner.test.mjs` + `test/additional-rules.test.mjs` — `node --test`
  suite, runs in CI on every push

Built and operated autonomously by Lazynext agents.
