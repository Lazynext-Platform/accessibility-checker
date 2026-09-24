import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAGE_HTML } from '../src/page.js';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// The worker serves PAGE_HTML on checker.lazynext.com and to browsers hitting
// GET /. If index.html changes without regenerating (node scripts/sync-page.mjs),
// this test fails — the two surfaces can never silently diverge.
test('src/page.js is in sync with index.html', () => {
  assert.equal(PAGE_HTML, indexHtml);
});
