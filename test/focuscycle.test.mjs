import test from 'node:test';
import assert from 'node:assert/strict';
import { checkFocusDepth } from '../src/rules/focuscycle.js';

test('empty/missing trace produces no issues (upstream checkFocus owns that)', () => {
  assert.deepEqual(checkFocusDepth([], 5, null), []);
  assert.deepEqual(checkFocusDepth(null, 5, null), []);
});

test('clean page: all focusables visited, no cycle, escape fine → nothing', () => {
  const trace = ['a:home', 'a:docs', 'button:go', 'input:email', 'a:contact', 'a:legal'];
  assert.deepEqual(checkFocusDepth(trace, 6, { inDialog: false, responds: true }), []);
});

test('coverage gap: focusable census exceeds visited count', () => {
  // 24 presses visited 5 distinct elements but the page has 8 focusables
  const trace = [];
  for (let i = 0; i < 24; i++) trace.push(['a', 'b', 'c', 'd', 'e'][i % 5]);
  const issues = checkFocusDepth(trace, 8, null);
  const gap = issues.find((i) => i.rule === 'wcag-2.4.3');
  assert.ok(gap, 'should flag unreachable elements');
  assert.match(gap.message, /3 of 8/);
});

test('coverage guard: short trace on big page is inconclusive, not flagged', () => {
  const trace = ['a', 'b', 'c', 'd']; // only 4 presses, 30 focusables — no verdict
  assert.deepEqual(checkFocusDepth(trace, 30, null).filter((i) => i.rule === 'wcag-2.4.3'), []);
});

test('tail cycle: focus ping-ponging among fewer elements than exist traps', () => {
  // trace ends in a strict [x,y] cycle repeated 3+ times while other elements
  // exist — entries carry the census index prefix (same-label siblings differ)
  const trace = ['0:a:nav', '1:b:link', '4:x:menu', '5:y:item', '4:x:menu', '5:y:item', '4:x:menu', '5:y:item'];
  const issues = checkFocusDepth(trace, 6, null);
  const trap = issues.find((i) => i.rule === 'wcag-2.1.2');
  assert.ok(trap, 'cycle should flag a trap');
  assert.match(trap.message, /2 element\(s\)/);
});

test('same-label siblings count as distinct elements (the false-positive that motivated indices)', () => {
  // five different "Get started" links — labels identical, indices differ
  const trace = ['0:a:Skip', '1:a:Home', '3:a:Get started', '4:a:Get started', '7:a:Get started', '8:a:Get started', '9:a:Get started'];
  // 24 focusables but only 7 presses — inconclusive coverage, no flags
  assert.deepEqual(checkFocusDepth(trace, 24, null), []);
});

test('cycle covering every focusable is just page wrap — not a trap', () => {
  const trace = ['a', 'b', 'a', 'b', 'a', 'b']; // 2 focusables, both in the cycle
  assert.deepEqual(checkFocusDepth(trace, 2, null), []);
});

test('escape probe: focus stuck in dialog with dead Escape is a hard trap', () => {
  const trace = ['a:nav', 'div:modal', 'button:ok', 'button:ok'];
  const issues = checkFocusDepth(trace, 4, { inDialog: true, responds: false });
  assert.ok(issues.find((i) => i.rule === 'wcag-2.1.2' && /Escape/.test(i.message)));
});

test('escape probe: dialog that responds to Escape is fine', () => {
  const trace = ['a:nav', 'div:modal', 'body'];
  const issues = checkFocusDepth(trace, 3, { inDialog: true, responds: true });
  assert.deepEqual(issues.filter((i) => /Escape/.test(i.message)), []);
});

test('undersized pointer targets flag wcag-2.5.8 with measurements', () => {
  const trace = ['0:a:nav', '1:button'];
  const issues = checkFocusDepth(trace, 2, null, {
    undersized: [{ d: '3:button#icon', w: 16, h: 16 }, { d: '7:a#x', w: 12, h: 12 }],
  });
  const t = issues.find((i) => i.rule === 'wcag-2.5.8');
  assert.ok(t, 'undersized targets should flag');
  assert.match(t.message, /2 interactive target/);
  assert.match(t.message, /16×16px/);
});

test('no undersized targets → no 2.5.8 finding', () => {
  const issues = checkFocusDepth(['0:a', '1:b'], 2, null, { undersized: [] });
  assert.deepEqual(issues.filter((i) => i.rule === 'wcag-2.5.8'), []);
});

test('focus obscured by author content flags wcag-2.4.11', () => {
  const trace = ['0:a:nav', '5:a:hidden-link', '6:a:footer'];
  const issues = checkFocusDepth(trace, 3, null, { obscured: ['5:a:hidden-link'] });
  const o = issues.find((i) => i.rule === 'wcag-2.4.11');
  assert.ok(o, 'obscured focus should flag');
  assert.match(o.message, /hidden-link/);
});

test('rendered arg omitted entirely → no geometry findings, rest unchanged', () => {
  const trace = ['0:a', '1:b', '2:c'];
  assert.deepEqual(checkFocusDepth(trace, 3, null), []);
});

test('focused element with no outline or shadow flags wcag-2.4.13', () => {
  const trace = ['0:a:nav', '1:button:go'];
  const issues = checkFocusDepth(trace, 2, null, { noFocusInd: ['1:button:go'] });
  const f = issues.find((i) => i.rule === 'wcag-2.4.13');
  assert.ok(f, 'missing focus indicator should flag');
  assert.match(f.message, /button:go/);
});

test('noFocusInd absent or empty → no 2.4.13 finding', () => {
  const trace = ['0:a', '1:b'];
  assert.deepEqual(checkFocusDepth(trace, 2, null, { noFocusInd: [] }).filter((i) => i.rule === 'wcag-2.4.13'), []);
  assert.deepEqual(checkFocusDepth(trace, 2, null, {}).filter((i) => i.rule === 'wcag-2.4.13'), []);
});

test('low-contrast control boundary flags wcag-1.4.11', () => {
  const trace = ['0:a'];
  const issues = checkFocusDepth(trace, 1, null, {
    nontextContrast: [{ d: 'input#email', ratio: 1.52 }, { d: 'button', ratio: 2.1 }],
  });
  const f = issues.find((i) => i.rule === 'wcag-1.4.11');
  assert.ok(f, 'low-contrast boundary should flag');
  assert.match(f.message, /input#email at 1.52:1/);
});

test('text clipping under spacing overrides flags wcag-1.4.12', () => {
  const trace = ['0:a'];
  const issues = checkFocusDepth(trace, 1, null, {
    spacingClip: ['div#card:Terms and conditions apply…'],
  });
  const f = issues.find((i) => i.rule === 'wcag-1.4.12');
  assert.ok(f, 'spacing-induced clipping should flag');
  assert.match(f.message, /div#card/);
});

test('backward stall mid-order flags wcag-2.1.2 as a Shift+Tab trap', () => {
  const trace = ['0:a:top', '1:a:mid', '2:b:go', '3:c:end'];
  const back = ['3:c:end', '2:b:go', '2:b:go', '2:b:go', '2:b:go', '2:b:go'];
  const issues = checkFocusDepth(trace, 4, null, { backtrace: back });
  const t = issues.find((i) => i.rule === 'wcag-2.1.2' && /Shift\+Tab/.test(i.message));
  assert.ok(t, 'mid-order backward stall should flag');
  assert.match(t.message, /2:b:go/);
});

test('backward stall on the first focused element is the natural boundary — no flag', () => {
  const trace = ['0:a:top', '1:b:two'];
  const back = ['0:a:top', '0:a:top', '0:a:top', '0:a:top', '0:a:top'];
  assert.deepEqual(checkFocusDepth(trace, 2, null, { backtrace: back }).filter((i) => /Shift\+Tab/.test(i.message)), []);
});

test('backward stall on body (browser chrome transition) is not a page trap', () => {
  const trace = ['0:a', '1:b'];
  const back = ['0:a', 'body', 'body', 'body', 'body', 'body'];
  assert.deepEqual(checkFocusDepth(trace, 2, null, { backtrace: back }).filter((i) => /Shift\+Tab/.test(i.message)), []);
});

test('backward stall on the forward endpoint is owned by the forward check', () => {
  const trace = ['0:a', '1:b', '1:b', '1:b', '1:b', '1:b'];
  const back = ['1:b', '1:b', '1:b', '1:b', '1:b'];
  const issues = checkFocusDepth(trace, 3, null, { backtrace: back });
  assert.equal(issues.filter((i) => /Shift\+Tab/.test(i.message)).length, 0);
});

test('backward tail cycle flags a Shift+Tab trap', () => {
  const trace = ['0:a', '1:b', '2:c', '3:d'];
  const back = ['3:d', '1:b', '2:c', '1:b', '2:c', '1:b', '2:c'];
  const issues = checkFocusDepth(trace, 4, null, { backtrace: back });
  assert.ok(issues.some((i) => i.rule === 'wcag-2.1.2' && /retreat/.test(i.message)));
});

test('backward cycle inside the forward cycle does not double-flag the same trap', () => {
  const trace = ['0:a', '1:x', '2:y', '1:x', '2:y', '1:x', '2:y'];
  const back = ['2:y', '1:x', '2:y', '1:x', '2:y', '1:x'];
  const issues = checkFocusDepth(trace, 4, null, { backtrace: back });
  assert.equal(issues.filter((i) => /Shift\+Tab/.test(i.message)).length, 0);
});

test('missing/empty backtrace is inconclusive — no findings', () => {
  const trace = ['0:a', '1:b'];
  assert.deepEqual(checkFocusDepth(trace, 2, null, { backtrace: [] }).filter((i) => /Shift\+Tab/.test(i.message)), []);
  assert.deepEqual(checkFocusDepth(trace, 2, null, {}).filter((i) => /Shift\+Tab/.test(i.message)), []);
});

test('click-opened dialog with focus left outside flags wcag-2.4.3', () => {
  const issues = checkFocusDepth(['0:a', '1:b'], 2, null, {
    clickTraps: [{ trigger: '2:button#open', focusOutside: true, escapeDead: true, noExit: false }],
  });
  const f = issues.find((i) => i.rule === 'wcag-2.4.3' && /button#open/.test(i.message));
  assert.ok(f, 'focus-outside dialog should flag 2.4.3');
});

test('click-opened dialog: focus inside + dead Escape + zero controls is a hard trap', () => {
  const issues = checkFocusDepth(['0:a'], 1, null, {
    clickTraps: [{ trigger: '1:button#m', focusOutside: false, escapeDead: true, noExit: true }],
  });
  const t = issues.find((i) => i.rule === 'wcag-2.1.2' && /exited by keyboard/.test(i.message));
  assert.ok(t, 'dialog with no keyboard exit should flag 2.1.2');
});

test('click-opened dialog with a reachable control is compliant containment — no trap flag', () => {
  const issues = checkFocusDepth(['0:a'], 1, null, {
    clickTraps: [{ trigger: '1:button#m', focusOutside: false, escapeDead: true, noExit: false }],
  });
  assert.deepEqual(issues.filter((i) => i.rule === 'wcag-2.1.2'), []);
});

test('click-opened dialog with live Escape is clean', () => {
  const issues = checkFocusDepth(['0:a'], 1, null, {
    clickTraps: [{ trigger: '1:button#m', focusOutside: false, escapeDead: false, noExit: true }],
  });
  assert.deepEqual(issues.filter((i) => i.rule === 'wcag-2.1.2'), []);
});

test("24–43px targets flag wcag-2.5.5 (AAA band); <24px stays 2.5.8-only", () => {
  const trace = ["a", "b"];
  const mid = checkFocusDepth(trace, 3, null, { undersizedAAA: [{ d: "0:button#go", w: 30, h: 30 }] });
  assert.ok(mid.some((i) => i.rule === "wcag-2.5.5"));
  const small = checkFocusDepth(trace, 3, null, { undersized: [{ d: "0:button#go", w: 12, h: 12 }] });
  assert.ok(small.some((i) => i.rule === "wcag-2.5.8"));
  assert.ok(!small.some((i) => i.rule === "wcag-2.5.5"));
  const clean = checkFocusDepth(trace, 3, null, { undersizedAAA: [] });
  assert.ok(!clean.some((i) => i.rule === "wcag-2.5.5"));
});
