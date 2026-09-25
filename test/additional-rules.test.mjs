import { test } from "node:test";
import assert from "node:assert/strict";
import { scanAdditionalHtml, checkContrastAAA, checkUseOfColor } from "../src/rules/additional.js";

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

test("icon-only button/link without a name flags wcag-4.1.2", () => {
  const bad = scanAdditionalHtml('<button><svg viewBox="0 0 8 8"><path d="M0 0h8v8z"/></svg></button>');
  assert.ok(rules(bad).includes("wcag-4.1.2"));
  const named = scanAdditionalHtml('<button aria-label="Close"><svg></svg></button>');
  assert.ok(!rules(named).includes("wcag-4.1.2"));
  const imgAlt = scanAdditionalHtml('<a href="/x"><img src="i.png" alt="Home"></a>');
  assert.ok(!rules(imgAlt).includes("wcag-4.1.2"));
  const svgTitle = scanAdditionalHtml('<button><svg><title>Menu</title></svg></button>');
  assert.ok(!rules(svgTitle).includes("wcag-4.1.2"));
  const text = scanAdditionalHtml('<a href="/x">Docs</a>');
  assert.ok(!rules(text).includes("wcag-4.1.2"));
  const noHref = scanAdditionalHtml('<a name="anchor"></a>');
  assert.ok(!rules(noHref).includes("wcag-4.1.2"));
});

test("device motion listeners flag wcag-2.5.4", () => {
  const bad = scanAdditionalHtml('<script>window.addEventListener("devicemotion", shake);</script>');
  assert.ok(rules(bad).includes("wcag-2.5.4"));
  const ok = scanAdditionalHtml('<script>window.addEventListener("resize", reflow);</script>');
  assert.ok(!rules(ok).includes("wcag-2.5.4"));
});

test("orientation lock flags wcag-1.3.4", () => {
  const bad = scanAdditionalHtml('<script>screen.orientation.lock("portrait");</script>');
  assert.ok(rules(bad).includes("wcag-1.3.4"));
  const mq = scanAdditionalHtml('<style>@media (orientation:landscape){.x{display:block}}</style>');
  assert.ok(!rules(mq).includes("wcag-1.3.4"));
});

test("hover-revealed content without Escape flags wcag-1.4.13", () => {
  const bad = scanAdditionalHtml('<div onmouseover="this.querySelector(\'.tip\').style.display=\'block\'">x</div>');
  assert.ok(rules(bad).includes("wcag-1.4.13"));
  const ok = scanAdditionalHtml('<div onmouseover="this.classList.add(\'x\')" onkeydown="if(event.key===\'Escape\')hide()">x</div>');
  assert.ok(!rules(ok).includes("wcag-1.4.13"));
  const none = scanAdditionalHtml('<p>plain content</p>');
  assert.ok(!rules(none).includes("wcag-1.4.13"));
});

test("down-event navigation flags wcag-2.5.2; visual-only handlers pass", () => {
  const bad = scanAdditionalHtml('<button onmousedown="location.href=\'/buy\'">Buy</button>');
  assert.ok(rules(bad).includes("wcag-2.5.2"));
  const ok = scanAdditionalHtml('<button onmousedown="this.style.background=\'red\'">Press</button>');
  assert.ok(!rules(ok).includes("wcag-2.5.2"));
});

test("non-underlined link below 3:1 vs body text flags wcag-1.4.1", () => {
  const styles = [
    { tag: "p", text: "body text", color: "rgb(20,20,20)", bg: "rgb(255,255,255)", size: 16, weight: "400", td: "none" },
    { tag: "a", text: "learn more", color: "rgb(30,30,30)", bg: "rgb(255,255,255)", size: 16, weight: "400", td: "none", inProse: true },
  ];
  const f = checkUseOfColor(styles).find((i) => i.rule === "wcag-1.4.1");
  assert.ok(f, "color-only prose link should flag");
  // Nav/structural links are out of scope — no inProse flag means skip.
  const navLink = [
    { tag: "p", text: "body", color: "rgb(20,20,20)", bg: "rgb(255,255,255)", size: 16, weight: "400", td: "none" },
    { tag: "a", text: "menu item", color: "rgb(30,30,30)", bg: "rgb(255,255,255)", size: 16, weight: "400", td: "none" },
  ];
  assert.deepEqual(checkUseOfColor(navLink), []);
  const underlined = [
    { tag: "p", text: "body", color: "rgb(20,20,20)", bg: "rgb(255,255,255)", size: 16, weight: "400", td: "none" },
    { tag: "a", text: "docs", color: "rgb(30,30,30)", bg: "rgb(255,255,255)", size: 16, weight: "400", td: "underline", inProse: true },
  ];
  assert.deepEqual(checkUseOfColor(underlined), []);
  const distinct = [
    { tag: "p", text: "body", color: "rgb(15,15,15)", bg: "rgb(255,255,255)", size: 16, weight: "400", td: "none" },
    { tag: "a", text: "docs", color: "rgb(160,160,160)", bg: "rgb(255,255,255)", size: 16, weight: "400", td: "none", inProse: true },
  ];
  assert.deepEqual(checkUseOfColor(distinct), []);
});

test("duplicate ids flag wcag-4.1.1; unique ids pass", () => {
  assert.ok(rules(scanAdditionalHtml('<p id="a"></p><p id="a"></p>')).includes("wcag-4.1.1"));
  assert.ok(!rules(scanAdditionalHtml('<p id="a"></p><p id="b"></p>')).includes("wcag-4.1.1"));
});

test("dangling label/aria references flag wcag-4.1.2; resolving refs pass", () => {
  assert.ok(rules(scanAdditionalHtml('<label for="ghost">Name</label><input id="real">')).includes("wcag-4.1.2"));
  assert.ok(rules(scanAdditionalHtml('<p aria-labelledby="ghost">x</p>')).includes("wcag-4.1.2"));
  assert.ok(!rules(scanAdditionalHtml('<label for="real">Name</label><input id="real">')).includes("wcag-4.1.2"));
});

test("iframe without title flags wcag-4.1.2; titled passes", () => {
  assert.ok(rules(scanAdditionalHtml('<iframe src="x"></iframe>')).includes("wcag-4.1.2"));
  assert.ok(!rules(scanAdditionalHtml('<iframe src="x" title="Map"></iframe>')).includes("wcag-4.1.2"));
});

test("invalid ARIA role flags wcag-4.1.2; valid roles pass", () => {
  assert.ok(rules(scanAdditionalHtml('<div role="buttonn">x</div>')).includes("wcag-4.1.2"));
  assert.ok(!rules(scanAdditionalHtml('<div role="button" tabindex="0">x</div>')).includes("wcag-4.1.2"));
});

test("nested interactive elements flag wcag-4.1.2", () => {
  assert.ok(rules(scanAdditionalHtml('<a href="/x"><button>b</button></a>')).includes("wcag-4.1.2"));
  assert.ok(rules(scanAdditionalHtml('<button><a href="/x">l</a></button>')).includes("wcag-4.1.2"));
  assert.ok(!rules(scanAdditionalHtml('<a href="/x"><span>ok</span></a>')).includes("wcag-4.1.2"));
});

test("aria-hidden focusable flags wcag-4.1.2; hidden non-interactive passes", () => {
  assert.ok(rules(scanAdditionalHtml('<a href="/x" aria-hidden="true">x</a>')).includes("wcag-4.1.2"));
  assert.ok(rules(scanAdditionalHtml('<button aria-hidden="true">b</button>')).includes("wcag-4.1.2"));
  assert.ok(!rules(scanAdditionalHtml('<div aria-hidden="true">decor</div>')).includes("wcag-4.1.2"));
});

test("stray list items and definition terms flag wcag-1.3.1; proper parents pass", () => {
  assert.ok(rules(scanAdditionalHtml('<li>stray</li>')).includes("wcag-1.3.1"));
  assert.ok(rules(scanAdditionalHtml('<dd>stray</dd>')).includes("wcag-1.3.1"));
  assert.ok(!rules(scanAdditionalHtml('<ul><li>ok</li></ul><dl><dt>t</dt><dd>d</dd></dl>')).includes("wcag-1.3.1"));
});

test("fieldset without legend, optgroup without label, table without th flag wcag-1.3.1", () => {
  assert.ok(rules(scanAdditionalHtml('<fieldset><input></fieldset>')).includes("wcag-1.3.1"));
  assert.ok(rules(scanAdditionalHtml('<select><optgroup><option>o</option></optgroup></select>')).includes("wcag-1.3.1"));
  assert.ok(rules(scanAdditionalHtml('<table><tr><td>x</td></tr></table>')).includes("wcag-1.3.1"));
  assert.ok(!rules(scanAdditionalHtml('<fieldset><legend>L</legend><input></fieldset><table><tr><th>h</th></tr></table>')).includes("wcag-1.3.1"));
});

test("deprecated presentational markup flags wcag-1.3.1", () => {
  assert.ok(rules(scanAdditionalHtml('<font color="red">x</font>')).includes("wcag-1.3.1"));
  assert.ok(rules(scanAdditionalHtml('<table cellpadding="4"><tr><td>x</td></tr></table>')).includes("wcag-1.3.1"));
});

test("non-text alternatives flag wcag-1.1.1; alternatives pass", () => {
  assert.ok(rules(scanAdditionalHtml('<input type="image">')).includes("wcag-1.1.1"));
  assert.ok(rules(scanAdditionalHtml('<area href="/x">')).includes("wcag-1.1.1"));
  assert.ok(rules(scanAdditionalHtml('<canvas></canvas>')).includes("wcag-1.1.1"));
  assert.ok(rules(scanAdditionalHtml('<svg role="img"></svg>')).includes("wcag-1.1.1"));
  assert.ok(!rules(scanAdditionalHtml('<input type="image" alt="Search"><canvas>fallback text</canvas><svg role="img"><title>Chart</title></svg>')).includes("wcag-1.1.1"));
});

test("media without captions flags wcag-1.2.1; captioned passes", () => {
  assert.ok(rules(scanAdditionalHtml('<video><source src="v.mp4"></video>')).includes("wcag-1.2.1"));
  assert.ok(rules(scanAdditionalHtml('<audio><source src="a.mp3"></audio>')).includes("wcag-1.2.1"));
  assert.ok(!rules(scanAdditionalHtml('<video><track kind="captions"></video>')).includes("wcag-1.2.1"));
});

test("autofocus flags wcag-3.2.1", () => {
  assert.ok(rules(scanAdditionalHtml('<input autofocus>')).includes("wcag-3.2.1"));
  assert.ok(!rules(scanAdditionalHtml('<input>')).includes("wcag-3.2.1"));
});

test("keyboard-access gaps flag wcag-2.1.1", () => {
  assert.ok(rules(scanAdditionalHtml('<div role="button">x</div>')).includes("wcag-2.1.1"));
  assert.ok(rules(scanAdditionalHtml('<div onclick="go()">x</div>')).includes("wcag-2.1.1"));
  assert.ok(rules(scanAdditionalHtml('<a href="/x" tabindex="-1">t</a>')).includes("wcag-2.1.1"));
  assert.ok(rules(scanAdditionalHtml('<div style="overflow:auto"><pre>code</pre></div>')).includes("wcag-2.1.1"));
  // positive cases
  assert.ok(!rules(scanAdditionalHtml('<div role="button" tabindex="0">x</div>')).includes("wcag-2.1.1"));
  assert.ok(!rules(scanAdditionalHtml('<div tabindex="0" style="overflow:auto"><pre>code</pre></div>')).includes("wcag-2.1.1"));
  assert.ok(!rules(scanAdditionalHtml('<input type="hidden" tabindex="-1">')).includes("wcag-2.1.1"));
});

test("link-mechanics issues flag wcag-2.4.4", () => {
  assert.ok(rules(scanAdditionalHtml('<a href="javascript:void(0)">j</a>')).includes("wcag-2.4.4"));
  assert.ok(rules(scanAdditionalHtml('<a>dead</a>')).includes("wcag-2.4.4"));
  assert.ok(rules(scanAdditionalHtml('<a href="#ghost">g</a>')).includes("wcag-2.4.4"));
  assert.ok(!rules(scanAdditionalHtml('<a href="#real">g</a><p id="real">t</p>')).includes("wcag-2.4.4"));
  assert.ok(!rules(scanAdditionalHtml('<a name="anchor">t</a>')).includes("wcag-2.4.4"));
});

test("blinking content flags wcag-2.3.1", () => {
  assert.ok(rules(scanAdditionalHtml('<blink>!</blink>')).includes("wcag-2.3.1"));
  assert.ok(rules(scanAdditionalHtml('<style>.x{text-decoration:blink}</style><p class="x">y</p>')).includes("wcag-2.3.1"));
  assert.ok(rules(scanAdditionalHtml('<p style="text-decoration:blink">x</p>')).includes("wcag-2.3.1"));
  assert.ok(!rules(scanAdditionalHtml('<p>steady</p>')).includes("wcag-2.3.1"));
});

test("sensory-only instructions flag wcag-1.3.3 (advisory)", () => {
  assert.ok(rules(scanAdditionalHtml('<p>Click the green button to continue</p>')).includes("wcag-1.3.3"));
  assert.ok(rules(scanAdditionalHtml('<p>See the menu on the left</p>')).includes("wcag-1.3.3"));
  assert.ok(!rules(scanAdditionalHtml('<p>Click Submit to continue</p>')).includes("wcag-1.3.3"));
});

test("unassociated label flags wcag-3.3.2; associated passes", () => {
  assert.ok(rules(scanAdditionalHtml('<label>Orphan</label>')).includes("wcag-3.3.2"));
  assert.ok(!rules(scanAdditionalHtml('<label for="x">Name</label><input id="x">')).includes("wcag-3.3.2"));
  assert.ok(!rules(scanAdditionalHtml('<label>Name <input></label>')).includes("wcag-3.3.2"));
});

test("long content without section headings flags wcag-2.4.10 (AAA advisory)", () => {
  const long = `<p>${"word ".repeat(900)}</p>`;
  assert.ok(rules(scanAdditionalHtml(long)).includes("wcag-2.4.10"));
  const withHeadings = `<h2>Section</h2><p>${"word ".repeat(900)}</p>`;
  assert.ok(!rules(scanAdditionalHtml(withHeadings)).includes("wcag-2.4.10"));
  const short = "<p>short</p>";
  assert.ok(!rules(scanAdditionalHtml(short)).includes("wcag-2.4.10"));
});

test("invalid aria-* attribute names flag wcag-4.1.2; valid attrs pass", () => {
  assert.ok(rules(scanAdditionalHtml('<div aria-lable="x">t</div>')).includes("wcag-4.1.2"));
  assert.ok(rules(scanAdditionalHtml('<button aria-popup="true">b</button>')).includes("wcag-4.1.2"));
  assert.ok(!rules(scanAdditionalHtml('<button aria-label="ok" aria-expanded="false">b</button>')).includes("wcag-4.1.2"));
});

test("body aria-hidden flags wcag-4.1.2", () => {
  assert.ok(rules(scanAdditionalHtml('<body aria-hidden="true"><p>x</p></body>')).includes("wcag-4.1.2"));
  assert.ok(!rules(scanAdditionalHtml('<body><p>x</p></body>')).includes("wcag-4.1.2"));
});

test("duplicate unnamed landmarks flag wcag-1.3.1; named or nested pass", () => {
  assert.ok(rules(scanAdditionalHtml('<main><p>a</p></main><main><p>b</p></main>')).includes("wcag-1.3.1"));
  assert.ok(rules(scanAdditionalHtml('<nav><a>x</a></nav><nav><a>y</a></nav>')).includes("wcag-1.3.1"));
  assert.ok(rules(scanAdditionalHtml('<div role="search"></div><div role="search"></div>')).includes("wcag-1.3.1"));
  // named landmarks are distinguishable — no flag
  assert.ok(!rules(scanAdditionalHtml('<nav aria-label="primary"><a>x</a></nav><nav aria-label="secondary"><a>y</a></nav>')).includes("wcag-1.3.1"));
  // article-nested <header> tags aren't banners — no flag
  assert.ok(!rules(scanAdditionalHtml('<article><header>h1</header></article><article><header>h2</header></article>')).includes("wcag-1.3.1"));
});

test("multipoint ongesture* handlers flag wcag-2.5.1", () => {
  assert.ok(rules(scanAdditionalHtml('<div ongesturestart="pinchZoom()">x</div>')).includes("wcag-2.5.1"));
  assert.ok(rules(scanAdditionalHtml('<img src="a.png" ongesturechange="rot()">')).includes("wcag-2.5.1"));
  assert.ok(!rules(scanAdditionalHtml('<div>x</div>')).includes("wcag-2.5.1"));
});

test("pointerdown+pointermove on one element flags wcag-2.5.1; each alone passes", () => {
  assert.ok(rules(scanAdditionalHtml('<div onpointerdown="s()" onpointermove="m()">drag</div>')).includes("wcag-2.5.1"));
  // pointerdown alone is a legitimate click-equivalent; pointermove alone is hover-tracking
  assert.ok(!rules(scanAdditionalHtml('<div onpointerdown="select()">x</div>')).includes("wcag-2.5.1"));
  assert.ok(!rules(scanAdditionalHtml('<div onpointermove="hover()">x</div>')).includes("wcag-2.5.1"));
  // split across elements — not a path gesture on either
  assert.ok(!rules(scanAdditionalHtml('<div onpointerdown="a()"></div><div onpointermove="b()"></div>')).includes("wcag-2.5.1"));
});

test("<abbr> without expansion flags wcag-3.1.4 (AAA)", () => {
  assert.ok(rules(scanAdditionalHtml("<p>The <abbr>WCAG</abbr> standard</p>")).includes("wcag-3.1.4"));
  assert.ok(!rules(scanAdditionalHtml('<p>The <abbr title="Web Content Accessibility Guidelines">WCAG</abbr></p>')).includes("wcag-3.1.4"));
  assert.ok(!rules(scanAdditionalHtml('<p>The <abbr aria-label="Web Content Accessibility Guidelines">WCAG</abbr></p>')).includes("wcag-3.1.4"));
  assert.ok(!rules(scanAdditionalHtml("<p>no abbreviations</p>")).includes("wcag-3.1.4"));
});

test("interactive animation without prefers-reduced-motion flags wcag-2.3.3 (AAA)", () => {
  const animated = "<style>a:hover { transition: all .3s; }</style><a href='/x'>link</a>";
  assert.ok(rules(scanAdditionalHtml(animated)).includes("wcag-2.3.3"));
  // transition without an interaction trigger is fine
  assert.ok(!rules(scanAdditionalHtml("<style>a { transition: all .3s; }</style>")).includes("wcag-2.3.3"));
  // interaction trigger without motion is fine
  assert.ok(!rules(scanAdditionalHtml("<style>a:hover { color: red; }</style>")).includes("wcag-2.3.3"));
  // reduced-motion support present
  assert.ok(!rules(scanAdditionalHtml("<style>a:hover { animation: spin 1s; } @media (prefers-reduced-motion) { a:hover { animation: none; } }</style>")).includes("wcag-2.3.3"));
});

test("alt text that echoes the filename flags wcag-1.1.1; real alts pass", () => {
  // literal image extension in the alt
  assert.ok(rules(scanAdditionalHtml('<img src="/assets/team.jpg" alt="IMG_2045.jpg">')).includes("wcag-1.1.1"));
  // alt equal to src basename (extension stripped)
  assert.ok(rules(scanAdditionalHtml('<img src="/assets/hero-banner.png" alt="hero-banner">')).includes("wcag-1.1.1"));
  // different basename, no extension — a real (if terse) description
  assert.ok(!rules(scanAdditionalHtml('<img src="/assets/hero-banner.png" alt="Launch day keynote">')).includes("wcag-1.1.1"));
  // no alt at all is handled by the missing-alt rule, not this one
  const out = scanAdditionalHtml('<img src="/assets/a.png">');
  assert.ok(!out.some((i) => i.rule === "wcag-1.1.1" && i.message.includes("filename")));
});

test("aria-label on generic elements flags wcag-4.1.2; naming roles pass", () => {
  assert.ok(rules(scanAdditionalHtml('<div aria-label="Menu">x</div>')).includes("wcag-4.1.2"));
  assert.ok(rules(scanAdditionalHtml('<span aria-label="star rating">★</span>')).includes("wcag-4.1.2"));
  assert.ok(rules(scanAdditionalHtml('<p aria-label="Summary">text</p>')).includes("wcag-4.1.2"));
  // naming-capable roles legitimize the label
  assert.ok(!rules(scanAdditionalHtml('<div role="button" aria-label="Close">x</div>')).includes("wcag-4.1.2"));
  assert.ok(!rules(scanAdditionalHtml('<span role="img" aria-label="Warning">⚠</span>')).includes("wcag-4.1.2"));
  assert.ok(!rules(scanAdditionalHtml('<div aria-label="Menu" role="navigation">x</div>')).includes("wcag-4.1.2"));
  // no label — nothing to check
  assert.ok(!rules(scanAdditionalHtml("<div>x</div>")).includes("wcag-4.1.2"));
});

// WCAG 1.2.5 — audio description for prerecorded video (warn-class heuristic)
test("video without descriptions track flagged (1.2.5)", () => {
  const bad = scanAdditionalHtml('<video src="v.mp4"><track kind="captions" src="c.vtt"></video>');
  assert.ok(rules(bad).includes("wcag-1.2.5"));
});
test("descriptions track or muted video not flagged (1.2.5)", () => {
  assert.ok(!rules(scanAdditionalHtml('<video src="v.mp4"><track kind="descriptions" src="d.vtt"></video>')).includes("wcag-1.2.5"));
  assert.ok(!rules(scanAdditionalHtml('<video muted src="v.mp4"></video>')).includes("wcag-1.2.5"));
});

// WCAG 2.4.9 — same link text to different targets is ambiguous (AAA warn-class)
test("identical link text to different hrefs flagged (2.4.9)", () => {
  const bad = scanAdditionalHtml('<a href="/post/1">Read more</a> <a href="/post/2">Read more</a>');
  assert.ok(rules(bad).includes("wcag-2.4.9"));
});
test("same text to same target or query variants not flagged (2.4.9)", () => {
  assert.ok(!rules(scanAdditionalHtml('<a href="/a">Home</a> <a href="/a">Home</a>')).includes("wcag-2.4.9"));
  assert.ok(!rules(scanAdditionalHtml('<a href="/list?page=1">Next</a> <a href="/list?page=2">Next</a>')).includes("wcag-2.4.9"));
  assert.ok(!rules(scanAdditionalHtml('<a href="/a">About us</a> <a href="/b">Contact us</a>')).includes("wcag-2.4.9"));
});
