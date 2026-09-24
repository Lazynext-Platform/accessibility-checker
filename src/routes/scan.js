// File: src/routes/scan.js
import { Router } from 'cloudflare-worker-router';
import { validate } from 'src/validation';
import { logger } from 'src/logger';
import { PLATFORM } from 'env';
import { kv } from 'src/kv';

const router = new Router();

router.post('/scan', async (request, context) => {
  try {
    const { url } = await validate(request.body, {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
      },
      required: ['url'],
    });

    const scanResult = await PLATFORM.scan(url);
    await kv.put(`report:${scanResult.id}`, scanResult);
    return new Response(JSON.stringify(scanResult), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof SyntaxError) {
      return new Response('Invalid request body', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else if (error instanceof Error) {
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      return new Response('Unknown Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
});

router.get('/health', async () => {
  try {
    const healthCheck = await PLATFORM.healthCheck();
    return new Response(JSON.stringify(healthCheck), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error(error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
});

router.get('/report/:id', async (context) => {
  try {
    const id = context.params.id;
    const report = await kv.get(`report:${id}`);
    if (!report) {
      return new Response('Report not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    return new Response(JSON.stringify(report), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error(error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
});

router.get('/lead', async () => {
  try {
    const lead = await PLATFORM.getLead();
    return new Response(JSON.stringify(lead), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error(error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
});

router.post('/checkout', async (request) => {
  try {
    const { token } = await validate(request.body, {
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
      required: ['token'],
    });

    const checkoutResult = await PLATFORM.checkout(token);
    return new Response(JSON.stringify(checkoutResult), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof SyntaxError) {
      return new Response('Invalid request body', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else if (error instanceof Error) {
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      return new Response('Unknown Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
});