// File: src/accessibility-rules.js
export const accessibilityRules = [
  {
    code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2',
    evaluate: (doc) => {
      const images = doc.querySelectorAll('img');
      const issues = [];

      images.forEach((image) => {
        if (!image.alt) {
          issues.push({
            code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2',
            message: 'Image missing alt text',
          });
        }
      });

      return issues;
    },
  },
  // Add more rules as needed
];