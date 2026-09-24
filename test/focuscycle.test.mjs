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
