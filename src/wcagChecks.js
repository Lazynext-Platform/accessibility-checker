// File: src/wcagChecks.js
import { Scanner } from './scanner.js';

class WcagChecks {
  /**
   * Checks for WCAG 2.5.8 - Pointer Gestures
   * @param {Object} page - The page object to check
   * @returns {Array} - An array of errors
   */
  checkPointerGestures(page) {
    const errors = [];
    // Check for pointer gestures
    if (!page.hasPointerGestures) {
      errors.push({
        code: 'WCAG-2.5.8',
        message: 'Pointer gestures are not supported',
      });
    }
    return errors;
  }

  /**
   * Checks for WCAG 2.4.11 - Focus Appearance
   * @param {Object} page - The page object to check
   * @returns {Array} - An array of errors
   */
  checkFocusAppearance(page) {
    const errors = [];
    // Check for focus appearance
    if (!page.hasFocusAppearance) {
      errors.push({
        code: 'WCAG-2.4.11',
        message: 'Focus appearance is not supported',
      });
    }
    return errors;
  }
}

export { WcagChecks };