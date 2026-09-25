// File: src/shared-validator.js
/**
 * Validates if the given element has a deep keyboard trap.
 * 
 * @param {Element} element - The element to check for deep keyboard traps.
 * @returns {boolean} True if the element has a deep keyboard trap, false otherwise.
 */
export function validateTrap(element) {
  try {
    // Check if the element has a tabindex attribute
    if (element.hasAttribute('tabindex')) {
      // Check if the tabindex value is not -1
      if (element.getAttribute('tabindex') !== '-1') {
        // Check if the element is not focusable
        if (!element.matches('button, [href], input, select, textarea')) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    // Handle validation errors
    console.error('Error validating element:', error);
    return false;
  }
}