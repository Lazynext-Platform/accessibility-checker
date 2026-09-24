// File: src/utils/error-handler.js
/**
 * Send an error response
 *
 * @param {Object} context The request context
 * @param {Error} error The error to send
 * @returns {Response} The error response
 */
export function sendError(context, error) {
  return new Response(error.message, {
    status: 500,
    headers: { 'Content-Type': 'text/plain' },
  });
}