import { test } from "node:test";
import assert from "node:assert/strict";
import {
  monitorKey,
  buildMonitorRecord,
  updateMonitorRecord,
  listMonitorsForEmail,
  DROP_THRESHOLD,
} from "../src/monitor.js";

test("monitorKey is deterministic and email/url-scoped", () => {
  assert.equal(
    monitorKey("a@b.com", "https://x.com"),
    monitorKey("a@b.com", "https://x.com")
  );
  assert.notEqual(monitorKey("a@b.com", "https://x.com"), monitorKey("c@d.com", "https://x.com"));
  assert.notEqual(monitorKey("a@b.com", "https://x.com"), monitorKey("a@b.com", "https://y.com"));
  assert.ok(monitorKey("a@b.com", "https://x.com").startsWith("mon:a@b.com:"));
});

test("monitorKey normalizes trailing slashes and case", () => {
  assert.equal(
    monitorKey("a@b.com", "https://X.com/"),
    monitorKey("A@B.com", "https://x.com")
  );
});

test("buildMonitorRecord creates a fresh record", () => {
  const r = buildMonitorRecord({ email: "A@B.com", url: " https://x.com " });
  assert.equal(r.email, "a@b.com");
  assert.equal(r.url, "https://x.com");
  assert.equal(r.last_score, null);
  assert.equal(r.scans, 0);
  assert.equal(r.alerts, 0);
});

test("updateMonitorRecord: first scan never drops", () => {
  const r = buildMonitorRecord({ email: "a@b.com", url: "https://x.com" });
  const u = updateMonitorRecord(r, 40, 1000);
  assert.equal(u.last_score, 40);
  assert.equal(u.last_scan_at, 1000);
  assert.equal(u.scans, 1);
  assert.equal(u.scoreDropped, false);
});

test("updateMonitorRecord: 9-point drop does not flag", () => {
  const r = { ...buildMonitorRecord({ email: "a@b.com", url: "x" }), last_score: 80 };
  assert.equal(updateMonitorRecord(r, 80 - (DROP_THRESHOLD - 1)).scoreDropped, false);
});

test("updateMonitorRecord: exact-threshold drop flags + increments alerts", () => {
  const r = { ...buildMonitorRecord({ email: "a@b.com", url: "x" }), last_score: 80, alerts: 2 };
  const u = updateMonitorRecord(r, 80 - DROP_THRESHOLD);
  assert.equal(u.scoreDropped, true);
  assert.equal(u.alerts, 3);
});

test("updateMonitorRecord: beyond-threshold drop flags", () => {
  const r = { ...buildMonitorRecord({ email: "a@b.com", url: "x" }), last_score: 80 };
  assert.equal(updateMonitorRecord(r, 80 - (DROP_THRESHOLD + 1)).scoreDropped, true);
});

test("updateMonitorRecord: score rise does not flag", () => {
  const r = { ...buildMonitorRecord({ email: "a@b.com", url: "x" }), last_score: 60 };
  assert.equal(updateMonitorRecord(r, 95).scoreDropped, false);
});

test("listMonitorsForEmail filters by owner", () => {
  const mine = buildMonitorRecord({ email: "me@x.com", url: "https://a.com" });
  const other = buildMonitorRecord({ email: "you@x.com", url: "https://b.com" });
  const map = {
    [monitorKey("me@x.com", "https://a.com")]: mine,
    [monitorKey("you@x.com", "https://b.com")]: other,
  };
  const found = listMonitorsForEmail(map, "me@x.com");
  assert.equal(found.length, 1);
  assert.equal(found[0].url, "https://a.com");
  assert.equal(listMonitorsForEmail(map, "nobody@x.com").length, 0);
});
