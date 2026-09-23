// File: test/emailSequence.test.mjs
import { sendEmailSequence } from '../src/emailSequence';
import { getLicense, updateLicense } from '../src/kv';
import { sendEmail } from '../src/email';

jest.mock('../src/kv', () => ({
  getLicense: jest.fn(),
  updateLicense: jest.fn(),
}));

jest.mock('../src/email', () => ({
  sendEmail: jest.fn(),
}));

describe('sendEmailSequence', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should send email on day 3 of trial', async () => {
    const license = {
      status: 'trial',
      startDate: new Date('2022-01-01T00:00:00.000Z'),
      email: 'user@example.com',
    };
    getLicense.mockResolvedValue(license);

    const today = new Date('2022-01-04T00:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => today);

    await sendEmailSequence('userId');
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Getting started with Accessibility Checker',
      body: 'Welcome to Accessibility Checker! We hope you\'re enjoying your free trial so far.',
    });
  });

  it('should send email on day 7 of trial', async () => {
    const license = {
      status: 'trial',
      startDate: new Date('2022-01-01T00:00:00.000Z'),
      email: 'user@example.com',
    };
    getLicense.mockResolvedValue(license);

    const today = new Date('2022-01-08T00:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => today);

    await sendEmailSequence('userId');
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Unlock the full potential of Accessibility Checker',
      body: 'Your free trial is halfway through. Consider upgrading to a paid plan to unlock more features.',
    });
  });

  it('should send email on day 14 of trial', async () => {
    const license = {
      status: 'trial',
      startDate: new Date('2022-01-01T00:00:00.000Z'),
      email: 'user@example.com',
    };
    getLicense.mockResolvedValue(license);

    const today = new Date('2022-01-15T00:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => today);

    await sendEmailSequence('userId');
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Last chance to upgrade before your trial ends',
      body: 'Your free trial is ending soon. Don\'t miss out on the opportunity to upgrade to a paid plan.',
    });
  });

  it('should not send email if user is not on trial', async () => {
    const license = {
      status: 'paid',
      startDate: new Date('2022-01-01T00:00:00.000Z'),
      email: 'user@example.com',
    };
    getLicense.mockResolvedValue(license);

    await sendEmailSequence('userId');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should handle error when sending email', async () => {
    const license = {
      status: 'trial',
      startDate: new Date('2022-01-01T00:00:00.000Z'),
      email: 'user@example.com',
    };
    getLicense.mockResolvedValue(license);

    sendEmail.mockRejectedValue(new Error('Error sending email'));

    await sendEmailSequence('userId');
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});