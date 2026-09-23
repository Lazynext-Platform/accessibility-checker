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
