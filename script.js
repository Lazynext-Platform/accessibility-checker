// File: script.js
const apiUrl = 'https://your-api-url.com';

document.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.querySelector('.call-to-action button');

    scanButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`${apiUrl}/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: 'https://your-website-url.com'
                })
            });

            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    });
});