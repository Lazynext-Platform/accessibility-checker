import test from 'node:test';
import assert from 'node:assert/strict';
import { isEmail, isHttpUrl, isToken, withinBytes } from '../src/validator.js';

test('isEmail accepts plain addresses, rejects junk', () => {
  assert.ok(isEmail('a@b.co'));
  assert.ok(!isEmail('not-an-email'));
  assert.ok(!isEmail('a@b'));
  assert.ok(!isEmail('@x.com'));
  assert.ok(!isEmail('a b@c.com'));
  assert.ok(!isEmail(undefined));
  assert.ok(!isEmail(42));
});

test('isHttpUrl accepts http(s) only', () => {
  assert.ok(isHttpUrl('https://x.com'));
  assert.ok(isHttpUrl('http://x.com/a?b=c'));
  assert.ok(!isHttpUrl('ftp://x.com'));
  assert.ok(!isHttpUrl('javascript:alert(1)'));
  assert.ok(!isHttpUrl('x.com'));
  assert.ok(!isHttpUrl(''));
  assert.ok(!isHttpUrl(null));
});

test('isToken accepts uuid-shape tokens only', () => {
  assert.ok(isToken('a1b2c3d4-e5f6-7890-abcd-ef1234567890'));
  assert.ok(!isToken('not-a-token'));
  assert.ok(!isToken('z'.repeat(36))); // z is outside the hex/dash charset
  assert.ok(!isToken('a1b2'));        // too short
  assert.ok(!isToken(''));
  assert.ok(!isToken(undefined));
});

test('withinBytes counts bytes, not characters', () => {
  assert.ok(withinBytes('abc', 3));
  assert.ok(!withinBytes('abcd', 3));
  // é is 2 bytes in UTF-8 — two of them exceed a 3-byte cap
  assert.ok(!withinBytes('éé', 3));
  assert.ok(!withinBytes(123, 10));
});
