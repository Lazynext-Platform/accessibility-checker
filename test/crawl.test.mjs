import { test } from "node:test";
import assert from "node:assert/strict";
import { crawlSite, extractLinks } from "../src/crawl.js";

function stubFetch(pages) {
  return async (url) => {
    if (!(url in pages)) return { status: 404, headers: new Map(), text: async () => "" };
    const p = pages[url];
    return {
      status: p.status ?? 200,
      headers: { get: (k) => (k === "content-type" ? p.type ?? "text/html" : null) },
      text: async () => p.html ?? "",
    };
  };
}

test("extractLinks keeps same-origin, drops external/schemes/assets", () => {
  const links = extractLinks(
    `<a href="/about">a</a><a href="https://other.com/x">b</a><a href="mailto:x@y.z">c</a>` +
    `<a href="#frag">d</a><a href="/img.png">e</a><a href="https://site.com/p?x=1#f">f</a>`,
    "https://site.com/"
  );
  assert.deepEqual(links.sort(), ["https://site.com/about", "https://site.com/p?x=1"].sort());
});

test("crawlSite BFS-visits linked pages up to maxPages", async () => {
  const pages = {
    "https://s.com/": { html: `<a href="/a">a</a><a href="/b">b</a>` },
    "https://s.com/a": { html: `<a href="/c">c</a>` },
    "https://s.com/b": { html: `plain` },
    "https://s.com/c": { html: `deep` },
  };
  const r = await crawlSite("https://s.com/", { fetchImpl: stubFetch(pages), delayMs: 0, maxPages: 3 });
  assert.equal(r.count, 3);
  assert.deepEqual(r.pages.map((p) => p.url), ["https://s.com/", "https://s.com/a", "https://s.com/b"]);
});

test("crawlSite skips external links and assets", async () => {
  const pages = {
    "https://s.com/": { html: `<a href="https://ext.com/x">e</a><a href="/logo.svg">l</a><a href="/ok">o</a>` },
    "https://s.com/ok": { html: `done` },
  };
  const r = await crawlSite("https://s.com/", { fetchImpl: stubFetch(pages), delayMs: 0 });
  assert.equal(r.count, 2);
  assert.deepEqual(r.pages.map((p) => p.url), ["https://s.com/", "https://s.com/ok"]);
});

test("crawlSite dedups fragment/query variants", async () => {
  const pages = {
    "https://s.com/": { html: `<a href="/p#one">1</a><a href="/p#two">2</a><a href="/p">3</a>` },
    "https://s.com/p": { html: `p` },
  };
  const r = await crawlSite("https://s.com/", { fetchImpl: stubFetch(pages), delayMs: 0 });
  assert.equal(r.count, 2); // / and /p once, not /p#one + /p#two separately
});

test("crawlSite counts failed and non-HTML responses as skipped", async () => {
  const pages = {
    "https://s.com/": { html: `<a href="/missing">m</a><a href="/feed">d</a>` },
    "https://s.com/missing": { status: 404 },
    "https://s.com/feed": { type: "application/json", html: "{}" },
  };
  const r = await crawlSite("https://s.com/", { fetchImpl: stubFetch(pages), delayMs: 0 });
  assert.equal(r.count, 1);
  assert.equal(r.skipped, 2);
});

test("crawlSite never fetches asset links (filtered at extraction)", async () => {
  let fetched = [];
  const spy = async (url) => {
    fetched.push(url);
    return { status: 200, headers: { get: () => "text/html" }, text: async () => "" };
  };
  const pages = { "https://s.com/": { html: `<a href="/data.json">d</a>` } };
  const f = async (url) => (url in pages ? spy(url) : { status: 404, headers: new Map(), text: async () => "" });
  const r = await crawlSite("https://s.com/", { fetchImpl: f, delayMs: 0 });
  assert.deepEqual(fetched, ["https://s.com/"]); // /data.json filtered before fetch
  assert.equal(r.skipped, 0);
});

test("crawlSite survives fetch errors", async () => {
  const r = await crawlSite("https://s.com/", {
    fetchImpl: async () => { throw new Error("network"); },
    delayMs: 0,
  });
  assert.equal(r.count, 0);
  assert.equal(r.skipped, 1);
});

test("crawlSite respects maxPages", async () => {
  const pages = {
    "https://s.com/": { html: `<a href="/1">1</a><a href="/2">2</a><a href="/3">3</a>` },
    "https://s.com/1": { html: `` }, "https://s.com/2": { html: `` }, "https://s.com/3": { html: `` },
  };
  const r = await crawlSite("https://s.com/", { fetchImpl: stubFetch(pages), delayMs: 0, maxPages: 2 });
  assert.equal(r.count, 2);
});
