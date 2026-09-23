// File: src/routes/register.js
import { Router } from 'itty-router';
import { validate } from '../utils/validation';
import { sendEmail } from '../utils/email';
import { getPlatformClient } from '../utils/platform';
import { KV_STORE } from '../constants';

const router = Router();

router.post('/api/register', async (request) => {
  try {
    const { name, email, password } = await request.json();

    // Validate user input
    const validationErrors = validate({
      name,
      email,
      password,
    }, {
      name: 'required',
      email: 'required|email',
      password: 'required|min:8',
    });

    if (validationErrors) {
      return new Response(JSON.stringify(validationErrors), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if user already exists
    const platformClient = await getPlatformClient();
    const existingUser = await platformClient.get(`users/${email}`);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Create new user
    const user = {
      name,
      email,
      password,
    };
    await platformClient.put(`users/${email}`, user);

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to Accessibility Checker',
      body: 'Thank you for registering with Accessibility Checker.',
    });

    return new Response(JSON.stringify({ message: 'User created successfully' }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

export default router;