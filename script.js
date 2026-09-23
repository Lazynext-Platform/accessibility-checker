// File: script.js
// Add event listener to button
document.querySelector('button').addEventListener('click', () => {
    // Call API to start scan
    fetch('/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // Add scan parameters here
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
});