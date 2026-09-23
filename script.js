// File: script.js
// Add event listener to the Get Started button
document.querySelector('button').addEventListener('click', () => {
    // Call the API to start the scan
    fetch('/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // Add any necessary data to the request body
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
});