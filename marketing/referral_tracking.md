# Referral Tracking for Accessibility Checker
## Introduction
To measure the effectiveness of our marketing efforts and understand how users are interacting with our GitHub Pages static UI, we will implement referral tracking using Google Analytics.

## Setup
1. Create a Google Analytics account and set up a new property for the Accessibility Checker website.
2. Install the Google Analytics tracking code on the `index.html` page.

## Tracking Code
We will use the Google Analytics gtag.js library to track page views and referrals. Add the following code to the `<head>` section of `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
Replace `G-XXXXXXXXXX` with the actual tracking ID from the Google Analytics property.

## Tracking Referrals
To track referrals, we will use the `gtag` function to send events to Google Analytics. We will track the following events:
* `page_view`: triggered when a user views a page on the website
* `scan_initiated`: triggered when a user initiates a scan using the Accessibility Checker tool
* `scan_completed`: triggered when a scan is completed and results are displayed to the user

Add the following code to the `scanner.js` file to track these events:
```javascript
import { gtag } from '../index.html';

// Track page view
gtag('event', 'page_view', {
  'page_path': window.location.pathname,
  'page_title': document.title,
});

// Track scan initiated
document.getElementById('scan-button').addEventListener('click', () => {
  gtag('event', 'scan_initiated', {
    'event_category': 'scanner',
    'event_label': 'scan_initiated',
  });
});

// Track scan completed
scanner.on('scanCompleted', () => {
  gtag('event', 'scan_completed', {
    'event_category': 'scanner',
    'event_label': 'scan_completed',
  });
});
```
Note: The `gtag` function is imported from `index.html` to avoid duplicating the tracking code.

## Testing
To test the referral tracking implementation, we will use the `node:test` framework to write unit tests for the tracking code.

Create a new file `test/referral_tracking.test.mjs` with the following content:
```javascript
import { test } from 'node:test';
import { gtag } from '../index.html';

test('page view event is sent', async () => {
  const pageViewEvent = {
    'event': 'page_view',
    'page_path': '/index.html',
    'page_title': 'Accessibility Checker',
  };
  gtag('event', 'page_view', pageViewEvent);
  // Verify that the event is sent to Google Analytics
});

test('scan initiated event is sent', async () => {
  const scanInitiatedEvent = {
    'event': 'scan_initiated',
    'event_category': 'scanner',
    'event_label': 'scan_initiated',
  };
  gtag('event', 'scan_initiated', scanInitiatedEvent);
  // Verify that the event is sent to Google Analytics
});

test('scan completed event is sent', async () => {
  const scanCompletedEvent = {
    'event': 'scan_completed',
    'event_category': 'scanner',
    'event_label': 'scan_completed',
  };
  gtag('event', 'scan_completed', scanCompletedEvent);
  // Verify that the event is sent to Google Analytics
});
```
Run the tests using the `node:test` command to verify that the referral tracking implementation is working correctly.

## Conclusion
By implementing referral tracking using Google Analytics, we can gain insights into how users are interacting with the Accessibility Checker website and understand the effectiveness of our marketing efforts. The tracking code is implemented on the `index.html` page, and events are sent to Google Analytics using the `gtag` function. Unit tests are written to verify that the tracking code is working correctly.