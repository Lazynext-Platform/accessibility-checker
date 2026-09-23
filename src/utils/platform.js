// File: src/utils/platform.js
import { PLATFORM } from '../constants';

export async function getPlatformClient() {
  // Initialize platform client with API key
  const platformClient = await PLATFORM.getClient();
  return platformClient;
}