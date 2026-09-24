import { test } from "node:test";
import assert from "node:assert/strict";
import { scanAdditionalHtml, checkContrastAAA } from "../src/rules/additional.js";

const rules = (issues) => issues.map((i) => i.rule);

test("empty heading flagged under 2.4.6", () => {
  const out = scanAdditionalHtml('<html><body><h2></h2></body></html>');
  assert.ok(rules(out).includes("wcag-2.4.6"));
});

test("non-empty heading is not flagged", () => {
  const out = scanAdditionalHtml('<html><body><h2>Title</h2></body></html>');
  assert.ok(!rules(out).includes("wcag-2.4.6"));
});

test("aria-label must contain visible text (2.5.3)", () => {
  const bad = scanAdditionalHtml('<a href="/x" aria-label="Buy now">Read more</a>');
  assert.ok(rules(bad).includes("wcag-2.5.3"));
  const good = scanAdditionalHtml('<a href="/x" aria-label="Read more about pricing">Read more</a>');
  assert.ok(!rules(good).includes("wcag-2.5.3"));
});

test("maximum-scale below 2 flagged (1.4.4)", () => {
  const out = scanAdditionalHtml('<meta name="viewport" content="width=device-width, maximum-scale=1.0">');
  assert.ok(rules(out).includes("wcag-1.4.4"));
});

test("non-Latin text without lang flagged once (3.1.2)", () => {
  const out = scanAdditionalHtml('<p>这是中文内容没有语言标记的文本</p>');
  assert.equal(rules(out).filter((r) => r === "wcag-3.1.2").length, 1);
  const ok = scanAdditionalHtml('<p lang="zh">这是中文内容</p>');
  assert.ok(!rules(ok).includes("wcag-3.1.2"));
});

test("status-like region without role/aria-live flagged (4.1.3)", () => {
  const bad = scanAdditionalHtml('<div class="toast-notification">Saved</div>');
  assert.ok(rules(bad).includes("wcag-4.1.3"));
  const good = scanAdditionalHtml('<div class="toast-notification" role="status">Saved</div>');
  assert.ok(!rules(good).includes("wcag-4.1.3"));
});

test("inline outline:none on focusable flagged (2.4.7)", () => {
  const bad = scanAdditionalHtml('<a href="/x" style="outline:none">x</a>');
  assert.ok(rules(bad).includes("wcag-2.4.7"));
});

test("empty input returns no issues", () => {
  assert.deepEqual(scanAdditionalHtml(""), []);
  assert.deepEqual(scanAdditionalHtml(null), []);
});

test("AAA tier flags AA-pass/enhanced-fail contrast only (1.4.6)", () => {
  // #767676 on white ≈ 4.54:1 — passes AA (4.5) but fails enhanced (7)
  const mid = checkContrastAAA([{ color: "#767676", bg: "#ffffff", size: 16, weight: "400", tag: "p", text: "x" }]);
  assert.ok(rules(mid).includes("wcag-1.4.6"));
  // #595959 on white ≈ 7:1 — passes enhanced, no finding
  const good = checkContrastAAA([{ color: "#595959", bg: "#ffffff", size: 16, weight: "400", tag: "p", text: "x" }]);
  assert.equal(good.length, 0);
  // #777777 on white ≈ 4.48:1 — fails AA already; not double-reported here
  const aa = checkContrastAAA([{ color: "#777777", bg: "#ffffff", size: 16, weight: "400", tag: "p", text: "x" }]);
  assert.equal(aa.length, 0);
});

import { scanKeyboardStatics } from "../src/rules/additional.js";

test("inline handler preventDefault on Tab flagged as trap risk", () => {
  const out = scanKeyboardStatics(`<div onkeydown="if(event.keyCode===9) event.preventDefault()">x</div>`);
  assert.ok(rules(out).includes("wcag-2.1.2"));
});

test("key handler without Tab suppression is clean", () => {
  const out = scanKeyboardStatics(`<div onkeydown="if(event.key==='Enter') submit()">x</div>`);
  assert.equal(out.length, 0);
});

test("open dialog with no focusable or dismiss control flagged", () => {
  const out = scanKeyboardStatics(`<dialog open><p>Are you sure?</p></dialog>`);
  assert.ok(rules(out).includes("wcag-2.1.2"));
});

test("open dialog with a close button is clean", () => {
  const out = scanKeyboardStatics(`<dialog open><p>Sure?</p><button>Close</button></dialog>`);
  assert.equal(rules(out).includes("wcag-2.1.2"), false);
});

test("closed dialog is not modal — clean", () => {
  const out = scanKeyboardStatics(`<dialog><p>hidden</p></dialog>`);
  assert.equal(out.length, 0);
});

test("positive tabindex flagged under 2.4.3 (F44)", () => {
  const out = scanKeyboardStatics(`<a href="/x" tabindex="5">link</a>`);
  assert.ok(rules(out).includes("wcag-2.4.3"));
});

test("tabindex 0 and -1 are fine", () => {
  const out = scanKeyboardStatics(`<div tabindex="0"></div><div tabindex="-1"></div>`);
  assert.equal(rules(out).includes("wcag-2.4.3"), false);
});

// --- timing/media/input-purpose statics ------------------------------------

test("meta http-equiv=refresh flags wcag-2.2.1", () => {
  const out = scanAdditionalHtml('<head><meta http-equiv="refresh" content="30"></head>');
  assert.ok(rules(out).includes("wcag-2.2.1"));
});

test("no meta refresh → clean", () => {
  const out = scanAdditionalHtml('<head><meta name="viewport" content="width=device-width"></head>');
  assert.equal(rules(out).includes("wcag-2.2.1"), false);
});

test("autoplaying audio flags wcag-1.4.2", () => {
  const out = scanAdditionalHtml('<audio src="a.mp3" autoplay controls></audio>');
  assert.ok(rules(out).includes("wcag-1.4.2"));
});

test("unmuted autoplaying video flags; muted is clean", () => {
  assert.ok(rules(scanAdditionalHtml('<video src="v.mp4" autoplay></video>')).includes("wcag-1.4.2"));
  assert.equal(rules(scanAdditionalHtml('<video src="v.mp4" autoplay muted></video>')).includes("wcag-1.4.2"), false);
  assert.equal(rules(scanAdditionalHtml('<video src="v.mp4" controls></video>')).includes("wcag-1.4.2"), false);
});

test("marquee flags wcag-2.2.2", () => {
  const out = scanAdditionalHtml('<marquee>news</marquee>');
  assert.ok(rules(out).includes("wcag-2.2.2"));
});

test("personal-data input without autocomplete flags wcag-1.3.5", () => {
  const out = scanAdditionalHtml('<input type="email" name="email">');
  assert.ok(rules(out).includes("wcag-1.3.5"));
  const out2 = scanAdditionalHtml('<input type="text" name="first_name">');
  assert.ok(rules(out2).includes("wcag-1.3.5"));
});

test("autocomplete token satisfies wcag-1.3.5; non-personal inputs skipped", () => {
  assert.equal(rules(scanAdditionalHtml('<input type="email" name="email" autocomplete="email">')).includes("wcag-1.3.5"), false);
  assert.equal(rules(scanAdditionalHtml('<input type="search" name="q">')).includes("wcag-1.3.5"), false);
  assert.equal(rules(scanAdditionalHtml('<input type="text" name="coupon">')).includes("wcag-1.3.5"), false);
});

test("onfocus navigation flagged under 3.2.1", () => {
  const bad = scanAdditionalHtml('<a href="/x" onfocus="window.location.href=\'/y\'">x</a>');
  assert.ok(rules(bad).includes("wcag-3.2.1"));
  const ok = scanAdditionalHtml('<a href="/x" onfocus="this.classList.add(\'hi\')">x</a>');
  assert.ok(!rules(ok).includes("wcag-3.2.1"));
});

test("onchange auto-submit flagged under 3.2.2", () => {
  const bad = scanAdditionalHtml('<select onchange="this.form.submit()"><option>a</option></select>');
  assert.ok(rules(bad).includes("wcag-3.2.2"));
  const jump = scanAdditionalHtml('<select onchange="location=this.value"><option>a</option></select>');
  assert.ok(rules(jump).includes("wcag-3.2.2"));
  const ok = scanAdditionalHtml('<input onchange="console.log(this.value)">');
  assert.ok(!rules(ok).includes("wcag-3.2.2"));
});

test("stylesheet outline suppression flagged under 2.4.7", () => {
  const bad = scanAdditionalHtml('<style>a:focus{outline:none}</style><a href="/x">x</a>');
  assert.ok(rules(bad).includes("wcag-2.4.7"));
  const global = scanAdditionalHtml('<style>button{outline:0}</style><button>x</button>');
  assert.ok(rules(global).includes("wcag-2.4.7"));
  // suppression WITH a replacement indicator is compliant
  const ok = scanAdditionalHtml('<style>a:focus{outline:none;box-shadow:0 0 0 3px #00f}</style><a href="/x">x</a>');
  assert.ok(!rules(ok).includes("wcag-2.4.7"));
});

test("accesskey flagged under 2.1.4", () => {
  const bad = scanAdditionalHtml('<a href="/x" accesskey="s">x</a>');
  assert.ok(rules(bad).includes("wcag-2.1.4"));
  const ok = scanAdditionalHtml('<a href="/x">x</a>');
  assert.ok(!rules(ok).includes("wcag-2.1.4"));
});

test("unguarded single-char key handler flagged; modified shortcut ok", () => {
  const bad = scanAdditionalHtml('<div onkeydown="if(event.key===\'n\')location=\'/next\'">x</div>');
  assert.ok(rules(bad).includes("wcag-2.1.4"));
  const mod = scanAdditionalHtml('<div onkeydown="if(event.ctrlKey&&event.key===\'n\')location=\'/n\'">x</div>');
  assert.ok(!rules(mod).includes("wcag-2.1.4"));
  const inert = scanAdditionalHtml('<div onkeydown="console.log(event.key)">x</div>');
  assert.ok(!rules(inert).includes("wcag-2.1.4"));
});

test("sentence-length img alt flags wcag-1.4.5; short alt does not", () => {
  const bad = scanAdditionalHtml('<img src="banner.png" alt="Our summer sale starts on Monday June first and runs all week">');
  assert.ok(rules(bad).includes("wcag-1.4.5"));
  const ok = scanAdditionalHtml('<img src="logo.png" alt="Lazynext">');
  assert.ok(!rules(ok).includes("wcag-1.4.5"));
});

test("link-heavy page with only nav flags wcag-2.4.5; search or sitemap satisfies", () => {
  const links = Array.from({ length: 20 }, (_, i) => `<a href="/p${i}">p${i}</a>`).join("");
  const bad = scanAdditionalHtml(`<nav>${links}</nav><main>content</main>`);
  assert.ok(rules(bad).includes("wcag-2.4.5"));
  const withSearch = scanAdditionalHtml(`<nav>${links}</nav><input type="search" name="q">`);
  assert.ok(!rules(withSearch).includes("wcag-2.4.5"));
  const withSitemap = scanAdditionalHtml(`<nav>${links}</nav><a href="/sitemap.xml">Sitemap</a>`);
  assert.ok(!rules(withSitemap).includes("wcag-2.4.5"));
  const small = scanAdditionalHtml(`<nav><a href="/a">a</a></nav>`);
  assert.ok(!rules(small).includes("wcag-2.4.5"));
});

test("justified text without hyphenation flags wcag-1.4.8", () => {
  const bad = scanAdditionalHtml('<style>p{text-align:justify}</style><p>x</p>');
  assert.ok(rules(bad).includes("wcag-1.4.8"));
  const ok = scanAdditionalHtml('<style>p{text-align:justify;hyphens:auto}</style><p>x</p>');
  assert.ok(!rules(ok).includes("wcag-1.4.8"));
  const inline = scanAdditionalHtml('<p style="text-align:justify">x</p>');
  assert.ok(rules(inline).includes("wcag-1.4.8"));
});
