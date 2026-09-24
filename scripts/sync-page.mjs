// Regenerate src/page.js from index.html after UI edits.
// The worker embeds the UI (served on checker.lazynext.com and for browsers
// hitting GET /); this file is the single source of truth for that bundle.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const out = `// GENERATED from index.html — regenerate after UI edits: node scripts/sync-page.mjs\nexport const PAGE_HTML = ${JSON.stringify(html)};\n`;
writeFileSync(new URL('../src/page.js', import.meta.url), out);
console.log('src/page.js regenerated');
