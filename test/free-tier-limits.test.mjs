// File: test/free-tier-limits.test.mjs
import { hasExceededFreeTierLimits, updateQuotas, MAX_REPORTS, MAX_SCANS_PER_DAY, MAX_LEADS } from '../src/free-tier-limits.js';

describe('Free tier limits', () => {
    it('should not exceed free tier limits', () => {
        const quotas = { reports: 5, scans: 50, leads: 20 };
        expect(hasExceededFreeTierLimits(quotas)).toBe(false);
    });

    it('should exceed free tier limits', () => {
        const quotas = { reports: MAX_REPORTS + 1, scans: MAX_SCANS_PER_DAY + 1, leads: MAX_LEADS + 1 };
        expect(hasExceededFreeTierLimits(quotas)).toBe(true);
    });

    it('should update quotas', () => {
        const quotas = { reports: 5, scans: 50, leads: 20 };
        const updatedQuotas = updateQuotas(quotas, 2, 10, 5);
        expect(updatedQuotas).toEqual({ reports: 7, scans: 60, leads: 25 });
    });

    it('should not exceed free tier limits after updating quotas', () => {
        const quotas = { reports: 5, scans: 50, leads: 20 };
        const updatedQuotas = updateQuotas(quotas, 2, 10, 5);
        expect(hasExceededFreeTierLimits(updatedQuotas)).toBe(false);
    });

    it('should exceed free tier limits after updating quotas', () => {
        const quotas = { reports: MAX_REPORTS - 1, scans: MAX_SCANS_PER_DAY - 1, leads: MAX_LEADS - 1 };
        const updatedQuotas = updateQuotas(quotas, 1, 1, 1);
        expect(hasExceededFreeTierLimits(updatedQuotas)).toBe(true);
    });
});