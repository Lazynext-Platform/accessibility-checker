# Accessibility Checker — Launch Kit

## What it is
Paste a URL, get a real WCAG 2.1 report in ~5 seconds. We render your page in
actual Chromium, trace keyboard focus with real Tab presses, and compute color
contrast from computed styles — not just static HTML guesses.

## Live
- Site: https://lazynext-platform.github.io/accessibility-checker/
- API:  https://accessibility-checker.dry-hall-6a50.workers.dev
        POST /scan {"url": "https://yoursite.com"}

## What we check
- Rendered DOM: landmarks, headings, alt text, form labels, ARIA, duplicate ids,
  iframe titles, media captions, table headers, skip links
- Real keyboard test: we press Tab 10 times in a live browser and detect
  keyboard traps (WCAG 2.1.2) and keyboard-inaccessible pages (2.1.1)
- Computed-style contrast: WCAG 1.4.3 ratios (4.5:1 / 3:1 large) on what the
  browser actually painted, including CSS-colored text

## Pricing
- Free: 3 rendered scans/day
- Pro $9/mo: unlimited scans, priority queue — /checkout

## Positioning
axe-core and Lighthouse run static checks or a bundled headless pass. We run a
real browser against your real URL and report rule IDs you can cite in a ticket.
No install, no signup for free scans.

## Launch channels
1. Show HN: "I built an accessibility checker that presses Tab for you"
2. r/webdev, r/accessibility — post a scan of a popular site, report findings
3. Product Hunt: "Accessibility Checker — rendered-page WCAG audits with real
   keyboard-trap detection"
4. Dev.to article: how computed-style contrast beats stylesheet parsing

## Email copy (Brevo)
Subject: Your site has a keyboard trap — we can prove it
Hi — we just scanned {{site}} in a real browser. Score: {{score}}/100.
{{top_issue}}. Full report: {{report_url}}. 3 free scans a day, no signup.
