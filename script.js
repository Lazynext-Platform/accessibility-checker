// File: script.js
const scanButton = document.getElementById('scan-button');
const contactForm = document.getElementById('contact-form');
const submitButton = document.getElementById('submit-button');

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

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Call the API to send the contact form data
    fetch('/lead', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
});