# Accessibility Checker Integration
The Accessibility Checker is designed to be a client-side tool, allowing small business owners and solo entrepreneurs to scan their websites for accessibility compliance issues directly in the browser. To achieve this, we need to integrate the `scanner.js` module into the `index.html` file.

## Scanner.js Overview
The `scanner.js` module is responsible for scanning a given website for accessibility issues. It uses the `crawl.js` module to crawl the website and extract relevant information, and then applies the rules defined in `src/rules` to identify accessibility issues.

## Integration Approach
To integrate the `scanner.js` module into `index.html`, we will use the following approach:

1. Create a new JavaScript file, `accessibility-checker.js`, that will serve as the entry point for the Accessibility Checker.
2. In `accessibility-checker.js`, import the `scanner.js` module and create a new instance of the scanner.
3. Use the scanner instance to scan the website and retrieve the accessibility issues.
4. Display the accessibility issues in the `index.html` file using HTML and CSS.

## accessibility-checker.js
```javascript
import { Scanner } from './src/scanner.js';

const scanner = new Scanner();

const scanWebsite = async (url) => {
  try {
    const issues = await scanner.scan(url);
    return issues;
  } catch (error) {
    console.error(error);
  }
};

export { scanWebsite };
```

## index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Checker</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Accessibility Checker</h1>
  <input id="url-input" type="text" placeholder="Enter website URL">
  <button id="scan-button">Scan</button>
  <div id="issues-container"></div>

  <script type="module" src="accessibility-checker.js"></script>
  <script>
    import { scanWebsite } from './accessibility-checker.js';

    const urlInput = document.getElementById('url-input');
    const scanButton = document.getElementById('scan-button');
    const issuesContainer = document.getElementById('issues-container');

    scanButton.addEventListener('click', async () => {
      const url = urlInput.value;
      const issues = await scanWebsite(url);
      issuesContainer.innerHTML = '';
      issues.forEach((issue) => {
        const issueElement = document.createElement('div');
        issueElement.textContent = issue.description;
        issuesContainer.appendChild(issueElement);
      });
    });
  </script>
</body>
</html>
```

## Test: accessibility-checker.test.mjs
```javascript
import { scanWebsite } from './accessibility-checker.js';

describe('Accessibility Checker', () => {
  it('scans a website and returns accessibility issues', async () => {
    const url = 'https://example.com';
    const issues = await scanWebsite(url);
    expect(issues).toBeInstanceOf(Array);
  });

  it('handles errors during scanning', async () => {
    const url = 'invalid-url';
    try {
      await scanWebsite(url);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
```