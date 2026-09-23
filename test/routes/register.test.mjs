// File: test/routes/register.test.mjs
import test from 'node:test';
import { Router } from 'itty-router';
import registerRouter from '../routes/register';

test('POST /api/register', async (t) => {
  const request = new Request('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    }),
  });

  const response = await registerRouter.handle(request);
  t.equal(response.status, 201, 'User created successfully');
});

test('POST /api/register - validation errors', async (t) => {
  const request = new Request('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: '',
      email: 'invalid-email',
      password: 'short',
    }),
  });

  const response = await registerRouter.handle(request);
  t.equal(response.status, 400, 'Validation errors');
  const responseBody = await response.json();
  t.ok(responseBody.error, 'Error message');
});

test('POST /api/register - user already exists', async (t) => {
  const request = new Request('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'existing@example.com',
      password: 'password123',
    }),
  });

  const response = await registerRouter.handle(request);
  t.equal(response.status, 409, 'User already exists');
  const responseBody = await response.json();
  t.ok(responseBody.error, 'Error message');
});