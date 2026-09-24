import test from 'node:test';
import assert from 'node:assert/strict';
import { section508Report, SECTION508_BASIS } from '../src/rules/section508.js';

test('empty findings conform', () => {
  const r = section508Report([]);
  assert.equal(r.conforms, true);
  assert.equal(r.criteria_failed.length, 0);
  assert.equal(r.clauses_implicated.length, 0);
  assert.equal(r.basis, SECTION508_BASIS);
});

test('wcag findings map to functional performance criteria', () => {
  const r = section508Report([
    { rule: 'wcag-2.1.2', message: 'keyboard trap' },
    { rule: 'wcag-1.4.3', message: 'contrast 2.1:1' },
    { rule: 'wcag-1.3.1', message: 'no main landmark' },
  ]);
  assert.equal(r.conforms, false);
  assert.deepEqual(r.criteria_failed, ['wcag-1.3.1', 'wcag-1.4.3', 'wcag-2.1.2']);
  assert.ok(r.clauses_implicated.includes('302.1')); // without vision
  assert.ok(r.clauses_implicated.includes('302.2')); // limited vision
  assert.ok(r.clauses_implicated.includes('302.3')); // color perception
  assert.ok(r.clauses_implicated.includes('302.7')); // limited manipulation
  assert.equal(r.clause_count, r.clauses_implicated.length);
});

test('duplicate rules dedupe into one criterion entry', () => {
  const r = section508Report([
    { rule: 'wcag-1.3.1', message: 'a' },
    { rule: 'wcag-1.3.1', message: 'b' },
    { rule: 'wcag-1.3.1', message: 'c' },
  ]);
  assert.deepEqual(r.criteria_failed, ['wcag-1.3.1']);
});

test('non-wcag rule ids are ignored for the clause map', () => {
  const r = section508Report([
    { rule: 'custom-rule', message: 'x' },
    { rule: 'wcag-3.3.8', message: 'auth requires cognitive test' },
  ]);
  assert.deepEqual(r.criteria_failed, ['wcag-3.3.8']);
  assert.deepEqual(r.clauses_implicated, ['302.9']);
});

test('unmapped wcag criteria still fail conformance', () => {
  // a criterion with no FPC mapping still counts under E205.4
  const r = section508Report([{ rule: 'wcag-9.9.9', message: 'future rule' }]);
  assert.equal(r.conforms, false);
  assert.deepEqual(r.criteria_failed, ['wcag-9.9.9']);
  assert.equal(r.clause_count, 0);
});

test('null/undefined input conforms vacuously', () => {
  const r = section508Report(undefined);
  assert.equal(r.conforms, true);
});
