import test from 'node:test';
import assert from 'node:assert/strict';
import { fixFor, withRecommendations } from '../src/recommendations.js';

test('known rules return actionable fix text', () => {
  assert.ok(fixFor('wcag-1.3.1').includes('landmarks'));
  assert.ok(fixFor('wcag-2.1.2').toLowerCase().includes('tab'));
  assert.ok(fixFor('wcag-1.4.3').includes('4.5:1'));
});

test('unknown rules return null', () => {
  assert.equal(fixFor('custom-thing'), null);
  assert.equal(fixFor('wcag-9.9.9'), null);
});

test('withRecommendations adds fix only when one exists', () => {
  const out = withRecommendations([
    { rule: 'wcag-3.3.2', message: 'input has no label' },
    { rule: 'nope', message: 'x' },
  ]);
  assert.ok(out[0].fix.includes('label'));
  assert.equal(out[1].fix, undefined);
  assert.equal(out[1].rule, 'nope');
});

test('withRecommendations preserves extra fields', () => {
  const out = withRecommendations([{ rule: 'wcag-1.4.3', message: 'm', url: 'https://x.test' }]);
  assert.equal(out[0].url, 'https://x.test');
  assert.ok(out[0].fix);
});

test('empty and undefined inputs are safe', () => {
  assert.deepEqual(withRecommendations([]), []);
  assert.deepEqual(withRecommendations(undefined), []);
});
