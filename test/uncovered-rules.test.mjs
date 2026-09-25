import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanHtml, checkFacts } from '../src/scanner.js';
import { scanAdditionalHtml } from '../src/rules/additional.js';

const rules = (issues) => issues.map((i) => i.rule);

// Coverage for emitted rules that previously had no firing tests:
// wcag-3.1.1 (missing lang), wcag-2.4.2 (missing title),
// wcag-3.2.5 (target=_blank without noopener), wcag-1.4.10 (fixed px width).

test('html element without lang flags wcag-3.1.1', () => {
  const issues = scanHtml('<html><head><title>t</title></head><body><p>x</p></body></html>');
  assert.ok(rules(issues).includes('wcag-3.1.1'));
});

test('html element with lang does not flag wcag-3.1.1', () => {
  const issues = scanHtml('<html lang="en"><head><title>t</title></head><body><p>x</p></body></html>');
  assert.ok(!rules(issues).includes('wcag-3.1.1'));
});

test('head without title flags wcag-2.4.2', () => {
  const issues = scanHtml('<html lang="en"><head><meta charset="utf-8"></head><body><p>x</p></body></html>');
  assert.ok(rules(issues).includes('wcag-2.4.2'));
});

test('head with title does not flag wcag-2.4.2', () => {
  const issues = scanHtml('<html lang="en"><head><title>t</title></head><body><p>x</p></body></html>');
  assert.ok(!rules(issues).includes('wcag-2.4.2'));
});

test('target=_blank without noopener flags wcag-3.2.5 via facts', () => {
  const issues = checkFacts({ blankNoopener: 2 });
  assert.ok(rules(issues).includes('wcag-3.2.5'));
});

test('no blankNoopener fact means no wcag-3.2.5', () => {
  const issues = checkFacts({ blankNoopener: 0 });
  assert.ok(!rules(issues).includes('wcag-3.2.5'));
});

test('fixed large pixel width flags wcag-1.4.10', () => {
  const issues = scanAdditionalHtml('<div style="width:1200px">content</div>');
  assert.ok(rules(issues).includes('wcag-1.4.10'));
});

test('small or fluid widths do not flag wcag-1.4.10', () => {
  assert.ok(!rules(scanAdditionalHtml('<div style="width:300px">content</div>')).includes('wcag-1.4.10'));
  assert.ok(!rules(scanAdditionalHtml('<div style="width:100%">content</div>')).includes('wcag-1.4.10'));
});

test('CSS order-breaking signals flag wcag-1.3.2', () => {
  assert.ok(rules(scanAdditionalHtml('<style>.card{order:2}</style><div class="card">x</div>')).includes('wcag-1.3.2'));
  assert.ok(rules(scanAdditionalHtml('<div style="flex-direction: row-reverse">x</div>')).includes('wcag-1.3.2'));
  assert.ok(rules(scanAdditionalHtml('<span style="direction:rtl;unicode-bidi:bidi-override">x</span>')).includes('wcag-1.3.2'));
  assert.ok(rules(scanAdditionalHtml('<p aria-flowto="next">x</p>')).includes('wcag-1.3.2'));
});

test('ordinary CSS does not flag wcag-1.3.2', () => {
  assert.ok(!rules(scanAdditionalHtml('<style>.card{border:1px solid #000; flex-direction: column}</style>')).includes('wcag-1.3.2'));
  assert.ok(!rules(scanAdditionalHtml('<p dir="rtl">مرحبا</p>')).includes('wcag-1.3.2'));
});
