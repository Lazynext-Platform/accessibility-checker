// Shared handle the Worker's fetch handler fills with its env bindings —
// helpers read platform endpoints from here so worker.js can inject the
// service binding per request instead of hardcoding hosts.
export const env = {
  PLATFORM_KV_URL: 'https://platform.internal',
  PLATFORM_D1_URL: 'https://platform.internal',
};
