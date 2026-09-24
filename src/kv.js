// File: src/kv.js
import { env } from 'src/env';

export async function getKV(key) {
  try {
    const response = await env.KV.get(key);
    return response;
  } catch (error) {
    return null;
  }
}

export async function putKV(key, value) {
  try {
    await env.KV.put(key, value);
  } catch (error) {
    throw error;
  }
}