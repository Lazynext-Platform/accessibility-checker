// File: src/utils/d1.js
import { PLATFORM } from '../utils/env';

const D1 = {
  query: async (query, params) => {
    const response = await fetch(`${PLATFORM}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params }),
    });
    const result = await response.json();
    return result;
  },
};

export { D1 };