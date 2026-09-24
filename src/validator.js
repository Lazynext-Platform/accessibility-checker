// Shared request validation — single source of truth for the input checks
// the routes used to inline. Keep these deliberately simple: they gate
// requests, they do not try to be RFC-complete.

export function isEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isHttpUrl(v) {
  return typeof v === 'string' && /^https?:\/\//i.test(v);
}

export function isToken(v) {
  return typeof v === 'string' && /^[a-f0-9-]{36}$/i.test(v);
}

// Bytes, not characters — a multibyte-heavy body should count honestly.
export function withinBytes(s, max) {
  return typeof s === 'string' && new TextEncoder().encode(s).length <= max;
}
