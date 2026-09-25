// Deploy the product worker via the Cloudflare scripts Upload API (multipart).
// No wrangler.toml — the worker needs only PLATFORM (service binding to the
// platform worker) and PLATFORM_TOKEN (the platform worker's bearer secret).
//
// Env required:
//   CLOUDFLARE_DEPLOY_TOKEN — Cloudflare REST token (Workers Scripts Edit)
//   CLOUDFLARE_ACCOUNT_ID   — account id
//   CLOUDFLARE_API_TOKEN    — platform worker bearer; becomes PLATFORM_TOKEN
//
// Deploys to BOTH script names — `accessibility-checker` (called by the Pages
// UI) and `accessibility-checker-api` (legacy mirror). Deploy one and not the
// other and they silently drift.
//
// Two upload traps this script is written around (both hit before):
//   - omitting `bindings` from metadata silently drops them at runtime —
//     the settings API still lists them but env.PLATFORM is undefined (1101)
//   - secret_text bindings need `text` in the re-sent metadata or the upload
//     fails with error 10021
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { CLOUDFLARE_DEPLOY_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = process.env;
for (const [k, v] of Object.entries({ CLOUDFLARE_DEPLOY_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN })) {
  if (!v) { console.error(`missing env: ${k}`); process.exit(1); }
}

// Every module worker.js imports — main module first.
const MODULES = [
  'worker.js',
  ...readdirSync(join(root, 'src')).filter((f) => f.endsWith('.js')).map((f) => `src/${f}`),
  ...readdirSync(join(root, 'src/rules')).filter((f) => f.endsWith('.js')).map((f) => `src/rules/${f}`),
];

const metadata = {
  main_module: 'worker.js',
  compatibility_date: '2024-09-01',
  bindings: [
    { name: 'PLATFORM', type: 'service', service: 'ai-company-os', environment: 'production' },
    { name: 'PLATFORM_TOKEN', type: 'secret_text', text: CLOUDFLARE_API_TOKEN },
  ],
};

function body() {
  const form = new FormData();
  form.set('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata.json');
  for (const mod of MODULES) {
    form.set(mod, new Blob([readFileSync(join(root, mod))], { type: 'application/javascript+module' }), mod);
  }
  return form;
}

const api = (name) =>
  `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${name}`;

let failed = false;
for (const name of ['accessibility-checker', 'accessibility-checker-api']) {
  const r = await fetch(api(name), {
    method: 'PUT',
    headers: { authorization: `Bearer ${CLOUDFLARE_DEPLOY_TOKEN}` },
    body: body(),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.success) {
    console.error(`${name}: upload failed`, r.status, JSON.stringify(d.errors ?? d));
    failed = true;
    continue;
  }
  const v = d.result?.startup_time_ms ?? '?';
  console.log(`${name}: deployed (startup ${v}ms, etag ${d.result?.etag?.slice(0, 12)}…)`);
  const health = await fetch(`https://${name}.dry-hall-6a50.workers.dev/health`);
  const h = await health.json().catch(() => ({}));
  console.log(`  /health: ${health.status} ${h.ok ? 'ok' : 'NOT OK'}`);
}
process.exit(failed ? 1 : 0);
