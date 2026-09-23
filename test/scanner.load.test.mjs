import { test, expect } from 'node:test';
import { Worker } from 'worker_threads';
import scanner from '../src/scanner.js';

test('scanner load test', async (t) => {
  const numWorkers = 10;
  const numScans = 100;
  const websiteUrl = 'https://example.com';

  const workers = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('./worker.js');
    workers.push(worker);
  }

  const scanResults = [];

  for (let i = 0; i < numScans; i++) {
    const workerIndex = i % numWorkers;
    const worker = workers[workerIndex];

    worker.postMessage({ type: 'scan', url: websiteUrl });

    worker.on('message', (result) => {
      scanResults.push(result);
    });
  }

  await new Promise((resolve) => {
    let completedScans = 0;

    for (const worker of workers) {
      worker.on('message', () => {
        completedScans++;

        if (completedScans === numScans) {
          resolve();
        }
      });
    }
  });

  expect(scanResults.length).toBe(numScans);

  for (const result of scanResults) {
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('recommendations');
  }

  for (const worker of workers) {
    worker.terminate();
  }
});

test('scanner load test with multiple websites', async (t) => {
  const numWorkers = 10;
  const numScans = 100;
  const websites = [
    'https://example.com',
    'https://example.net',
    'https://example.io',
  ];

  const workers = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('./worker.js');
    workers.push(worker);
  }

  const scanResults = [];

  for (let i = 0; i < numScans; i++) {
    const workerIndex = i % numWorkers;
    const worker = workers[workerIndex];
    const websiteUrl = websites[i % websites.length];

    worker.postMessage({ type: 'scan', url: websiteUrl });

    worker.on('message', (result) => {
      scanResults.push(result);
    });
  }

  await new Promise((resolve) => {
    let completedScans = 0;

    for (const worker of workers) {
      worker.on('message', () => {
        completedScans++;

        if (completedScans === numScans) {
          resolve();
        }
      });
    }
  });

  expect(scanResults.length).toBe(numScans);

  for (const result of scanResults) {
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('recommendations');
  }

  for (const worker of workers) {
    worker.terminate();
  }
});