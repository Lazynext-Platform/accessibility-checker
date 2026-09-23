// File: script.js
const scanForm = document.getElementById('scan-form');
const scanResult = document.getElementById('scan-result');
const reportsList = document.getElementById('reports-list');
const createReportButton = document.getElementById('create-report');
const reportTemplate = document.getElementById('report-template');

scanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('url').value;
    const response = await fetch('/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    });
    const result = await response.json();
    scanResult.innerHTML = `
        <h2>Scan Result</h2>
        <p>URL: ${result.url}</p>
        <p>Issues: ${result.issues.length}</p>
        <ul>
            ${result.issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
    `;
});

createReportButton.addEventListener('click', async () => {
    const response = await fetch('/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const reportId = await response.json();
    const shareableLink = `${window.location.origin}/report/${reportId}`;
    reportTemplate.innerHTML = `
        <h2>Report Template</h2>
        <p>Shareable Link: <a href="${shareableLink}">${shareableLink}</a></p>
    `;
});

// Fetch reports list
fetch('/reports')
    .then(response => response.json())
    .then(reports => {
        reportsList.innerHTML = reports.map(report => `<li>${report.id}</li>`).join('');
    });