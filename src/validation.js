// File: src/validation.js
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateInput(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid input data');
  }
  // Add additional validation logic as needed
}

export function handleError(error) {
  if (error instanceof ValidationError) {
    return { error: 'Validation error', message: error.message };
  } else {
    return { error: 'Internal server error', message: 'An unexpected error occurred' };
  }
}