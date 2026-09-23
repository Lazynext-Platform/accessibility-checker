// File: src/scheduler.js
import { Platform } from 'platform';
import { KV } from 'kv';
import { D1 } from 'd1';

const SCHEDULED_REPORTS_KV = 'scheduled_reports';
const REPORTS_D1 = 'reports';

export async function scheduleReport(scanId, schedule) {
  try {
    // Validate the schedule
    if (!schedule || !schedule.cron) {
      throw new Error('Invalid schedule');
    }

    // Get the existing scheduled reports from KV
    const existingReports = await KV.get(SCHEDULED_REPORTS_KV);
    const reports = existingReports ? JSON.parse(existingReports) : [];

    // Add the new scheduled report
    reports.push({ scanId, schedule });

    // Save the updated scheduled reports to KV
    await KV.put(SCHEDULED_REPORTS_KV, JSON.stringify(reports));

    // Schedule the report using the platform's scheduler
    await Platform.scheduler.schedule(schedule.cron, async () => {
      // Generate the report
      const report = await generateReport(scanId);

      // Save the report to D1
      await D1.put(REPORTS_D1, report);
    });

    return { message: 'Report scheduled successfully' };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to schedule report');
  }
}

export async function generateReport(scanId) {
  try {
    // Get the scan data from KV
    const scanData = await KV.get(`scan_${scanId}`);

    // Generate the report
    const report = {
      scanId,
      data: JSON.parse(scanData),
    };

    return report;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to generate report');
  }
}