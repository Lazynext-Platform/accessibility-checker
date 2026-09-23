// File: src/emailSequence.js
import { sendEmail } from '../email';
import { getLicense, updateLicense } from '../kv';
import { getPlatformServiceBinding } from '../platform';

const EMAIL_SEQUENCE = [
  {
    day: 3,
    subject: 'Getting started with Accessibility Checker',
    body: 'Welcome to Accessibility Checker! We hope you\'re enjoying your free trial so far.',
  },
  {
    day: 7,
    subject: 'Unlock the full potential of Accessibility Checker',
    body: 'Your free trial is halfway through. Consider upgrading to a paid plan to unlock more features.',
  },
  {
    day: 14,
    subject: 'Last chance to upgrade before your trial ends',
    body: 'Your free trial is ending soon. Don\'t miss out on the opportunity to upgrade to a paid plan.',
  },
];

export async function sendEmailSequence(userId) {
  try {
    const license = await getLicense(userId);
    if (!license || license.status !== 'trial') return;

    const today = new Date();
    const trialStartDate = new Date(license.startDate);
    const daysSinceTrialStarted = Math.floor((today - trialStartDate) / (1000 * 3600 * 24));

    const emailToSent = EMAIL_SEQUENCE.find((email) => email.day === daysSinceTrialStarted);
    if (emailToSent) {
      await sendEmail({
        to: license.email,
        subject: emailToSent.subject,
        body: emailToSent.body,
      });
    }
  } catch (error) {
    console.error('Error sending email sequence:', error);
  }
}