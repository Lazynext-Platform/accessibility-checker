// File: src/errorTracker.js
import { PLATFORM_LOGS } from '../constants';
import { sendAlert } from '../notifications';

/**
 * Develop automated error tracking and alerting system using platform logs.
 * @param {Object} logs - Platform logs
 * @param {string} logs.level - Log level (e.g., 'error', 'warn', 'info')
 * @param {string} logs.message - Log message
 * @param {Object} logs.metadata - Additional log metadata
 */
export async function trackError(logs) {
  try {
    // Check if log level is error
    if (logs.level === 'error') {
      // Extract error metadata
      const { message, metadata } = logs;
      // Send alert to developers
      await sendAlert(`Error: ${message}`, metadata);
      // Store error in platform KV for future analysis
      await PLATFORM_LOGS.put(`error:${Date.now()}`, JSON.stringify(logs));
    }
  } catch (error) {
    // Handle error tracking error
    console.error('Error tracking error:', error);
  }
}

// Test for trackError function
import { test, expect } from '../tests/test.js';

test('trackError', async () => {
  // Mock platform logs
  const logs = {
    level: 'error',
    message: 'Test error message',
    metadata: { foo: 'bar' },
  };

  // Mock sendAlert function
  const sendAlertMock = jest.fn();
  sendAlert.mockImplementation(sendAlertMock);

  // Call trackError function
  await trackError(logs);

  // Expect sendAlert to be called with correct arguments
  expect(sendAlertMock).toHaveBeenCalledTimes(1);
  expect(sendAlertMock).toHaveBeenCalledWith(`Error: ${logs.message}`, logs.metadata);

  // Expect error to be stored in platform KV
  expect(PLATFORM_LOGS.put).toHaveBeenCalledTimes(1);
  expect(PLATFORM_LOGS.put).toHaveBeenCalledWith(`error:${Date.now()}`, JSON.stringify(logs));
});