// File: src/notifications.js
import { BREVO_EMAIL } from '../constants';

/**
 * Send alert to developers via email.
 * @param {string} subject - Email subject
 * @param {Object} metadata - Additional email metadata
 */
export async function sendAlert(subject, metadata) {
  try {
    // Send email using Brevo email service
    await BREVO_EMAIL.send({
      to: 'developers@example.com',
      subject,
      text: JSON.stringify(metadata),
    });
  } catch (error) {
    // Handle email sending error
    console.error('Error sending alert:', error);
  }
}

// Test for sendAlert function
import { test, expect } from '../tests/test.js';

test('sendAlert', async () => {
  // Mock Brevo email service
  const brevoEmailMock = jest.fn();
  BREVO_EMAIL.send.mockImplementation(brevoEmailMock);

  // Call sendAlert function
  await sendAlert('Test subject', { foo: 'bar' });

  // Expect Brevo email service to be called with correct arguments
  expect(brevoEmailMock).toHaveBeenCalledTimes(1);
  expect(brevoEmailMock).toHaveBeenCalledWith({
    to: 'developers@example.com',
    subject: 'Test subject',
    text: JSON.stringify({ foo: 'bar' }),
  });
});