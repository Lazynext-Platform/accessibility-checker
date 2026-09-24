// File: src/routes/scan.js
import { Router } from 'worker-router';
import { validate } from '../utils/validation';
import { scan } from '../services/scanner';
import { kv } from '../utils/kv';
import { D1 } from '../utils/d1';

const router = new Router();

// Define validation schema for scan endpoint
const scanSchema = {
  type: 'object',
  properties: {
    url: { type: 'string', format: 'uri' },
  },
  required: ['url'],
};

// Define route for scan endpoint
router.post('/scan', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = validate(scanSchema, await req.json());
    if (error) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    // Extract URL from request body
    const { url } = value;

    // Check if URL is already scanned
    const cachedResult = await kv.get(`scan:${url}`);
    if (cachedResult) {
      res.json(JSON.parse(cachedResult));
      return;
    }

    // Perform WCAG scan
    const result = await scan(url);

    // Cache scan result
    await kv.put(`scan:${url}`, JSON.stringify(result));

    // Store scan result in D1
    await D1.query(`INSERT INTO scans (url, result) VALUES (?, ?)`, [url, JSON.stringify(result)]);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;