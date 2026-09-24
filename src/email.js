// File: src/email.js
import { sendEmail as brevoSendEmail } from '@cloudflare/brevo';

async function sendEmail(report) {
  const email = {
    to: 'example@example.com',
    subject: 'Accessibility Report',
    body: `Report for ${report.url}: ${report.results.length} issues found`,
  };
  await brevoSendEmail(email);
}

export { sendEmail };