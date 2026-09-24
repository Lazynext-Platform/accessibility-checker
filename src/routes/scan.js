// File: src/routes/scan.js
import { Router } from 'cloudflare-worker-router';
import { validate } from '../utils/validation';
import { scan } from '../scanner/wcag-2.2-aaa';
import { kv } from '../storage/platform-kv';
import { sendError } from '../utils/error-handler';

const router = new Router();

/**
 * @api {post} /scan Scan a URL for WCAG 2.2 AAA compliance
 * @apiName ScanURL
 * @apiGroup Compliance
 *
 * @apiParam {String} url The URL to scan
 *
 * @apiSuccess {Object} report The compliance report
 */
router.post('/scan', async (request, context) => {
  try {
    const { url } = await validate(request, {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
      },
      required: ['url'],
    });

    const report = await scan(url);
    await kv.put(`report:${report.id}`, report);

    return new Response(JSON.stringify(report), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return sendError(context, error);
  }
});

export default router;