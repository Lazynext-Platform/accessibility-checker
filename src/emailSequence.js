// File: src/emailSequence.js
import { sendEmail } from '../email.js';
import { getTrialUsers } from '../db.js';
import { PLATFORM } from '../env.js';

const emailSequence = async () => {
  try {
    const trialUsers = await getTrialUsers();
    trialUsers.forEach((user) => {
      sendEmail({
        to: user.email,
        subject: 'Your trial is starting',
        body: 'Welcome to our trial sequence',
      });
      // Send follow-up emails after 3 and 7 days
      setTimeout(async () => {
        sendEmail({
          to: user.email,
          subject: 'How are you doing?',
          body: 'Checking in on your progress',
        });
      }, 3 * 24 * 60 * 60 * 1000);
      setTimeout(async () => {
        sendEmail({
          to: user.email,
          subject: 'Last chance to upgrade',
          body: 'Your trial is ending soon',
        });
      }, 7 * 24 * 60 * 60 * 1000);
    });
  } catch (error) {
    console.error('Error sending email sequence:', error);
  }
};

export { emailSequence };