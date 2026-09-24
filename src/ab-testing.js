// File: src/ab-testing.js
class ABTesting {
  constructor() {
    this.variants = {};
    this.currentVariant = null;
  }

  // Function to define A/B testing variants
  defineVariant(name, element) {
    this.variants[name] = element;
  }

  // Function to get the current variant
  getVariant() {
    return this.currentVariant;
  }

  // Function to set the current variant
  setVariant(name) {
    this.currentVariant = name;
  }

  // Function to render the current variant
  renderVariant() {
    const currentVariant = this.getVariant();
    if (currentVariant) {
      const variantElement = this.variants[currentVariant];
      document.body.appendChild(variantElement);
    }
  }
}

export default ABTesting;