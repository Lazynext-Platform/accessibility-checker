// File: worker.js
import { scheduleReport } from 'src/scheduler.js';

export async function handleRequest(request) {
  const { method, url } = request;

  if (method === 'POST' && url.pathname === '/schedule') {
    try {
      const { scanId, schedule } = await request.json();
      const result = await scheduleReport(scanId, schedule);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(error);
      return new Response('Failed to schedule report', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  return new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}