import { accessibilityCheckerAlgorithm } from '../research/accessibility_checker_algorithm';
import { wcagCoverage } from '../docs/wcag-coverage';

/**
 * Provides a deeper WCAG coverage by scanning the website for accessibility compliance issues
 * and providing recommendations for improvement.
 *
 * @param {string} websiteUrl - The URL of the website to scan
 * @returns {Promise<object>} A promise that resolves with an object containing the scan results
 */
async function deeperWcagCoverage(websiteUrl) {
  const scanResults = await accessibilityCheckerAlgorithm(websiteUrl);
  const wcagComplianceIssues = [];

  // Iterate over the scan results and check for WCAG compliance issues
  for (const issue of scanResults) {
    if (issue.type === 'wcag') {
      wcagComplianceIssues.push(issue);
    }
  }

  // Provide recommendations for improvement
  const recommendations = wcagComplianceIssues.map((issue) => {
    return {
      issue: issue.description,
      recommendation: getRecommendation(issue.code),
    };
  });

  return { wcagComplianceIssues, recommendations };
}

/**
 * Returns a recommendation for improving a WCAG compliance issue
 *
 * @param {string} code - The code of the WCAG compliance issue
 * @returns {string} A recommendation for improvement
 */
function getRecommendation(code) {
  switch (code) {
    case '1.1.1':
      return 'Add alternative text to the image';
    case '1.4.3':
      return 'Ensure the contrast between the text and the background is sufficient';
    case '2.4.4':
      return 'Provide a clear and consistent navigation';
    default:
      return 'Please refer to the WCAG guidelines for more information';
  }
}

export { deeperWcagCoverage };