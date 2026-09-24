// File: src/storage.js
import { getPlatformKV } from '../platform.js';

/**
 * Gets trial users from platform KV.
 */
export async function getTrialUsers() {
  try {
    const kv = await getPlatformKV();
    const trialUsers = await kv.get('trialUsers');

    if (!trialUsers) {
      return [];
    }

    return JSON.parse(trialUsers);
  } catch (error) {
    console.error('Error getting trial users:', error);
    return [];
  }
}

/**
 * Updates subscription status in platform KV.
 */
export async function updateSubscription(id, status) {
  try {
    const kv = await getPlatformKV();
    const trialUsers = await getTrialUsers();

    const userIndex = trialUsers.findIndex((user) => user.id === id);

    if (userIndex !== -1) {
      trialUsers[userIndex].subscriptionStatus = status;
    }

    await kv.put('trialUsers', JSON.stringify(trialUsers));
  } catch (error) {
    console.error('Error updating subscription status:', error);
  }
}

// Test for getTrialUsers
test('getTrialUsers', async () => {
  // Mock getPlatformKV
  getPlatformKV.mockResolvedValue({
    get: jest.fn().mockResolvedValue('["{\"id\":1,\"email\":\"user1@example.com\"}","{\"id\":2,\"email\":\"user2@example.com\"}"]'),
  });

  // Call getTrialUsers
  const trialUsers = await getTrialUsers();

  // Expect trialUsers to be an array of objects
  expect(trialUsers).toBeInstanceOf(Array);
  expect(trialUsers[0]).toBeInstanceOf(Object);
  expect(trialUsers[0].id).toBe(1);
  expect(trialUsers[0].email).toBe('user1@example.com');
});

// Test for updateSubscription
test('updateSubscription', async () => {
  // Mock getPlatformKV
  getPlatformKV.mockResolvedValue({
    get: jest.fn().mockResolvedValue('["{\"id\":1,\"email\":\"user1@example.com\"}","{\"id\":2,\"email\":\"user2@example.com\"}"]'),
    put: jest.fn().mockResolvedValue(true),
  });

  // Call updateSubscription
  await updateSubscription(1, 'trial');

  // Expect getPlatformKV to be called with correct arguments
  expect(getPlatformKV).toHaveBeenCalledTimes(1);

  // Expect put to be called with correct arguments
  expect(getPlatformKV().put).toHaveBeenCalledTimes(1);
  expect(getPlatformKV().put).toHaveBeenCalledWith('trialUsers', '[{"id":1,"email":"user1@example.com","subscriptionStatus":"trial"},{"id":2,"email":"user2@example.com"}]');
});