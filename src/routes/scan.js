// File: src/routes/scan.js
import { Router } from 'cloudflare-worker-router';
import { validate } from 'src/validation';
import { getKV, putKV } from 'src/kv';
import { scan } from 'src/scanner';

const router = new Router();

// Define the schema for the scheduled monitoring state
const scheduledMonitoringStateSchema = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    schedule: { type: 'string' },
    lastScan: { type: 'string' },
  },
  required: ['url', 'schedule'],
};

// Define the endpoint to integrate scheduled monitoring state with WCAG scan API
router.post('/scan', async (request, context) => {
  try {
    // Validate the request body
    const body = await request.json();
    const result = validate(body, scheduledMonitoringStateSchema);
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the scheduled monitoring state from KV
    const currentState = await getKV(`scheduled-monitoring-state:${body.url}`);
    if (!currentState) {
      // Initialize the scheduled monitoring state if it doesn't exist
      await putKV(`scheduled-monitoring-state:${body.url}`, JSON.stringify({
        url: body.url,
        schedule: body.schedule,
        lastScan: null,
      }));
    }

    // Run the WCAG scan
    const scanResult = await scan(body.url);

    // Update the scheduled monitoring state with the latest scan result
    await putKV(`scheduled-monitoring-state:${body.url}`, JSON.stringify({
      ...JSON.parse(currentState),
      lastScan: scanResult.date,
    }));

    // Return the scan result
    return new Response(JSON.stringify(scanResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle any errors that occur during the process
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

export default router;