// File: src/utils/validation.js
export function validate(data, rules) {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];

    if (rule.includes('required') && !value) {
      errors[field] = 'This field is required';
    }

    if (rule.includes('email') && value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      errors[field] = 'Invalid email address';
    }

    if (rule.includes('min:') && value && value.length < parseInt(rule.split('min:')[1], 10)) {
      errors[field] = `This field must be at least ${rule.split('min:')[1]} characters long`;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
}