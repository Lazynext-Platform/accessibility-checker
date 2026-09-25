// File: test/deep-keyboard-trap-detector.test.mjs
import { detectDeepKeyboardTrap } from '../src/deep-keyboard-trap-detector.js';

describe('Deep Keyboard Trap Detector', () => {
  it('detects deep keyboard traps', () => {
    const html = '<div tabindex="0" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;"></div>';
    expect(detectDeepKeyboardTrap(html)).toBe(true);
  });
  
  it('does not detect deep keyboard traps', () => {
    const html = '<button>Click me</button>';
    expect(detectDeepKeyboardTrap(html)).toBe(false);
  });
  
  it('handles parsing errors', () => {
    const html = '<invalid-html>';
    expect(detectDeepKeyboardTrap(html)).toBe(false);
  });
});