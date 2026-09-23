// File: src/rules/additional.js
export const additionalRules = [
  {
    id: '1.4.3',
    name: 'contrast-AAA',
    description: 'The contrast between the background and foreground colors should be at least 7:1 for normal text.',
    check: (element) => {
      const contrastRatio = getContrastRatio(element);
      return contrastRatio >= 7;
    },
  },
  {
    id: '2.4.7',
    name: 'focus-visible',
    description: 'The focus indicator should be visible when an element receives focus.',
    check: (element) => {
      const hasVisibleFocus = element.matches(':focus-visible');
      return hasVisibleFocus;
    },
  },
  {
    id: '3.2.3',
    name: 'consistent-navigation',
    description: 'The navigation should be consistent throughout the website.',
    check: (element) => {
      const navigationElements = element.querySelectorAll('nav');
      const navigationLength = navigationElements.length;
      for (let i = 0; i < navigationLength; i++) {
        if (navigationElements[i].innerHTML !== navigationElements[0].innerHTML) {
          return false;
        }
      }
      return true;
    },
  },
  {
    id: '3.3.2',
    name: 'labels-or-instructions',
    description: 'Labels or instructions should be provided for form fields.',
    check: (element) => {
      const formFields = element.querySelectorAll('input, textarea, select');
      const formFieldLength = formFields.length;
      for (let i = 0; i < formFieldLength; i++) {
        if (!formFields[i].hasAttribute('aria-label') && !formFields[i].hasAttribute('label')) {
          return false;
        }
      }
      return true;
    },
  },
  {
    id: '1.4.10',
    name: 'reflow',
    description: 'The content should reflow when the screen is resized.',
    check: (element) => {
      const content = element.querySelector('main');
      const initialHeight = content.offsetHeight;
      const initialWidth = content.offsetWidth;
      element.style.width = '100vw';
      element.style.height = '100vh';
      const newHeight = content.offsetHeight;
      const newWidth = content.offsetWidth;
      element.style.width = '';
      element.style.height = '';
      return newHeight !== initialHeight || newWidth !== initialWidth;
    },
  },
  {
    id: '2.5.3',
    name: 'label-in-name',
    description: 'The accessible name of a control should include the text of its visible label.',
    check: (element) => {
      const labels = element.querySelectorAll('label');
      const labelLength = labels.length;
      for (let i = 0; i < labelLength; i++) {
        const label = labels[i];
        const control = label.control;
        if (control && !control.getAttribute('aria-label').includes(label.textContent)) {
          return false;
        }
      }
      return true;
    },
  },
  {
    id: '1.4.4',
    name: 'resize-text',
    description: 'The text should be resizable up to 200% without assistive technologies.',
    check: (element) => {
      const textElements = element.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
      const textElementLength = textElements.length;
      for (let i = 0; i < textElementLength; i++) {
        const textElement = textElements[i];
        textElement.style.fontSize = '200%';
        if (textElement.offsetWidth > element.offsetWidth) {
          return false;
        }
      }
      return true;
    },
  },
  {
    id: '3.1.2',
    name: 'language-of-parts',
    description: 'The language of each part of the content should be identified.',
    check: (element) => {
      const language = element.lang;
      const parts = element.querySelectorAll('[lang]');
      const partLength = parts.length;
      for (let i = 0; i < partLength; i++) {
        if (parts[i].lang !== language) {
          return true;
        }
      }
      return false;
    },
  },
  {
    id: '2.4.6',
    name: 'headings-and-labels',
    description: 'Headings and labels should be descriptive and consistent.',
    check: (element) => {
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLength = headings.length;
      for (let i = 0; i < headingLength; i++) {
        if (!headings[i].textContent.trim()) {
          return false;
        }
      }
      const labels = element.querySelectorAll('label');
      const labelLength = labels.length;
      for (let i = 0; i < labelLength; i++) {
        if (!labels[i].textContent.trim()) {
          return false;
        }
      }
      return true;
    },
  },
  {
    id: '4.1.3',
    name: 'status-messages',
    description: 'Status messages should be presented to the user in a way that they can be perceived.',
    check: (element) => {
      const statusMessages = element.querySelectorAll('[role="status"]');
      const statusMessageLength = statusMessages.length;
      for (let i = 0; i < statusMessageLength; i++) {
        if (!statusMessages[i].getAttribute('aria-live')) {
          return false;
        }
      }
      return true;
    },
  },
];

function getContrastRatio(element) {
  const backgroundColor = element.style.backgroundColor;
  const foregroundColor = element.style.color;
  const backgroundLuminance = getLuminance(backgroundColor);
  const foregroundLuminance = getLuminance(foregroundColor);
  const contrastRatio = (Math.max(backgroundLuminance, foregroundLuminance) + 0.05) / (Math.min(backgroundLuminance, foregroundLuminance) + 0.05);
  return contrastRatio;
}

function getLuminance(color) {
  const rgb = hexToRgb(color);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}