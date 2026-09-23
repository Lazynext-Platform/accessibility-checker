// File: app/utils/platform.ts
import axios from 'axios';

const platform = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PLATFORM_URL,
});

export { platform };