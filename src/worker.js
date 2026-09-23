// File: src/worker.js
import { Router } from 'worker-router';
import api from './api.js';

addEventListener('fetch', (event) => {
  event.respondWith(api.handle(event.request));
});