// File: test/emailSequence.test.mjs
import { emailSequence } from '../src/emailSequence.js';
import { sendEmail } from '../src/email.js';
import { getTrialUsers } from '../src/db.js';

jest.mock('../src/email.js', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('../src/db.js', () => ({
  getTrialUsers: jest.fn(),
}));

describe('emailSequence', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sends email sequence to trial users', async () => {
    getTrialUsers.mockResolvedValue([
      { email: 'user1@example.com' },
      { email: 'user2@example.com' },
    ]);

    await emailSequence();

    expect(sendEmail).toHaveBeenCalledTimes(3);
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'user1@example.com',
      subject: 'Your trial is starting',
      body: 'Welcome to our trial sequence',
    });
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'user2@example.com',
      subject: 'Your trial is starting',
      body: 'Welcome to our trial sequence',
    });
  });

  it('handles errors', async () => {
    getTrialUsers.mockRejectedValue(new Error('Database error'));

    await emailSequence();

    expect(console.error).toHaveBeenCalledTimes(1);
  });
});