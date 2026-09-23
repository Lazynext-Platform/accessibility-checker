// File: src/scanner.js
import { KV } from '@cloudflare/kv';
import { D1Database } from '@cloudflare/d1';

// Initialize KV and D1 instances
const kv = new KV('ACCESSIBILITY_CHECKER_KV');
const d1 = new D1Database('ACCESSIBILITY_CHECKER_D1');

// Define scanning options
const scanningOptions = {
  // Default options
  default: {
    scanDepth: 5,
    scanFrequency: 'daily',
    ignoreUrls: [],
  },
  // Customizable options
  customizable: [
    {
      name: 'scanDepth',
      type: 'number',
      defaultValue: 5,
      description: 'Maximum depth to scan',
    },
    {
      name: 'scanFrequency',
      type: 'string',
      defaultValue: 'daily',
      description: 'Frequency to scan',
      options: ['daily', 'weekly', 'monthly'],
    },
    {
      name: 'ignoreUrls',
      type: 'array',
      defaultValue: [],
      description: 'URLs to ignore during scanning',
    },
  ],
};

// Function to get customizable scanning options
async function getScanningOptions() {
  try {
    const options = await kv.get('scanningOptions');
    if (options) {
      return JSON.parse(options);
    } else {
      return scanningOptions.default;
    }
  } catch (error) {
    console.error('Error getting scanning options:', error);
    return scanningOptions.default;
  }
}

// Function to update customizable scanning options
async function updateScanningOptions(options) {
  try {
    await kv.put('scanningOptions', JSON.stringify(options));
    return true;
  } catch (error) {
    console.error('Error updating scanning options:', error);
    return false;
  }
}

// Function to validate scanning options
function validateScanningOptions(options) {
  // Validate scan depth
  if (options.scanDepth < 1 || options.scanDepth > 10) {
    throw new Error('Invalid scan depth. Must be between 1 and 10.');
  }

  // Validate scan frequency
  if (!scanningOptions.customizable[1].options.includes(options.scanFrequency)) {
    throw new Error('Invalid scan frequency. Must be one of: daily, weekly, monthly');
  }

  // Validate ignore URLs
  if (!Array.isArray(options.ignoreUrls)) {
    throw new Error('Invalid ignore URLs. Must be an array.');
  }
}

export { getScanningOptions, updateScanningOptions, validateScanningOptions };