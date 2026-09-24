// File: src/dashboard.js
import { getMetrics, getAnalytics } from './metrics.js';
import { renderDashboard } from './dashboard.html.js';

async function handleRequest(request) {
  try {
    const metrics = await getMetrics();
    const analytics = await getAnalytics();
    const dashboardHtml = renderDashboard(metrics, analytics);
    return new Response(dashboardHtml, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error(error);
    return new Response('Error rendering dashboard', { status: 500 });
  }
}

export { handleRequest };