# Performance Optimization — Measured Baseline

Performance analysis for the Accessibility Checker, based on measurements
taken against the live deployment (2026-09-25), not generic recommendations.

## Measured baseline

| Path | Latency | Notes |
|---|---|---|
| `GET /`, `/health`, `/rules` | ~50ms | Static + JSON, edge-served |
| `POST /scan` (pasted HTML) | ~410ms | Pure ruleset — no network |
| `POST /scan` (URL, small page) | ~9s | Rendered scan after fix (was ~48-64s) |
| `POST /scan` (URL, heavy page) | ~30-55s | Deep interactive trace — see below |
| Platform `/kv/get`, `/query` | ~90-130ms | KV + D1 round-trips |
| `/checkout` redirect | ~310ms | Dodo session creation |
| `GET /api/v1/billing/funnel` | ~460ms | Multi-KV aggregate |

Worker bundles: product 218KB, platform 986KB — far under the 10MB limit;
startup is not a bottleneck.

## Where the time actually goes

1. **Ruleset is a rounding error.** `scanHtml` on a 217KB page runs in ~3ms;
   `checkContrast` over ~5k styled nodes ~7ms. String/DOM analysis is not
   worth optimizing.
2. **Browser Rendering dominates rendered scans.** Each keyboard press and
   `page.evaluate` is a websocket round-trip to the managed browser (~0.4-0.6s
   observed). The original trace loop issued 3 RTs per Tab press × 24 presses
   plus a 8-press backtrace and click probes — ~100 RTs ≈ 45-60s even for a
   page with a single link.
3. **Cold browser launches add variance.** A fresh `puppeteer.launch` when the
   Browser Rendering pool is cold costs tens of seconds.

## Fixes applied (2026-09-25)

- **Merged per-Tab evaluates into one** (`readFocusProbe`) — entry label,
  occlusion check (2.4.11) and focus-indicator check (2.4.13) in a single
  round-trip instead of two.
- **Early exits in the forward trace** — the loop breaks once the diagnostic
  signature is established: a ≥4-press stall (the trap signature the rules
  look for) or every focusable element visited (coverage proven). Subset
  cycles can't reach full coverage, so they still get the full 24-press
  window. Same for the Shift+Tab backtrace (break at ≥4-stall).
- **Browser session reuse** — `puppeteer.sessions()` + `connect` to an idle
  session before falling back to `launch(keep_alive: 120s)`; `disconnect()`
  leaves the browser warm for the next request instead of terminating it.

Result: a minimal page renders+probes in ~9s (was 48-64s). Heavy pages
(~50+ focusables) still take 30-55s — comparable to Lighthouse-style
interactive audits, and inherent to pressing Tab across a real page.

## Remaining levers (not yet needed)

- Adaptive trace depth: pages with `focusable > 24` can never satisfy the
  coverage guard — the cap could drop to ~16 presses for cycle-only detection.
- Scan-level caching by URL hash for repeat scans within a TTL window.
- Click-probe sleeps are wall-clock (350ms per trigger) and could shrink
  with a `waitForSelector`-style poll instead of a fixed delay.

## What was explicitly rejected

Recommendations that don't apply to this architecture: code splitting and
tree shaking (single-file worker bundle, no UI bundle to split), CDN ("use a
CDN" — the service already runs on Cloudflare's global edge), New
Relic/Datadog (not in the stack), WebAssembly/WebGL (no compute-bound or
graphics workload), and jQuery/cheerio-style HTML parsing (the scanner runs a
custom ruleset with zero runtime dependencies).
