// File: test/helpers.test.mjs
import { isEmptyString, isValidUrl, extractDomain, isValidEmail } from '../src/utils/helpers.js';

describe('helpers', () => {
  describe('isEmptyString', () => {
    it('returns true for null', () => {
      expect(isEmptyString(null)).toBe(true);
    });

    it('returns true for undefined', () => {
      expect(isEmptyString(undefined)).toBe(true);
    });

    it('returns true for empty string', () => {
      expect(isEmptyString('')).toBe(true);
    });

    it('returns false for non-empty string', () => {
      expect(isEmptyString('hello')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('returns true for valid URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('returns false for invalid URL', () => {
      expect(isValidUrl('invalid url')).toBe(false);
    });
  });

  describe('extractDomain', () => {
    it('extracts domain from URL', () => {
      expect(extractDomain('https://example.com')).toBe('example.com');
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid email address', () => {
      expect(isValidEmail('example@example.com')).toBe(true);
    });

    it('returns false for invalid email address', () => {
      expect(isValidEmail('invalid email')).toBe(false);
    });
  });
});