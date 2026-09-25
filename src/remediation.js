// File: src/remediation.js
import {PLATFORM} from '../worker.js';

/**
 * Provides per-finding remediation guidance.
 */
export class RemediationGuidance {
  /**
   * Initializes the remediation guidance module.
   */
  constructor() {
    this.guidance = {};
  }

  /**
   * Adds remediation guidance for a specific finding.
   * @param {string} finding - The finding to add guidance for.
   * @param {string} guidance - The remediation guidance for the finding.
   */
  addGuidance(finding, guidance) {
    this.guidance[finding] = guidance;
  }

  /**
   * Retrieves remediation guidance for a specific finding.
   * @param {string} finding - The finding to retrieve guidance for.
   * @returns {string} The remediation guidance for the finding, or null if not found.
   */
  getGuidance(finding) {
    return this.guidance[finding] || null;
  }

  /**
   * Saves the remediation guidance to the platform KV storage.
   */
  async saveGuidance() {
    try {
      await PLATFORM.kv.put('remediation-guidance', JSON.stringify(this.guidance));
    } catch (error) {
      throw new Error(`Failed to save remediation guidance: ${error.message}`);
    }
  }

  /**
   * Loads the remediation guidance from the platform KV storage.
   */
  async loadGuidance() {
    try {
      const storedGuidance = await PLATFORM.kv.get('remediation-guidance');
      if (storedGuidance) {
        this.guidance = JSON.parse(storedGuidance);
      }
    } catch (error) {
      throw new Error(`Failed to load remediation guidance: ${error.message}`);
    }
  }
}