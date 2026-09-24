// File: src/utils/validation.js
import Ajv from 'ajv';

const ajv = new Ajv();

/**
 * Validate a request body against a schema
 *
 * @param {Request} request The request to validate
 * @param {Object} schema The validation schema
 * @returns {Promise<Object>} The validated data
 */
export async function validate(request, schema) {
  try {
    const data = await request.json();
    const validateFn = ajv.compile(schema);
    const valid = validateFn(data);

    if (!valid) {
      throw new Error(`Validation error: ${ajv.errorsText(validateFn.errors)}`);
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to validate request: ${error.message}`);
  }
}