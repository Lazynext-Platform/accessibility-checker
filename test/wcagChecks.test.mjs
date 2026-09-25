// File: test/wcagChecks.test.mjs
import { WcagChecks } from '../src/wcagChecks.js';

describe('WcagChecks', () => {
  it('should check for WCAG 2.5.8 - Pointer Gestures', () => {
    const wcagChecks = new WcagChecks();
    const page = { hasPointerGestures: false };
    const errors = wcagChecks.checkPointerGestures(page);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('WCAG-2.5.8');
    expect(errors[0].message).toBe('Pointer gestures are not supported');
  });

  it('should check for WCAG 2.4.11 - Focus Appearance', () => {
    const wcagChecks = new WcagChecks();
    const page = { hasFocusAppearance: false };
    const errors = wcagChecks.checkFocusAppearance(page);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('WCAG-2.4.11');
    expect(errors[0].message).toBe('Focus appearance is not supported');
  });

  it('should not return errors when WCAG 2.5.8 - Pointer Gestures is supported', () => {
    const wcagChecks = new WcagChecks();
    const page = { hasPointerGestures: true };
    const errors = wcagChecks.checkPointerGestures(page);
    expect(errors.length).toBe(0);
  });

  it('should not return errors when WCAG 2.4.11 - Focus Appearance is supported', () => {
    const wcagChecks = new WcagChecks();
    const page = { hasFocusAppearance: true };
    const errors = wcagChecks.checkFocusAppearance(page);
    expect(errors.length).toBe(0);
  });
});