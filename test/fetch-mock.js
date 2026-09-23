// File: test/fetch-mock.js
class FetchMock {
  constructor() {
    this.calls = [];
    this.mockResponse = null;
  }

  mockResponse(status, body) {
    this.mockResponse = {status, body};
  }

  reset() {
    this.calls = [];
    this.mockResponse = null;
  }
}

export const fetchMock = new FetchMock();

export function fetch(url, options) {
  fetchMock.calls.push([url, options]);

  if (fetchMock.mockResponse) {
    return Promise.resolve({
      ok: fetchMock.mockResponse.status < 300,
      status: fetchMock.mockResponse.status,
      text: () => Promise.resolve(fetchMock.mockResponse.body),
    });
  } else {
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(''),
    });
  }
}