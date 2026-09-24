// File: src/utils/kv.js
import { PLATFORM } from '../utils/env';

const kv = {
  get: async (key) => {
    const response = await fetch(`${PLATFORM}/kv/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    const result = await response.json();
    return result.value;
  },
  put: async (key, value) => {
    await fetch(`${PLATFORM}/kv/put`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  },
};

export { kv };