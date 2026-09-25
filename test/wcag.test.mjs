// File: test/wcag.test.mjs
import { generateWcagReport } from '../src/wcag.js';
import { Scanner } from '../src/scanner.js';

describe('WCAG reporting functionality', () => {
  it('should generate a report based on WCAG guidelines', async () => {
    const scanner = new Scanner();
    const report = await generateWcagReport(scanner);
    expect(report).toBeInstanceOf(Object);
    expect(report['1.1.1']).toBeDefined();
    expect(report['1.1.1'].name).toBe('Non-text Content');
  });

  it('should handle errors when generating the report', async () => {
    const scanner = new Scanner();
    // Simulate an error
    jest.spyOn(scanner, 'scanForElements').mockRejectedValue(new Error('Test error'));
    const report = await generateWcagReport(scanner);
    expect(report).toBeInstanceOf(Object);
    expect(report).toEqual({});
  });

  it('should check if a page element meets a specific WCAG guideline', async () => {
    const element = {
      tagName: 'IMG',
      hasAttribute: jest.fn().mockReturnValue(true),
    };
    const guideline = '1.1.1';
    const result = await checkWcagGuideline(element, guideline);
    expect(result).toBe(true);
  });
});