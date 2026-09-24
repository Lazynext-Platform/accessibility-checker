# Referral Tracking
To measure the effectiveness of our marketing campaigns, we need to implement referral tracking. This will allow us to see which campaigns are driving the most conversions and adjust our strategy accordingly.

## Google Ads Conversions
We will be using Google Ads conversions to track the effectiveness of our campaigns. To implement this, we need to add the Google Ads conversion tracking code to our website.

### Conversion Action
The conversion action will be set to "Accessibility Scan Completed". This will trigger when a user completes an accessibility scan using our tool.

### Conversion Tracking Code
The conversion tracking code will be added to the `index.html` file. We will use the `gtag` function to track conversions.

```javascript
// Add this code to the index.html file
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXX');
</script>

// Add this code to the scanner.js file
import { gtag } from '../index.html';

// Call this function when the accessibility scan is completed
function trackConversion() {
  gtag('event', 'conversion', {
    'send_to': 'AW-XXXXXX/XXXXXX',
    'event_category': 'Accessibility Scan',
    'event_label': 'Scan Completed',
    'value': 1.0
  });
}
```

### UTM Parameters
We will also be using UTM parameters to track the source of our traffic. This will allow us to see which campaigns are driving the most conversions.

```javascript
// Add this code to the crawl.js file
import { URLSearchParams } from 'url';

// Get the UTM parameters from the URL
function getUtmParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  return { utmSource, utmMedium, utmCampaign };
}

// Call this function when the accessibility scan is completed
function trackConversion() {
  const utmParams = getUtmParams();
  gtag('event', 'conversion', {
    'send_to': 'AW-XXXXXX/XXXXXX',
    'event_category': 'Accessibility Scan',
    'event_label': 'Scan Completed',
    'value': 1.0,
    'utm_source': utmParams.utmSource,
    'utm_medium': utmParams.utmMedium,
    'utm_campaign': utmParams.utmCampaign
  });
}
```

## Referral Tracking Tests
We will be using Jest to test our referral tracking code.

```javascript
// tests/referral-tracking.test.mjs
import { gtag } from '../index.html';
import { getUtmParams } from '../crawl.js';

describe('Referral Tracking', () => {
  it('should track conversions', () => {
    const trackConversionSpy = jest.spyOn(gtag, 'event');
    trackConversion();
    expect(trackConversionSpy).toHaveBeenCalledTimes(1);
    expect(trackConversionSpy).toHaveBeenCalledWith('conversion', expect.objectContaining({
      'send_to': 'AW-XXXXXX/XXXXXX',
      'event_category': 'Accessibility Scan',
      'event_label': 'Scan Completed',
      'value': 1.0
    }));
  });

  it('should get UTM parameters', () => {
    const urlParams = new URLSearchParams('utm_source=google&utm_medium=cpc&utm_campaign=accessibility_scan');
    window.history.pushState({}, '', `?${urlParams.toString()}`);
    const utmParams = getUtmParams();
    expect(utmParams).toEqual({
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'accessibility_scan'
    });
  });
});
```

## Deployment
To deploy our referral tracking code, we need to update our `index.html` file and our `scanner.js` file. We also need to update our `crawl.js` file to get the UTM parameters from the URL.

```javascript
// package.json
"scripts": {
  "deploy": "npm run build && npm run deploy:index.html"
}

// Add this script to deploy our index.html file
"deploy:index.html": "cp index.html ../deploy/"
```

By implementing referral tracking, we can measure the effectiveness of our marketing campaigns and adjust our strategy accordingly. This will allow us to optimize our campaigns and drive more conversions.