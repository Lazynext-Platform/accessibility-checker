// File: src/scanner.js
import { storeReport, storeLicense } from './storage';

// ...

async function scanUser(userId) {
  // ...
  const report = { foo: 'bar' };
  await storeReport(userId, report);
  // ...
}

async function licenseUser(userId) {
  // ...
  const license = { foo: 'bar' };
  await storeLicense(userId, license);
  // ...
}