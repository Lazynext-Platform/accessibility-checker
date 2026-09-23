import { scanHtml, checkContrast, score } from './src/scanner.js';

export default {
  async fetch(request, env) {
    if (request.method === 'GET') {
      return new Response(`
        <html>
          <body>
            <h1>Accessibility Checker</h1>
            <form action="/scan" method="post">
              <input type="radio" id="url" name="type" value="url" checked>
              <label for="url">URL</label>
              <input type="radio" id="html" name="type" value="html">
              <label for="html">HTML</label>
              <br>
              <input type="text" id="input" name="input">
              <button type="submit">Scan</button>
            </form>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    } else if (request.method === 'POST') {
      const { url, html } = await request.json();
      let rendered = false;
      let issues = [];
      let scoreValue = 0;

      if (url) {
        try {
          const renderResponse = await env.PLATFORM.fetch(new Request("https://platform.internal/render", {
            method: "POST",
            headers: {
              authorization: "Bearer " + env.PLATFORM_TOKEN,
              "content-type": "application/json"
            },
            body: JSON.stringify({ url })
          }));
          const { html: renderedHtml, styles } = await renderResponse.json();
          issues = [...scanHtml(renderedHtml), ...checkContrast(styles)];
          rendered = true;
        } catch (error) {
          issues = scanHtml(await (await fetch(url)).text());
          issues.push({ rule: 'render_error', message: error.message });
        }
      } else if (html) {
        issues = scanHtml(html);
      }

      scoreValue = score(issues);

      return new Response(JSON.stringify({
        score: scoreValue,
        issues,
        rendered
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  }
};
