// File: src/worker.js
import {PLATFORM} from '../env.js';
import {kv} from '../storage.js';
import ReferralProgram from './referral.js';

/**
 * Handle referral program requests.
 * 
 * @param {Request} request - The incoming request.
 * @returns {Response} The response to the request.
 */
async function handleReferralRequest(request) {
  try {
    const customerId = await kv.get('customerId');
    const referralProgram = new ReferralProgram(customerId);

    if (request.method === 'POST') {
      const referralLink = await referralProgram.generateReferralLink();
      return new Response(referralLink, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else if (request.method === 'GET') {
      const referralRewards = await referralProgram.getReferralRewards();
      return new Response(JSON.stringify(referralRewards), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else if (request.method === 'PUT') {
      const rewards = await request.json();
      await referralProgram.updateReferralRewards(rewards);
      return new Response('Referral rewards updated', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response('Method not allowed', {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export default {
  async fetch(request) {
    if (request.url.includes('/referral')) {
      return handleReferralRequest(request);
    } else {
      return new Response('Not found', {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
};