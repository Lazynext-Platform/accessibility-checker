// File: test/remediation.test.mjs
import {RemediationGuidance} from '../src/remediation.js';

describe('RemediationGuidance', () => {
  let guidance;

  beforeEach(() => {
    guidance = new RemediationGuidance();
  });

  it('should add and retrieve guidance', () => {
    const finding = 'finding-1';
    const guidanceText = 'This is the guidance for finding-1';
    guidance.addGuidance(finding, guidanceText);
    expect(guidance.getGuidance(finding)).toBe(guidanceText);
  });

  it('should return null for unknown findings', () => {
    const finding = 'unknown-finding';
    expect(guidance.getGuidance(finding)).toBeNull();
  });

  it('should save and load guidance', async () => {
    const finding = 'finding-2';
    const guidanceText = 'This is the guidance for finding-2';
    guidance.addGuidance(finding, guidanceText);
    await guidance.saveGuidance();
    const loadedGuidance = new RemediationGuidance();
    await loadedGuidance.loadGuidance();
    expect(loadedGuidance.getGuidance(finding)).toBe(guidanceText);
  });

  it('should handle errors when saving guidance', async () => {
    jest.spyOn(PLATFORM.kv, 'put').mockRejectedValue(new Error('Mocked error'));
    await expect(guidance.saveGuidance()).rejects.toThrowError('Failed to save remediation guidance: Mocked error');
  });

  it('should handle errors when loading guidance', async () => {
    jest.spyOn(PLATFORM.kv, 'get').mockRejectedValue(new Error('Mocked error'));
    await expect(guidance.loadGuidance()).rejects.toThrowError('Failed to load remediation guidance: Mocked error');
  });
});