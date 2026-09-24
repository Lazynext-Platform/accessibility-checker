// Section 508 (36 CFR 1194, 2017 refresh) — compliance mapping.
//
// Section 508 does not define its own test rules for web content: E205.4
// incorporates WCAG 2.0 AA by reference. So this module is a reporting layer,
// not a scanner — it maps each emitted WCAG rule onto the Chapter 3 Functional
// Performance Criteria (302.x) a failure implicates, which is the language a
// VPAT or federal procurement review actually uses.
//
// Usage: section508Report(issues) -> { basis, conforms, criteria_failed,
//   clauses_implicated, clause_count }

const FPC = {
  WITHOUT_VISION: "302.1",
  LIMITED_VISION: "302.2",
  COLOR_PERCEPTION: "302.3",
  LIMITED_MANIPULATION: "302.7",
  LIMITED_COGNITIVE: "302.9",
};

// WCAG rule id -> FPC clauses implicated. Rules absent from the map still
// count as E205.4 failures (they are WCAG 2.x criteria) — the map only adds
// the functional criterion a procurement reviewer would cite.
const WCAG_TO_FPC = {
  "wcag-1.1.1": [FPC.WITHOUT_VISION],
  "wcag-1.3.1": [FPC.WITHOUT_VISION],
  "wcag-1.4.3": [FPC.LIMITED_VISION, FPC.COLOR_PERCEPTION],
  "wcag-1.4.4": [FPC.LIMITED_VISION],
  "wcag-1.4.6": [FPC.LIMITED_VISION, FPC.COLOR_PERCEPTION],
  "wcag-1.4.10": [FPC.LIMITED_VISION],
  "wcag-2.1.2": [FPC.LIMITED_MANIPULATION],
  "wcag-2.4.1": [FPC.WITHOUT_VISION, FPC.LIMITED_MANIPULATION],
  "wcag-2.4.3": [FPC.LIMITED_MANIPULATION],
  "wcag-2.4.6": [FPC.LIMITED_COGNITIVE],
  "wcag-2.4.7": [FPC.LIMITED_VISION],
  "wcag-2.5.3": [FPC.WITHOUT_VISION],
  "wcag-2.5.7": [FPC.LIMITED_MANIPULATION],
  "wcag-3.1.1": [FPC.LIMITED_COGNITIVE],
  "wcag-3.1.2": [FPC.LIMITED_COGNITIVE],
  "wcag-3.2.3": [FPC.LIMITED_COGNITIVE],
  "wcag-3.2.4": [FPC.LIMITED_COGNITIVE],
  "wcag-3.3.2": [FPC.LIMITED_COGNITIVE],
  "wcag-3.3.7": [FPC.LIMITED_COGNITIVE],
  "wcag-3.3.8": [FPC.LIMITED_COGNITIVE],
  "wcag-4.1.2": [FPC.WITHOUT_VISION],
  "wcag-4.1.3": [FPC.WITHOUT_VISION],
};

export const SECTION508_BASIS = "WCAG 2.0 AA (incorporated by 36 CFR 1194 E205.4)";

export function section508Report(issues) {
  const criteria = [...new Set((issues ?? []).map((i) => i.rule).filter((r) => /^wcag-\d/.test(r)))].sort();
  const clauses = new Set();
  for (const r of criteria) for (const c of WCAG_TO_FPC[r] ?? []) clauses.add(c);
  return {
    basis: SECTION508_BASIS,
    conforms: criteria.length === 0,
    criteria_failed: criteria,
    clauses_implicated: [...clauses].sort(),
    clause_count: clauses.size,
  };
}
