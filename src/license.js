// File: src/license.js
import { DodoCheckout } from '../api/dodoCheckout';
import { PLATFORM } from '../env';
import { KV } from '../platform/kv';
import { sendEmail } from '../api/brevo';

const FREE_TRIAL_DAYS = 30;

export async function integrateFreeTrialProLicense(userId) {
  try {
    // Get user's current license
    const userLicense = await KV.get(`license:${userId}`);
    if (userLicense && userLicense.pro) {
      // User already has a Pro license, do not integrate free trial
      return;
    }

    // Create a new Pro license with free trial
    const newLicense = {
      pro: true,
      trial: true,
      expiresAt: Date.now() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000,
    };

    // Update user's license in KV
    await KV.put(`license:${userId}`, newLicense);

    // Send email to user about free trial
    await sendEmail({
      to: userId,
      subject: 'Free Trial of Pro License',
      body: `You have been granted a free trial of our Pro license for ${FREE_TRIAL_DAYS} days.`,
    });

    // Integrate with Dodo checkout
    const checkout = new DodoCheckout(PLATFORM.DODO_CHECKOUT_API_KEY);
    await checkout.createSubscription({
      userId,
      plan: 'pro',
      trialDays: FREE_TRIAL_DAYS,
    });
  } catch (error) {
    // Handle error explicitly
    console.error(`Error integrating free trial Pro license: ${error}`);
    throw error;
  }
}