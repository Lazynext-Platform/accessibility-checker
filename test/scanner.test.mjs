import { test } from 'node:test';
import { scanner } from '../src/scanner.js';
import { aiScanner } from '../src/ai_scanner.js';
import { JSDOM } from 'jsdom';

test('scanner should return an object with accessibility issues', async (t) => {
  const dom = new JSDOM('<html><body><h1>Heading</h1><p>Paragraph</p></body></html>');
  const issues = await scanner(dom.window.document);
  t.ok(issues, 'issues should be an object');
  t.ok(issues.heading, 'issues should have a heading property');
  t.ok(issues.paragraph, 'issues should have a paragraph property');
});

test('scanner should return an object with no accessibility issues for valid html', async (t) => {
  const dom = new JSDOM('<html><body><h1>Heading</h1><p>Paragraph</p><img src="image.jpg" alt="Image"></body></html>');
  const issues = await scanner(dom.window.document);
  t.ok(issues, 'issues should be an object');
  t.equal(issues.heading, null, 'heading should be null');
  t.equal(issues.paragraph, null, 'paragraph should be null');
  t.equal(issues.image, null, 'image should be null');
});

test('aiScanner should return an object with accessibility issues', async (t) => {
  const dom = new JSDOM('<html><body><h1>Heading</h1><p>Paragraph</p></body></html>');
  const issues = await aiScanner(dom.window.document);
  t.ok(issues, 'issues should be an object');
  t.ok(issues.heading, 'issues should have a heading property');
  t.ok(issues.paragraph, 'issues should have a paragraph property');
});

test('aiScanner should return an object with no accessibility issues for valid html', async (t) => {
  const dom = new JSDOM('<html><body><h1>Heading</h1><p>Paragraph</p><img src="image.jpg" alt="Image"></body></html>');
  const issues = await aiScanner(dom.window.document);
  t.ok(issues, 'issues should be an object');
  t.equal(issues.heading, null, 'heading should be null');
  t.equal(issues.paragraph, null, 'paragraph should be null');
  t.equal(issues.image, null, 'image should be null');
});

test('scanner should throw an error for invalid html', async (t) => {
  const dom = new JSDOM('<html><body><h1>Heading</h1><p>Paragraph</p>');
  try {
    await scanner(dom.window.document);
    t.fail('should throw an error');
  } catch (error) {
    t.ok(error, 'should throw an error');
  }
});

test('aiScanner should throw an error for invalid html', async (t) => {
  const dom = new JSDOM('<html><body><h1>Heading</h1><p>Paragraph</p>');
  try {
    await aiScanner(dom.window.document);
    t.fail('should throw an error');
  } catch (error) {
    t.ok(error, 'should throw an error');
  }
});