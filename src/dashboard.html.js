// File: src/dashboard.html.js
export function renderDashboard(metrics, analytics) {
  return `
    <html>
      <head>
        <title>Accessibility Checker Dashboard</title>
      </head>
      <body>
        <h1>Key Metrics</h1>
        <ul>
          ${Object.keys(metrics).map((key) => `<li>${key}: ${metrics[key]}</li>`).join('')}
        </ul>
        <h1>Analytics</h1>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Users</th>
              <th>Checks</th>
            </tr>
          </thead>
          <tbody>
            ${analytics.map((row) => `
              <tr>
                <td>${row.date}</td>
                <td>${row.users}</td>
                <td>${row.checks}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
}