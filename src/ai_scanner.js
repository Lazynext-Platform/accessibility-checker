import { Worker } from 'worker_threads';
import { URL } from 'url';
import { JSDOM } from 'jsdom';

const aiScanner = {
  scanWebsite: async (url) => {
    const dom = await getDom(url);
    const issues = await checkAccessibility(dom);
    return issues;
  }
};

const getDom = async (url) => {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  return dom.window.document;
};

const checkAccessibility = async (dom) => {
  const worker = new Worker('./worker.js', { workerData: { dom: dom } });
  const issues = await new Promise((resolve, reject) => {
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
  return issues;
};

export default aiScanner;