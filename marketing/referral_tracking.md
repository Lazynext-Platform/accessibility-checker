# Referral Tracking for Accessibility Checker
To set up referral tracking for the Accessibility Checker, we will use Google Analytics to monitor website traffic and referrals. Since the deployed site will be a client-side version of the product, we will focus on tracking events and referrals on the static UI.

## Step 1: Create a Google Analytics Account
Create a new Google Analytics account and set up a new property for the Accessibility Checker website. This will provide a unique tracking ID that will be used to track website traffic and referrals.

## Step 2: Add Google Analytics Tracking Code
Add the Google Analytics tracking code to the `index.html` file. This code will track page views and other events on the website.
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
<!-- End Google Analytics -->
```
Replace `G-XXXXXXXXXX` with the actual tracking ID from the Google Analytics account.

## Step 3: Track Referrals
To track referrals, we need to set up event tracking in Google Analytics. We will track the following events:
* `referral`: triggered when a user clicks on a referral link
* `scan`: triggered when a user scans a website for accessibility issues
* `result`: triggered when the scan results are displayed

Add the following code to the `index.html` file to track these events:
```javascript
// Track referral event
function trackReferral() {
  gtag('event', 'referral', {
    'event_category': 'referral',
    'event_label': 'referral_link'
  });
}

// Track scan event
function trackScan() {
  gtag('event', 'scan', {
    'event_category': 'scan',
    'event_label': 'website_scan'
  });
}

// Track result event
function trackResult() {
  gtag('event', 'result', {
    'event_category': 'result',
    'event_label': 'scan_results'
  });
}
```
## Step 4: Integrate with Existing Code
Integrate the event tracking code with the existing code in the `src` directory. For example, in the `src/scanner.js` file, add the `trackScan()` function call when the scan is initiated:
```javascript
// src/scanner.js
import { trackScan } from '../index';

// ...

async function scanWebsite(url) {
  // ...
  trackScan();
  // ...
}
```
Similarly, add the `trackResult()` function call when the scan results are displayed:
```javascript
// src/scanner.js
import { trackResult } from '../index';

// ...

async function displayResults(results) {
  // ...
  trackResult();
  // ...
}
```
## Step 5: Test and Verify
Test and verify that the event tracking is working correctly by checking the Google Analytics dashboard. Make sure that the events are being tracked correctly and that the referrals are being attributed to the correct sources.

By following these steps, we can set up referral tracking for the Accessibility Checker and gain insights into how users are interacting with the website.