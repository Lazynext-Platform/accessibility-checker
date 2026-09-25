// Mirror-drift check (infrastructure-audit.md P5): the worker ships to TWO
// script names — `accessibility-checker` (Pages UI) and
// `accessibility-checker-api` (mirror). deploy.mjs keeps them in sync, but a
// manual single-script deploy silently drifts. This compares the deployed
// etags; a mismatch means one script is running stale code.
//
//   CLOUDFLARE_DEPLOY_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… node scripts/drift-check.mjs
//
// Exit 0 = in sync (or one side missing, reported), 1 = drift / API error.

const { CLOUDFLARE_DEPLOY_TOKEN, CLOUDFLARE_ACCOUNT_ID } = process.env;
for (const [k, v] of Object.entries({ CLOUDFLARE_DEPLOY_TOKEN, CLOUDFLARE_ACCOUNT_ID })) {
  if (!v) { console.error(`missing env: ${k}`); process.exit(1); }
}

const api = (name) =>
  `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${name}`;

const etags = {};
let failed = false;
for (const name of ['accessibility-checker', 'accessibility-checker-api']) {
  // GET scripts/{name} returns the script body; the deployed version's etag
  // travels in the response header, not a JSON envelope.
  const r = await fetch(api(name), { headers: { authorization: `Bearer ${CLOUDFLARE_DEPLOY_TOKEN}` } });
  if (!r.ok) {
    console.error(`${name}: fetch failed ${r.status}`, await r.text().catch(() => ''));
    failed = true;
    continue;
  }
  etags[name] = (r.headers.get('etag') ?? '').replace(/^"|"$/g, '');
  console.log(`${name}: etag ${etags[name].slice(0, 16) || 'none'}`);
}

if (!failed) {
  const [a, b] = ['accessibility-checker', 'accessibility-checker-api'];
  if (etags[a] && etags[b] && etags[a] === etags[b]) {
    console.log('in sync — both scripts run identical code');
  } else {
    console.error(`DRIFT: ${a} and ${b} have different deployed code — run scripts/deploy.mjs`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
