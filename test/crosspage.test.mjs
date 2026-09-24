import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCrossPages } from '../src/rules/crosspage.js';

const nav = (links) => `<nav>${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</nav>`;

test('consistent nav across pages → no issues', () => {
  const n = nav([['/a', 'A'], ['/b', 'B']]);
  const issues = checkCrossPages([
    { url: '/1', html: `${n}<p>x</p>` },
    { url: '/2', html: `${n}<p>y</p>` },
  ]);
  assert.equal(issues.length, 0);
});

test('different nav order → wcag-3.2.3 on the deviant page', () => {
  const n1 = nav([['/a', 'A'], ['/b', 'B']]);
  const n2 = nav([['/b', 'B'], ['/a', 'A']]);
  const issues = checkCrossPages([
    { url: '/1', html: n1 }, { url: '/2', html: n1 }, { url: '/3', html: n2 },
  ]);
  const hits = issues.filter((i) => i.rule === 'wcag-3.2.3');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].url, '/3');
});

test('navs with different link sets but same shared order → no 3.2.3', () => {
  // homepage has in-page anchors the subpages lack — the shared links
  // (/ and /contact) still appear in the same relative order.
  const home = nav([['/', 'Home'], ['#a', 'A'], ['#b', 'B'], ['/contact', 'C']]);
  const sub = nav([['/', 'Home'], ['/docs', 'D'], ['/contact', 'C']]);
  const issues = checkCrossPages([
    { url: '/1', html: home }, { url: '/2', html: sub }, { url: '/3', html: sub },
  ]);
  assert.equal(issues.filter((i) => i.rule === 'wcag-3.2.3').length, 0);
});

test('shared links in flipped order → 3.2.3 on the deviant page', () => {
  const ref = nav([['/', 'Home'], ['/docs', 'D'], ['/contact', 'C']]);
  const bad = nav([['/', 'Home'], ['/x', 'X'], ['/contact', 'C'], ['/docs', 'D']]);
  const issues = checkCrossPages([
    { url: '/1', html: ref }, { url: '/2', html: ref }, { url: '/3', html: bad },
  ]);
  const hits = issues.filter((i) => i.rule === 'wcag-3.2.3');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].url, '/3');
});

test('same href with different labels → wcag-3.2.4', () => {
  const issues = checkCrossPages([
    { url: '/1', html: '<a href="/contact">Contact us</a>' },
    { url: '/2', html: '<a href="/contact">Get in touch</a>' },
  ]);
  const hits = issues.filter((i) => i.rule === 'wcag-3.2.4');
  assert.equal(hits.length, 1);
  assert.match(hits[0].message, /contact/);
});

test('same href same label → clean', () => {
  const issues = checkCrossPages([
    { url: '/1', html: '<a href="/contact">Contact</a>' },
    { url: '/2', html: '<a href="/contact">Contact</a>' },
  ]);
  assert.equal(issues.filter((i) => i.rule === 'wcag-3.2.4').length, 0);
});

test('aria-label is the accessible name — beats differing innerText', () => {
  const issues = checkCrossPages([
    { url: '/1', html: '<a href="/contact" aria-label="Contact support">Contact us</a>' },
    { url: '/2', html: '<a href="/contact" aria-label="Contact support">Get in touch</a>' },
  ]);
  assert.equal(issues.filter((i) => i.rule === 'wcag-3.2.4').length, 0);
});

test('aria-label on one page cannot mask a different label elsewhere', () => {
  const issues = checkCrossPages([
    { url: '/1', html: '<a href="/contact" aria-label="Contact support">Contact us</a>' },
    { url: '/2', html: '<a href="/contact">Get in touch</a>' },
  ]);
  assert.equal(issues.filter((i) => i.rule === 'wcag-3.2.4').length, 1);
});

test('two labels for one target on a single page → 3.2.4', () => {
  const issues = checkCrossPages([
    { url: '/1', html: '<a href="/go">Start</a> <a href="/go">Begin</a>' },
    { url: '/2', html: '<a href="/go">Start</a>' },
  ]);
  assert.equal(issues.filter((i) => i.rule === 'wcag-3.2.4').length, 1);
});

test('single page → no cross-page issues', () => {
  assert.equal(checkCrossPages([{ url: '/1', html: '<a href="/x">X</a>' }]).length, 0);
});

test('pages without navs → no 3.2.3, still checks 3.2.4', () => {
  const issues = checkCrossPages([
    { url: '/1', html: '<a href="/x">X</a>' },
    { url: '/2', html: '<a href="/x">Y</a>' },
  ]);
  assert.equal(issues.filter((i) => i.rule === 'wcag-3.2.3').length, 0);
  assert.equal(issues.filter((i) => i.rule === 'wcag-3.2.4').length, 1);
});

test('role=navigation works without <nav>', () => {
  const navHtml = (order) => `<div role="navigation">${order.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>`;
  const issues = checkCrossPages([
    { url: '/1', html: navHtml([['/a', 'A'], ['/b', 'B']]) },
    { url: '/2', html: navHtml([['/a', 'A'], ['/b', 'B']]) },
    { url: '/3', html: navHtml([['/b', 'B'], ['/a', 'A']]) },
  ]);
  assert.equal(issues.filter((i) => i.rule === 'wcag-3.2.3').length, 1);
});

test('empty/garbage input → no crash, no issues', () => {
  assert.deepEqual(checkCrossPages([]), []);
  assert.deepEqual(checkCrossPages(null), []);
  assert.deepEqual(checkCrossPages([{ url: '/1' }]), []);
});

test('help mechanism missing on one page → wcag-3.2.6', () => {
  const help = '<a href="/contact">Contact us</a>';
  const issues = checkCrossPages([
    { url: '/1', html: `${nav([['/a','A']])}${help}` },
    { url: '/2', html: `${nav([['/a','A']])}${help}` },
    { url: '/3', html: `${nav([['/a','A']])}<p>no help here</p>` },
  ]);
  const hits = issues.filter((i) => i.rule === 'wcag-3.2.6');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].url, '/3');
});

test('help links in different order → wcag-3.2.6', () => {
  const h1 = '<a href="/contact">Contact</a><a href="mailto:x@y.com">Email</a>';
  const h2 = '<a href="mailto:x@y.com">Email</a><a href="/contact">Contact</a>';
  const issues = checkCrossPages([
    { url: '/1', html: h1 }, { url: '/2', html: h1 }, { url: '/3', html: h2 },
  ]);
  const hits = issues.filter((i) => i.rule === 'wcag-3.2.6');
  assert.ok(hits.some((i) => i.url === '/3'));
});

test('consistent help placement → no 3.2.6', () => {
  const help = '<a href="/help">Help</a>';
  const issues = checkCrossPages([
    { url: '/1', html: `${nav([['/a','A']])}${help}` },
    { url: '/2', html: `${nav([['/a','A']])}${help}` },
  ]);
  assert.ok(!issues.some((i) => i.rule === 'wcag-3.2.6'));
});
