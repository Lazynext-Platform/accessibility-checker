// File: src/deep-keyboard-trap-detector.js
import { validateTrap } from './shared-validator.js';

/**
 * Detects deep keyboard traps in the given HTML element.
 * 
 * @param {string} html - The HTML element to check for keyboard traps.
 * @returns {boolean} True if a deep keyboard trap is detected, false otherwise.
 */
export function detectDeepKeyboardTrap(html) {
  try {
    // Parse the HTML element
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get all focusable elements
    const focusableElements = doc.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    // Check each focusable element for deep keyboard traps
    for (const element of focusableElements) {
      if (validateTrap(element)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // Handle parsing errors
    console.error('Error parsing HTML:', error);
    return false;
  }
}