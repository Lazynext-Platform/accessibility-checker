// File: src/task-retry.js
import {PLATFORM} from '../env.js';

/**
 * Resolves QA alert by retrying failed task with exponential backoff.
 * @param {string} taskId - ID of the task to retry.
 * @param {number} maxAttempts - Maximum number of attempts to retry the task.
 * @param {number} initialDelay - Initial delay between attempts in milliseconds.
 * @param {number} backoffFactor - Factor to increase delay between attempts.
 */
export async function resolveQaAlert(taskId, maxAttempts = 5, initialDelay = 1000, backoffFactor = 2) {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxAttempts) {
    try {
      // Call platform API to retry task
      const response = await fetch(`${PLATFORM}/api/v1/tasks/${taskId}/retry`, {
        method: 'POST',
      });

      if (response.ok) {
        // Task retried successfully, return
        return;
      } else {
        // Task retry failed, throw error
        throw new Error(`Task retry failed with status ${response.status}`);
      }
    } catch (error) {
      // Task retry failed, log error and retry after delay
      console.error(`Task retry failed: ${error.message}`);
      await new Promise(resolve => globalThis.setTimeout(resolve, delay));
      attempt++;
      delay *= backoffFactor;
    }
  }

  // All attempts failed, throw error
  throw new Error(`All attempts failed to retry task ${taskId}`);
}