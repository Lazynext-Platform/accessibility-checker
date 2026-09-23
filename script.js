// File: script.js
const scanButton = document.getElementById('scan-button');
const signupButton = document.getElementById('signup-button');

scanButton.addEventListener('click', () => {
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

signupButton.addEventListener('click', () => {
    // Call the API to sign up for a free trial
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'user@example.com'
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
});