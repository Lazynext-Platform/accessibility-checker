// src/scanner_dynamic.js

import { crawl } from './crawl.js';
import { monitor } from './monitor.js';
import { additionalRules } from './rules/additional.js';
import { wcag22Rules } from './rules/wcag22.js';

/**
 * Scans a webpage for accessibility compliance issues and provides recommendations for improvement.
 * This version of the scanner is designed to handle dynamic content.
 *
 * @param {string} url - The URL of the webpage to scan.
 * @param {object} options - Options for the scan, such as which rules to apply.
 * @returns {Promise<object>} - A promise that resolves with an object containing the scan results.
 */
async function scanDynamicContent(url, options) {
  // Crawl the webpage to get the initial HTML content
  const initialHtml = await crawl(url);

  // Monitor the webpage for dynamic content changes
  const dynamicHtml = await monitor(url, options);

  // Apply accessibility rules to the initial and dynamic HTML content
  const initialResults = applyRules(initialHtml, options);
  const dynamicResults = applyRules(dynamicHtml, options);

  // Combine the results from the initial and dynamic scans
  const combinedResults = combineResults(initialResults, dynamicResults);

  return combinedResults;
}

/**
 * Applies accessibility rules to the given HTML content.
 *
 * @param {string} html - The HTML content to apply the rules to.
 * @param {object} options - Options for the scan, such as which rules to apply.
 * @returns {object} - An object containing the scan results.
 */
function applyRules(html, options) {
  const results = {};

  // Apply additional rules
  if (options.additionalRules) {
    results.additional = additionalRules(html);
  }

  // Apply WCAG 2.2 rules
  if (options.wcag22Rules) {
    results.wcag22 = wcag22Rules(html);
  }

  return results;
}

/**
 * Combines the results from the initial and dynamic scans.
 *
 * @param {object} initialResults - The results from the initial scan.
 * @param {object} dynamicResults - The results from the dynamic scan.
 * @returns {object} - An object containing the combined scan results.
 */
function combineResults(initialResults, dynamicResults) {
  const combinedResults = { ...initialResults };

  // Combine the results from the additional rules
  if (dynamicResults.additional) {
    combinedResults.additional = { ...combinedResults.additional, ...dynamicResults.additional };
  }

  // Combine the results from the WCAG 2.2 rules
  if (dynamicResults.wcag22) {
    combinedResults.wcag22 = { ...combinedResults.wcag22, ...dynamicResults.wcag22 };
  }

  return combinedResults;
}

export { scanDynamicContent };