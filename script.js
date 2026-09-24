// File: script.js
// Push events to Google Tag Manager data layer
function pushEvent(event) {
  window.dataLayer.push(event);
}

// Example usage:
// Push page view event
pushEvent({
  'event': 'page_view',
  'page': window.location.pathname
});

// Push button click event
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    pushEvent({
      'event': 'button_click',
      'button': button.textContent
    });
  });
});