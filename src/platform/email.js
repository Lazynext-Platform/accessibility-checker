// File: src/platform/email.js
import { PLATFORM } from '../env.js';

/**
 * Email service interface.
 */
export const sendEmail = async (options) => {
  try {
    const response = await fetch(`${PLATFORM}/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};