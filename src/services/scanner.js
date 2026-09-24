// File: src/services/scanner.js
import { fetch } from 'worker-fetch';
import { JSDOM } from 'jsdom';
import { axe } from 'axe-core';

const scan = async (url) => {
  try {
    // Fetch HTML content
    const response = await fetch(url);
    const html = await response.text();

    // Create JSDOM instance
    const dom = new JSDOM(html);

    // Run axe-core scan
    const results = await axe.run(dom.window.document);

    // Extract violations
    const violations = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
    }));

    return { url, violations };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { scan };