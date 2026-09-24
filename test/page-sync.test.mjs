import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAGE_HTML } from '../src/page.js';
import { STATIC_FILES } from '../src/static.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const readB64 = (p) => readFileSync(new URL(`../${p}`, import.meta.url)).toString('base64');
const indexHtml = read('index.html');

// The worker serves PAGE_HTML + STATIC_FILES on checker.lazynext.com and to
// browsers hitting GET /. If a repo file changes without regenerating
// (node scripts/sync-page.mjs), this test fails — the embedded bundle can
// never silently diverge from the Pages-deployed copies.
test('src/page.js is in sync with index.html', () => {
  assert.equal(PAGE_HTML, indexHtml);
});

test('src/static.js is in sync with the repo static files', () => {
  for (const [route, sf] of Object.entries(STATIC_FILES)) {
    assert.equal(sf.body, sf.b64 ? readB64(route.slice(1)) : read(route.slice(1)), `${route} drifted`);
  }
});

test('branded-domain canonical link is present in the UI', () => {
  assert.match(indexHtml, /canonical" href="https:\/\/checker\.lazynext\.com/);
});
