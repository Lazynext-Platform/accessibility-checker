// File: script.js
const proCtaButton = document.getElementById('pro-cta');

proCtaButton.addEventListener('click', () => {
    // Call the API to handle the Pro license purchase
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            license: 'pro'
        })
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the API
        console.log(data);
    })
    .catch(error => {
        // Handle any errors that occur
        console.error(error);
    });
});