// File: src/wcag21.js
import { ScannerEngine } from './scanner.js';

class WCAG21Scanner {
  /**
   * Initialize the WCAG 2.1 scanner.
   * @param {ScannerEngine} scannerEngine - The scanner engine instance.
   */
  constructor(scannerEngine) {
    this.scannerEngine = scannerEngine;
  }

  /**
   * Detect and report WCAG 2.1 guideline violations.
   * @param {string} html - The HTML content to scan.
   * @returns {Promise<object>} A promise resolving to an object containing the scan results.
   */
  async scan(html) {
    try {
      // Parse the HTML content
      const parsedHtml = new DOMParser().parseFromString(html, 'text/html');

      // Initialize the scan results object
      const scanResults = {
        errors: [],
        warnings: [],
      };

      // Check for WCAG 2.1 guideline violations
      this.checkForMissingAltText(parsedHtml, scanResults);
      this.checkForInsufficientColorContrast(parsedHtml, scanResults);
      this.checkForMissingLabel(parsedHtml, scanResults);

      return scanResults;
    } catch (error) {
      // Handle errors explicitly
      throw new Error(`Error scanning for WCAG 2.1 guideline violations: ${error.message}`);
    }
  }

  /**
   * Check for missing alt text on images.
   * @param {Document} parsedHtml - The parsed HTML content.
   * @param {object} scanResults - The scan results object.
   */
  checkForMissingAltText(parsedHtml, scanResults) {
    const images = parsedHtml.querySelectorAll('img');

    images.forEach((image) => {
      if (!image.alt) {
        scanResults.errors.push({
          message: `Missing alt text on image: ${image.src}`,
          severity: 'error',
        });
      }
    });
  }

  /**
   * Check for insufficient color contrast.
   * @param {Document} parsedHtml - The parsed HTML content.
   * @param {object} scanResults - The scan results object.
   */
  checkForInsufficientColorContrast(parsedHtml, scanResults) {
    const elements = parsedHtml.querySelectorAll('*');

    elements.forEach((element) => {
      const backgroundColor = element.style.backgroundColor;
      const color = element.style.color;

      if (backgroundColor && color) {
        const contrastRatio = this.calculateContrastRatio(backgroundColor, color);

        if (contrastRatio < 4.5) {
          scanResults.errors.push({
            message: `Insufficient color contrast on element: ${element.tagName}`,
            severity: 'error',
          });
        }
      }
    });
  }

  /**
   * Check for missing labels on form elements.
   * @param {Document} parsedHtml - The parsed HTML content.
   * @param {object} scanResults - The scan results object.
   */
  checkForMissingLabel(parsedHtml, scanResults) {
    const formElements = parsedHtml.querySelectorAll('input, select, textarea');

    formElements.forEach((formElement) => {
      if (!formElement.labels.length) {
        scanResults.errors.push({
          message: `Missing label on form element: ${formElement.name}`,
          severity: 'error',
        });
      }
    });
  }

  /**
   * Calculate the contrast ratio between two colors.
   * @param {string} color1 - The first color.
   * @param {string} color2 - The second color.
   * @returns {number} The contrast ratio.
   */
  calculateContrastRatio(color1, color2) {
    const lum1 = this.calculateRelativeLuminance(color1);
    const lum2 = this.calculateRelativeLuminance(color2);

    const contrastRatio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

    return contrastRatio;
  }

  /**
   * Calculate the relative luminance of a color.
   * @param {string} color - The color.
   * @returns {number} The relative luminance.
   */
  calculateRelativeLuminance(color) {
    const rgb = this.hexToRgb(color);

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return lum;
  }

  /**
   * Convert a hex color to RGB.
   * @param {string} hex - The hex color.
   * @returns {object} An object containing the RGB values.
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }
}

export { WCAG21Scanner };