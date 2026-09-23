// File: src/utils/email.js
import { getPlatformClient } from './platform';

export async function sendEmail(options) {
  const platformClient = await getPlatformClient();
  await platformClient.post('/email/send', {
    to: options.to,
    subject: options.subject,
    body: options.body,
  });
}