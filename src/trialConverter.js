// File: src/trialConverter.js
import { PLATFORM } from '../env.js';
import { sendEmail } from '../email.js';
import { getLicense, updateLicense } from '../kv.js';

/**
 * Checks if a trial has expired and sends a conversion reminder if necessary.
 * @param {string} trialId - The ID of the trial license.
 */
export async function checkTrialExpiration(trialId) {
  try {
    const license = await getLicense(trialId);
    if (!license || license.status !== 'trial') return;

    const trialDuration = 30; // days
    const trialEndDate = new Date(license.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + trialDuration);

    if (new Date() > trialEndDate) {
      // Trial has expired, send conversion reminder
      await sendConversionReminder(license);
      // Update license status to 'expired'
      await updateLicense(trialId, { status: 'expired' });
    } else if (trialEndDate - new Date() < 3 * 24 * 60 * 60 * 1000) {
      // Trial is about to expire, send warning reminder
      await sendWarningReminder(license);
    }
  } catch (error) {
    console.error('Error checking trial expiration:', error);
  }
}

/**
 * Sends a conversion reminder email to the trial user.
 * @param {object} license - The trial license object.
 */
async function sendConversionReminder(license) {
  try {
    const emailData = {
      to: license.email,
      subject: 'Your free trial has expired',
      body: 'Please convert to a paid plan to continue using our service.',
    };
    await sendEmail(emailData);
  } catch (error) {
    console.error('Error sending conversion reminder:', error);
  }
}

/**
 * Sends a warning reminder email to the trial user.
 * @param {object} license - The trial license object.
 */
async function sendWarningReminder(license) {
  try {
    const emailData = {
      to: license.email,
      subject: 'Your free trial is about to expire',
      body: 'Please convert to a paid plan to continue using our service.',
    };
    await sendEmail(emailData);
  } catch (error) {
    console.error('Error sending warning reminder:', error);
  }
}