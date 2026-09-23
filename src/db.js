// File: src/db.js
import { PLATFORM } from '../env.js';

const getTrialUsers = async () => {
  try {
    const response = await fetch(`${PLATFORM}/kv/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: 'trial-users' }),
    });

    if (!response.ok) {
      throw new Error(`Error getting trial users: ${response.status}`);
    }

    const trialUsers = await response.json();
    return trialUsers;
  } catch (error) {
    console.error('Error getting trial users:', error);
  }
};

export { getTrialUsers };