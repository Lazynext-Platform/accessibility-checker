export default {
  async fetch(req) {
    const url = new URL(req.url);
    const action = url.pathname.slice(1);

    if (req.method === 'GET' && action === '') {
      return new Response(`
        <html>
          <body>
            <h1>Accessibility Checker</h1>
            <form id="checker-form">
              <label for="url">URL:</label>
              <input type="text" id="url" name="url"><br><br>
              <input type="submit" value="Check">
            </form>
            <div id="result"></div>
            <script>
              document.getElementById('checker-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const url = document.getElementById('url').value;
                const response = await fetch('/check', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url }),
                });
                const result = await response.json();
                document.getElementById('result').innerHTML = \`
                  <h2>Result:</h2>
                  <ul>
                    \${result.issues.map((issue) => \`<li>\${issue.description} (\${issue.severity})</li>\`).join('')}
                  </ul>
                \`;
              });
            </script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    if (req.method === 'POST' && action === 'check') {
      const { url } = await req.json();
      const response = await fetch(url);
      const html = await response.text();
      const issues = [];

      // Simple accessibility checks
      if (!html.includes('alt=')) {
        issues.push({ description: 'Missing alt attribute for images', severity: 'high' });
      }
      if (!html.includes('aria-label=')) {
        issues.push({ description: 'Missing aria-label attribute for interactive elements', severity: 'medium' });
      }

      return new Response(JSON.stringify({ issues }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Not Found', { status: 404 });
  },
};