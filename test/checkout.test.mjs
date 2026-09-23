// File: test/checkout.test.mjs
import { generateCheckoutLink } from '../src/checkout.js';

describe('generateCheckoutLink', () => {
  it('should generate a checkout link with UTM parameters', () => {
    const options = {
      utmSource: 'test-source',
      utmMedium: 'test-medium',
      utmCampaign: 'test-campaign',
    };
    const expectedLink = `https://example.com/checkout?utm_source=test-source&utm_medium=test-medium&utm_campaign=test-campaign`;
    expect(generateCheckoutLink(options)).toBe(expectedLink);
  });

  it('should handle errors when generating the checkout link', () => {
    const error = new Error('Test error');
    const errorMessage = 'Error generating checkout link. Please try again.';
    expect(handleCheckoutLinkError(error)).toBe(errorMessage);
  });
});