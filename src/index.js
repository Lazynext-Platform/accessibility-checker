// File: src/index.js
import { Router } from 'cloudflare-worker-router';
import { performWCAGScan, saveScanResultsToKV, saveScanResultsToD1, sendEmailWithScanResults, getReportFromD1 } from './scanner';

const router = new Router();

// Define routes
router.post('/scan', async (req, res) => {
  const url = req.body.url;
  const scanResults = await performWCAGScan(url);
  await saveScanResultsToKV(scanResults);
  await saveScanResultsToD1(scanResults);
  await sendEmailWithScanResults(scanResults);
  res.json(scanResults);
});

router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

router.get('/report/:id', async (req, res) => {
  const reportId = req.params.id;
  const report = await getReportFromD1(reportId);
  res.json(report);
});

// Export router
export default router;