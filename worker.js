export default {
  async fetch(req) {
    if (req.method === 'GET') {
      return new Response(`
        <html>
          <body>
            <form action="/scan" method="post">
              <input type="radio" id="url" name="type" value="url" checked>
              <label for="url">URL</label>
              <input type="radio" id="html" name="type" value="html">
              <label for="html">HTML</label>
              <br>
              <textarea id="input" name="input"></textarea>
              <button type="submit">Scan</button>
            </form>
          </body>
        </html>
      `, {
        headers: { 'content-type': 'text/html' }
      });
    } else if (req.method === 'POST') {
      const { url, html } = await req.json();
      let htmlToScan;
      if (url) {
        const response = await fetch(url);
        htmlToScan = await response.text();
      } else if (html) {
        htmlToScan = html;
      } else {
        return new Response('Invalid request', { status: 400 });
      }
      const issues = scanHtml(htmlToScan);
      const scoreValue = score(issues);
      return new Response(JSON.stringify({ score: scoreValue, issues }), {
        headers: { 'content-type': 'application/json' }
      });
    } else {
      return new Response('Method not allowed', { status: 405 });
    }
  }
};

import { scanHtml, score } from './src/scanner.js';