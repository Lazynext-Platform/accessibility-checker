// File: src/utils/validation.js
import Ajv from 'ajv';

const ajv = new Ajv();

const validate = (schema, data) => {
  const validateFn = ajv.compile(schema);
  const valid = validateFn(data);
  return { error: validateFn.errors, value: data };
};

export { validate };