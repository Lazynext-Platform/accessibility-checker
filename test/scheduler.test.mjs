// File: test/scheduler.test.mjs
import { scheduleReport } from 'src/scheduler.js';
import { KV } from 'kv';
import { D1 } from 'd1';
import { Platform } from 'platform';

describe('Scheduler', () => {
  beforeEach(async () => {
    // Clear the KV and D1 stores
    await KV.put('scheduled_reports', JSON.stringify([]));
    await D1.put('reports', []);
  });

  it('should schedule a report', async () => {
    const scanId = 'test-scan-id';
    const schedule = { cron: '0 0 * * *' };

    const result = await scheduleReport(scanId, schedule);
    expect(result).toEqual({ message: 'Report scheduled successfully' });

    // Verify the scheduled report is saved to KV
    const scheduledReports = await KV.get('scheduled_reports');
    expect(scheduledReports).not.toBeNull();
    expect(JSON.parse(scheduledReports)).toEqual([{ scanId, schedule }]);
  });

  it('should generate a report', async () => {
    const scanId = 'test-scan-id';
    const scanData = { test: 'data' };

    // Save the scan data to KV
    await KV.put(`scan_${scanId}`, JSON.stringify(scanData));

    const report = await scheduleReport.generateReport(scanId);
    expect(report).toEqual({ scanId, data: scanData });
  });

  it('should handle errors', async () => {
    const scanId = 'test-scan-id';
    const schedule = null;

    await expect(scheduleReport(scanId, schedule)).rejects.toThrow(
      'Invalid schedule'
    );
  });
});