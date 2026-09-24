// File: src/routes/scan.js
import { Router } from 'cloudflare-worker-router';
import { validate } from '../utils/validation.js';
import { scanDocument } from '../scanner.js';
import { kv } from '../storage.js';

const router = new Router();

// Define the schema for the request body
const documentSchema = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    fileType: { type: 'string' },
  },
  required: ['file', 'fileType'],
};

// Define the API endpoint to scan a document
router.post('/scan-document', async (request, context) => {
  try {
    // Validate the request body
    const { file, fileType } = await validate(request.body, documentSchema);

    // Scan the document
    const scanResult = await scanDocument(file, fileType);

    // Store the scan result in KV storage
    await kv.put(`scan-result:${context.request.id}`, scanResult);

    // Return the scan result
    return new Response(JSON.stringify(scanResult), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle errors explicitly
    if (error instanceof SyntaxError) {
      return new Response('Invalid request body', { status: 400 });
    } else if (error instanceof Error) {
      return new Response('Internal server error', { status: 500 });
    } else {
      return new Response('Unknown error', { status: 500 });
    }
  }
});

export default router;