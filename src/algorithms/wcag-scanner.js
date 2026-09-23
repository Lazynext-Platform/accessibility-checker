```javascript
/**
 * WCAG 2.1 scanning algorithm implementation.
 * 
 * This module provides functions to scan a website for accessibility compliance issues
 * based on the Web Content Accessibility Guidelines (WCAG) 2.1.
 * 
 * @module wcag-scanner
 */

// Import required modules
const { JSDOM } = require('jsdom');
const colorConverter = require('color-convert');

// Function to calculate relative luminance
function calculateRelativeLuminance(rgb) {
    const R = rgb[0] / 255;
    const G = rgb[1] / 255;
    const B = rgb[2] / 255;

    const r = R <= 0.03928 ? R / 12.92 : Math.pow((R + 0.055) / 1.055, 2.4);
    const g = G <= 0.03928 ? G / 12.92 : Math.pow((G + 0.055) / 1.055, 2.4);
    const b = B <= 0.03928 ? B / 12.92 : Math.pow((B + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Function to check contrast ratio
function checkContrastRatio(foreground, background) {
    const foregroundLuminance = calculateRelativeLuminance(foreground);
    const backgroundLuminance = calculateRelativeLuminance(background);

    const contrastRatio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);

    return contrastRatio >= 4.5; // Minimum contrast ratio for normal text
}

// Function to check color contrast
function checkColorContrast(element) {
    const foregroundColor = colorConverter.hex.rgb(element.style.color);
    const backgroundColor = colorConverter.hex.rgb(element.style.backgroundColor);

    return checkContrastRatio(foregroundColor, backgroundColor);
}

// Function to check image alt text
function checkImageAltText(image) {
    return image.alt !== '';
}

// Function to check link text
function checkLinkText(link) {
    return link.textContent.trim() !== '';
}

// Function to check heading order
function checkHeadingOrder(headings) {
    let currentLevel = 0;

    for (const heading of headings) {
        const level = parseInt(heading.tagName.substring(1));

        if (level > currentLevel + 1) {
            return false;
        }

        currentLevel = level;
    }

    return true;
}

// Function to scan a website for accessibility compliance issues
function scanWebsite(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const issues = [];

    // Check color contrast for all text elements
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
    for (const element of textElements) {
        if (!checkColorContrast(element)) {
            issues.push({
                type: 'color-contrast',
                element: element.outerHTML,
                message: 'Insufficient color contrast'
            });
        }
    }

    // Check image alt text
    const images = document.querySelectorAll('img');
    for (const image of images) {
        if (!checkImageAltText(image)) {
            issues.push({
                type: 'image-alt-text',
                element: image.outerHTML,
                message: 'Missing alt text for image'
            });
        }
    }

    // Check link text
    const links = document.querySelectorAll('a');
    for (const link of links) {
        if (!checkLinkText(link)) {
            issues.push({
                type: 'link-text',
                element: link.outerHTML,
                message: 'Missing link text'
            });
        }
    }

    // Check heading order
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (!checkHeadingOrder(headings)) {
        issues.push({
            type: 'heading-order',
            element: headings[0].outerHTML,
            message: 'Incorrect heading order'
        });
    }

    return issues;
}

module.exports = scanWebsite;
```