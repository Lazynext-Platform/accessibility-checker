// File: test/wcag21.test.mjs
import { WCAG21Scanner } from '../src/wcag21.js';

describe('WCAG21Scanner', () => {
  it('should detect missing alt text on images', async () => {
    const html = '<html><body><img src="image.jpg"></body></html>';
    const scanner = new WCAG21Scanner();
    const scanResults = await scanner.scan(html);

    expect(scanResults.errors.length).toBe(1);
    expect(scanResults.errors[0].message).toBe('Missing alt text on image: image.jpg');
  });

  it('should detect insufficient color contrast', async () => {
    const html = '<html><body><div style="background-color: #fff; color: #fff">Text</div></body></html>';
    const scanner = new WCAG21Scanner();
    const scanResults = await scanner.scan(html);

    expect(scanResults.errors.length).toBe(1);
    expect(scanResults.errors[0].message).toBe('Insufficient color contrast on element: DIV');
  });

  it('should detect missing labels on form elements', async () => {
    const html = '<html><body><input type="text" name="username"></body></html>';
    const scanner = new WCAG21Scanner();
    const scanResults = await scanner.scan(html);

    expect(scanResults.errors.length).toBe(1);
    expect(scanResults.errors[0].message).toBe('Missing label on form element: username');
  });
});