// File: test/task-retry.test.mjs
import {resolveQaAlert} from '../src/task-retry.js';
import {fetchMock} from './fetch-mock.js';

describe('resolveQaAlert', () => {
  beforeEach(() => {
    // Mock fetch API
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    // Reset fetch mock
    fetchMock.reset();
  });

  it('retries task with exponential backoff', async () => {
    // Mock task retry API
    fetchMock.mockResponse(500, 'Internal Server Error');

    // Call resolveQaAlert
    await expect(resolveQaAlert('63486311')).rejects.toThrowError('All attempts failed to retry task 63486311');

    // Verify fetch calls
    expect(fetchMock.calls).toHaveLength(5);
    expect(fetchMock.calls[0][0]).toBe('https://example.com/api/v1/tasks/63486311/retry');
    expect(fetchMock.calls[1][0]).toBe('https://example.com/api/v1/tasks/63486311/retry');
    expect(fetchMock.calls[2][0]).toBe('https://example.com/api/v1/tasks/63486311/retry');
    expect(fetchMock.calls[3][0]).toBe('https://example.com/api/v1/tasks/63486311/retry');
    expect(fetchMock.calls[4][0]).toBe('https://example.com/api/v1/tasks/63486311/retry');
  });

  it('resolves when task retry is successful', async () => {
    // Mock task retry API
    fetchMock.mockResponse(200, 'OK');

    // Call resolveQaAlert
    await resolveQaAlert('63486311');

    // Verify fetch calls
    expect(fetchMock.calls).toHaveLength(1);
    expect(fetchMock.calls[0][0]).toBe('https://example.com/api/v1/tasks/63486311/retry');
  });
});