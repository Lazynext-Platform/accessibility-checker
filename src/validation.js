// File: src/validation.js
export function validate(data, schema) {
  const validator = new Validator();
  const result = validator.validate(data, schema);
  if (result.valid) {
    return data;
  } else {
    throw new SyntaxError('Invalid request body');
  }
}

class Validator {
  validate(data, schema) {
    if (schema.type === 'object') {
      for (const property in schema.properties) {
        if (schema.required.includes(property) && !data[property]) {
          return { valid: false, error: `Missing property ${property}` };
        }
        const propertySchema = schema.properties[property];
        const result = this.validate(data[property], propertySchema);
        if (!result.valid) {
          return result;
        }
      }
    } else if (schema.type === 'string') {
      if (typeof data !== 'string') {
        return { valid: false, error: 'Invalid string' };
      }
    } else if (schema.type === 'integer') {
      if (typeof data !== 'number' || !Number.isInteger(data)) {
        return { valid: false, error: 'Invalid integer' };
      }
    }
    return { valid: true };
  }
}