// src/kv.js
import { fetch } from 'node-fetch';

const get = async (namespace, key) => {
  try {
    const response = await fetch(`${process.env.PLATFORM}/kv/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ namespace, key }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get value: ${response.status} ${response.statusText}`);
    }

    const value = await response.json();
    return value;
  } catch (error) {
    console.error('Error getting value:', error);
  }
};

const put = async (namespace, key, value) => {
  try {
    const response = await fetch(`${process.env.PLATFORM}/kv/put`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ namespace, key, value }),
    });

    if (!response.ok) {
      throw new Error(`Failed to put value: ${response.status} ${response.statusText}`);
    }

    console.log('Value stored successfully');
  } catch (error) {
    console.error('Error storing value:', error);
  }
};

export { get, put };