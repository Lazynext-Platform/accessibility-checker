// File: api.js
// Importing necessary modules
import { PLATFORM } from './env.js';

// Function to fetch remediation suggestions from the API
async function fetchSuggestions() {
  const response = await fetch(`${PLATFORM}/report/suggestions`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const suggestions = await response.json();
  return suggestions;
}

export { fetchSuggestions };