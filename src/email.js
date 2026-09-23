// File: src/email.js
import { PLATFORM } from '../env.js';

const sendEmail = async ({ to, subject, body }) => {
  try {
    const response = await fetch(`${PLATFORM}/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, body }),
    });

    if (!response.ok) {
      throw new Error(`Error sending email: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export { sendEmail };