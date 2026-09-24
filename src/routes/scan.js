// File: src/routes/scan.js
import { validate } from './validation.js';
import { scanMobileApp } from './scanner.js';
import { KV_STORE } from '../constants.js';
import { jsonError } from '../utils.js';

/**
 * Develop a WCAG scan API for mobile applications
 * 
 * @param {Request} request - The incoming request object
 * @param {string} request.body.appUrl - The URL of the mobile application
 * @param {string} request.body.appType - The type of the mobile application (e.g., iOS, Android)
 * 
 * @returns {Promise<Response>} A promise resolving to the response object
 */
export async function handleScanMobileAppRequest(request) {
  try {
    const { appUrl, appType } = await validate(request);
    const scanResult = await scanMobileApp(appUrl, appType);
    await KV_STORE.put(`report:${request.cf.uuid}`, JSON.stringify(scanResult));
    return new Response(JSON.stringify(scanResult), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return jsonError(error, 400);
  }
}

/**
 * Validate the incoming request
 * 
 * @param {Request} request - The incoming request object
 * 
 * @returns {Promise<{ appUrl: string, appType: string }>} A promise resolving to the validated request data
 */
async function validate(request) {
  const { appUrl, appType } = await request.json();
  if (!appUrl || !appType) {
    throw new Error('Invalid request: appUrl and appType are required');
  }
  return { appUrl, appType };
}