// File: src/api.js
import { Router } from 'worker-router';
import { getQuota, updateQuota, checkQuota } from './quota.js';

const router = new Router();

router.post('/api/scan', async (req, res) => {
  const userId = req.headers.get('user-id');
  const licenseType = req.headers.get('license-type');
  try {
    await checkQuota(userId, licenseType);
    // scan logic here
    res.status = 200;
    res.body = 'Scan successful';
  } catch (error) {
    res.status = 402;
    res.body = 'Quota exceeded';
  }
});

export default router;