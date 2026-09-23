// File: src/referral.js
import {PLATFORM} from '../env.js';
import {kv} from '../storage.js';

/**
 * Referral program for existing customers.
 * 
 * @class ReferralProgram
 */
class ReferralProgram {
  /**
   * Initialize the referral program.
   * 
   * @param {string} customerId - The ID of the customer.
   */
  constructor(customerId) {
    this.customerId = customerId;
  }

  /**
   * Generate a referral link for the customer.
   * 
   * @returns {string} The referral link.
   */
  async generateReferralLink() {
    try {
      const response = await fetch(`${PLATFORM}/api/v1/referral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({customerId: this.customerId})
      });

      if (!response.ok) {
        throw new Error(`Failed to generate referral link: ${response.statusText}`);
      }

      const referralLink = await response.json();
      return referralLink.link;
    } catch (error) {
      throw new Error(`Failed to generate referral link: ${error.message}`);
    }
  }

  /**
   * Get the referral rewards for the customer.
   * 
   * @returns {object} The referral rewards.
   */
  async getReferralRewards() {
    try {
      const response = await fetch(`${PLATFORM}/api/v1/referral/rewards`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get referral rewards: ${response.statusText}`);
      }

      const referralRewards = await response.json();
      return referralRewards;
    } catch (error) {
      throw new Error(`Failed to get referral rewards: ${error.message}`);
    }
  }

  /**
   * Update the referral rewards for the customer.
   * 
   * @param {object} rewards - The updated referral rewards.
   */
  async updateReferralRewards(rewards) {
    try {
      const response = await fetch(`${PLATFORM}/api/v1/referral/rewards`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rewards)
      });

      if (!response.ok) {
        throw new Error(`Failed to update referral rewards: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to update referral rewards: ${error.message}`);
    }
  }
}

export default ReferralProgram;