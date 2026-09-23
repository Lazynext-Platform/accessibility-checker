// File: script.js
// Add event listener to the button
document.querySelector('button').addEventListener('click', () => {
    // Call the API to scan the website
    fetch('/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: 'https://example.com'
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
});