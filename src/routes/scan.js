// File: src/routes/scan.js
import { Router } from 'cloudflare-worker-router';
import { validate } from '../utils/validation';
import { scan } from '../scanner';
import {PLATFORM} from '../env';

const router = new Router();

// Define validation schema for scan endpoint
const scanSchema = {
  type: 'object',
  properties: {
    url: { type: 'string', format: 'uri' },
  },
  required: ['url'],
};

// Define error handler for scan endpoint
const errorHandler = (error) => {
  console.error(error);
  return { status: 500, body: 'Internal Server Error' };
};

// Define route for scan endpoint
router.post('/scan', async (request) => {
  try {
    // Validate request body
    const { error, value } = validate(scanSchema, await request.json());
    if (error) {
      return { status: 400, body: error.details[0].message };
    }

    // Call scanner API
    const result = await scan(value.url, PLATFORM);

    // Return scan result
    return { status: 200, body: result };
  } catch (error) {
    // Handle errors explicitly
    return errorHandler(error);
  }
});

// Define automated tests for edge cases and error handling
export function testScanEndpoint() {
  // Test case: Invalid request body
  it('should return 400 for invalid request body', async () => {
    const response = await router.handle({ method: 'POST', url: '/scan', body: '{}' });
    expect(response.status).toBe(400);
  });

  // Test case: Scanner API error
  it('should return 500 for scanner API error', async () => {
    const error = new Error('Scanner API error');
    jest.spyOn(scan, 'default').mockRejectedValueOnce(error);
    const response = await router.handle({ method: 'POST', url: '/scan', body: '{"url":"https://example.com"}' });
    expect(response.status).toBe(500);
  });

  // Test case: Successful scan
  it('should return 200 for successful scan', async () => {
    const result = { success: true };
    jest.spyOn(scan, 'default').mockResolvedValueOnce(result);
    const response = await router.handle({ method: 'POST', url: '/scan', body: '{"url":"https://example.com"}' });
    expect(response.status).toBe(200);
    expect(response.body).toBe(result);
  });
}