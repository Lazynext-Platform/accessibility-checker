// File: src/validation.js
import Ajv from 'ajv';

const ajv = new Ajv();

export function validate(data, schema) {
  const validateFn = ajv.compile(schema);
  const valid = validateFn(data);
  if (!valid) {
    return { error: validateFn.errors[0].message };
  }
  return { error: null };
}