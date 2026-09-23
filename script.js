// File: script.js
const scanForm = document.getElementById('scan-form');
const scanResults = document.getElementById('scan-results');
const reportList = document.getElementById('report-list');
const checkoutForm = document.getElementById('checkout-form');

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
    scanResults.innerHTML = `
        <h2>Scan Results</h2>
        <p>Score: ${result.score}</p>
        <p>Errors: ${result.errors}</p>
        <p>Warnings: ${result.warnings}</p>
    `;
});

checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const plan = document.getElementById('plan').value;
    const response = await fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan })
    });
    const result = await response.json();
    console.log(result);
});

fetch('/reports')
    .then(response => response.json())
    .then(reports => {
        reportList.innerHTML = '';
        reports.forEach(report => {
            const li = document.createElement('li');
            li.textContent = report.name;
            reportList.appendChild(li);
        });
    });