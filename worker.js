import { scanHtml, checkContrast, score } from './src/scanner.js';

export default {
  async fetch(req) {
    if (req.method === 'GET') {
      return new Response(`
        <html>
          <body>
            <h1>Accessibility Checker</h1>
            <form action="/scan" method="post">
              <input type="text" name="url" placeholder="Enter URL">
              <button type="submit">Scan</button>
            </form>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } else if (req.method === 'POST') {
      const { url, html } = await req.json();
      let rendered = false;
      let issues = [];
      let scoreValue = 0;

      if (url) {
        try {
          const renderResponse = await fetch(`${env.PLATFORM_URL}/render`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.PLATFORM_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
          });

          if (renderResponse.ok) {
            const { html: renderedHtml, styles } = await renderResponse.json();
            issues = [...scanHtml(renderedHtml), ...checkContrast(styles)];
            rendered = true;
          } else {
            const response = await fetch(url);
            const text = await response.text();
            issues = scanHtml(text);
          }
        } catch (e) {
          const response = await fetch(url);
          const text = await response.text();
          issues = scanHtml(text);
        }
      } else if (html) {
        issues = scanHtml(html);
      }

      scoreValue = score(issues);
      return new Response(JSON.stringify({ score: scoreValue, issues, rendered }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response('Method not allowed', {
        status: 405,
        headers: {
          'Allow': 'GET, POST',
        },
      });
    }
  },
};
