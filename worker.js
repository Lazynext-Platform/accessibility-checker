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
              <input type="text" id="input" name="input" required>
              <button type="submit">Scan</button>
            </form>
          </body>
        </html>
      `, {
        headers: {
          'content-type': 'text/html',
        },
      });
    }

    if (request.method === 'POST') {
      const { url, html } = await request.json();
      let rendered = false;
      let issues = [];
      let scoreValue;

      try {
        if (url) {
          const renderResponse = await fetch(env.PLATFORM_URL + "/render", {
            method: 'POST',
            headers: {
              'authorization': 'Bearer ' + env.PLATFORM_TOKEN,
              'content-type': 'application/json',
            },
            body: JSON.stringify({ url }),
          });

          if (renderResponse.ok) {
            const { html: renderedHtml, styles } = await renderResponse.json();
            issues = scanHtml(renderedHtml).concat(checkContrast(styles));
            rendered = true;
          } else {
            issues = scanHtml(await (await fetch(url)).text());
            issues.push({ rule: 'render_error', message: `Failed to render page: ${renderResponse.status} ${renderResponse.statusText}` });
          }
        } else if (html) {
          issues = scanHtml(html);
        }

        scoreValue = score(issues);
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            'content-type': 'application/json',
          },
        });
      }

      return new Response(JSON.stringify({ score: scoreValue, issues, rendered }), {
        headers: {
          'content-type': 'application/json',
        },
      });
    }

    return new Response('Method not allowed', {
      status: 405,
    });
  },
};
