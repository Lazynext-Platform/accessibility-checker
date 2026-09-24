// File: src/email.js
import { PLATFORM } from '../env.js';

/**
 * Sends an email using Brevo.
 * @param {object} emailData - The email data object.
 */
export async function sendEmail(emailData) {
  try {
    const response = await fetch(`${PLATFORM}/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) {
      throw new Error(`Error sending email: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}