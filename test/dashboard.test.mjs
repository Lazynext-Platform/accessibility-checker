// File: test/dashboard.test.mjs
import { getDashboardData } from '../src/dashboard.js';
import { KV } from '../src/kv.js';
import { D1 } from '../src/d1.js';

describe('getDashboardData', () => {
  it('should fetch dashboard data', async () => {
    // Mock KV and D1 responses
    KV.get = jest.fn().mockResolvedValue('mock-value');
    D1.query = jest.fn().mockResolvedValue({ count: 10 });

    const data = await getDashboardData();
    expect(data).toEqual({
      users: 'mock-value',
      revenue: 'mock-value',
      mrr: 'mock-value',
      uptimePct: 'mock-value',
      errorRate: 'mock-value',
      deployCount: 'mock-value',
      openBugs: 10,
    });
  });

  it('should throw an error if KV or D1 fails', async () => {
    // Mock KV and D1 responses to throw an error
    KV.get = jest.fn().mockRejectedValue(new Error('Mock KV error'));
    D1.query = jest.fn().mockRejectedValue(new Error('Mock D1 error'));

    await expect(getDashboardData()).rejects.toThrowError(
      'Failed to fetch dashboard data: Mock KV error'
    );
  });
});