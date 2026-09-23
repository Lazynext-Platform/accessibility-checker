// File: worker.js
import { createProLicenseWithFreeTrial, isProLicenseValid, upgradeToPro } from './src/license.js';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/create-pro-license') {
    const userId = await request.json().then((data) => data.userId);
    const { licenseId, expiresAt } = await createProLicenseWithFreeTrial(userId);
    return new Response(JSON.stringify({ licenseId, expiresAt }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (path === '/is-pro-license-valid') {
    const userId = await request.json().then((data) => data.userId);
    const isValid = await isProLicenseValid(userId);
    return new Response(JSON.stringify({ isValid }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (path === '/upgrade-to-pro') {
    const userId = await request.json().then((data) => data.userId);
    await upgradeToPro(userId);
    return new Response('License upgraded to Pro', {
      headers: { 'Content-Type': 'text/plain' },
    });
  } else {
    return new Response('Not Found', { status: 404 });
  }
}