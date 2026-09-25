// File: test/shared-validator.test.mjs
import { validateTrap } from '../src/shared-validator.js';

describe('Shared Validator', () => {
  it('validates deep keyboard traps', () => {
    const element = document.createElement('div');
    element.setAttribute('tabindex', '0');
    expect(validateTrap(element)).toBe(true);
  });
  
  it('does not validate deep keyboard traps', () => {
    const element = document.createElement('button');
    expect(validateTrap(element)).toBe(false);
  });
  
  it('handles validation errors', () => {
    const element = null;
    expect(validateTrap(element)).toBe(false);
  });
});