// File: src/logger.js
import { platform } from 'platform';

// Define logger function
export function logger() {
  const logLevel = 'INFO';

  return {
    info: (message) => {
      if (logLevel === 'INFO' || logLevel === 'DEBUG') {
        platform.log('INFO', message);
      }
    },
    error: (message) => {
      platform.log('ERROR', message);
    },
    debug: (message) => {
      if (logLevel === 'DEBUG') {
        platform.log('DEBUG', message);
      }
    },
  };
}