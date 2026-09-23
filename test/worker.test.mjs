// File: test/worker.test.mjs
import { handleRequest } from '../src/worker.js';

describe('API Endpoint', () => {
  it('should start a trial license', async () => {
    const request = new Request('/start-trial', {
      method: 'POST',
      body: JSON.stringify({ userId: 'test-user' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await handleRequest(request);
    expect(response.status).toBe(200);
    const trialLicense = await response.json();
    expect(trialLicense.type).toBe('trial');
  });

  it('should return an error if user already has a Pro license', async () => {
    const request = new Request('/start-trial', {
      method: 'POST',
      body: JSON.stringify({ userId: 'test-user' }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Mock the license system to return an error
    jest.spyOn(startTrial, 'startTrial').mockRejectedValue(
      new Error('User already has a Pro license')
    );

    const response = await handleRequest(request);
    expect(response.status).toBe(400);
    const errorMessage = await response.text();
    expect(errorMessage).toBe('User already has a Pro license');
  });
});