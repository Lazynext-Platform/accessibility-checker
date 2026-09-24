// File: src/routes/user.js
import { validate } from './validate.js';
import {PLATFORM} from '../env.js';
import {kv} from '../storage.js';

/**
 * GET /api/user endpoint for retrieving user information.
 * 
 * @param {Object} request - The incoming request object.
 * @param {Object} context - The context object containing platform bindings.
 * @returns {Promise<Object>} A promise resolving to the user information response.
 */
export async function getUser(request, context) {
  try {
    // Validate the request
    const validationErrors = validate(request, {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
    });

    if (validationErrors) {
      return {
        status: 400,
        body: JSON.stringify({ error: 'Invalid request', details: validationErrors }),
      };
    }

    // Extract the user ID from the request
    const userId = request.userId;

    // Retrieve the user data from the platform KV storage
    const userData = await kv.get(`user:${userId}`);

    if (!userData) {
      return {
        status: 404,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Return the user information response
    return {
      status: 200,
      body: JSON.stringify(userData),
    };
  } catch (error) {
    // Handle any errors that occur during the request
    return {
      status: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

// Example test for the getUser endpoint
import { test, expect } from '../test.js';

test('GET /api/user', async () => {
  const request = { userId: 'example-user' };
  const context = { platform: PLATFORM };

  // Mock the kv.get method to return a sample user data
  const kvGetSpy = jest.spyOn(kv, 'get').mockResolvedValueOnce({ name: 'John Doe', email: 'john.doe@example.com' });

  const response = await getUser(request, context);

  expect(response.status).toBe(200);
  expect(response.body).toBe(JSON.stringify({ name: 'John Doe', email: 'john.doe@example.com' }));

  kvGetSpy.mockRestore();
});