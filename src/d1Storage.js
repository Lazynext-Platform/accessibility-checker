// File: src/d1Storage.js
import { platform } from '../platform.js';

class D1Storage {
  constructor(platform) {
    this.platform = platform;
  }

  async put(key, value) {
    try {
      await this.platform.put(key, value);
    } catch (error) {
      throw new Error(`Error storing data in D1: ${error.message}`);
    }
  }

  async get(key) {
    try {
      const value = await this.platform.get(key);
      return value;
    } catch (error) {
      throw new Error(`Error retrieving data from D1: ${error.message}`);
    }
  }
}

export { D1Storage };