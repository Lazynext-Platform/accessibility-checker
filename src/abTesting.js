// File: src/abTesting.js
class ABTesting {
  constructor() {
    this.testingEnabled = false;
    this.testVariations = {};
  }

  enableTesting() {
    this.testingEnabled = true;
  }

  disableTesting() {
    this.testingEnabled = false;
  }

  addTestVariation(testName, variation) {
    if (!this.testVariations[testName]) {
      this.testVariations[testName] = [];
    }
    this.testVariations[testName].push(variation);
  }

  getTestVariation(testName) {
    if (!this.testingEnabled) return null;
    const variations = this.testVariations[testName];
    if (!variations) return null;
    const randomIndex = Math.floor(Math.random() * variations.length);
    return variations[randomIndex];
  }
}

export default ABTesting;