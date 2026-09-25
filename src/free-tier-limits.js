// File: src/free-tier-limits.js
/**
 * Defines and enforces free tier limitations.
 * 
 * @module src/free-tier-limits
 */

/**
 * Maximum number of reports allowed in the free tier.
 * @constant {number}
 */
const MAX_REPORTS = 10;

/**
 * Maximum number of scans allowed in the free tier per day.
 * @constant {number}
 */
const MAX_SCANS_PER_DAY = 100;

/**
 * Maximum number of leads allowed in the free tier.
 * @constant {number}
 */
const MAX_LEADS = 50;

/**
 * Checks if the free tier limits have been exceeded.
 * 
 * @param {object} quotas - The current quotas.
 * @param {number} quotas.reports - The number of reports.
 * @param {number} quotas.scans - The number of scans.
 * @param {number} quotas.leads - The number of leads.
 * 
 * @returns {boolean} True if the free tier limits have been exceeded, false otherwise.
 */
function hasExceededFreeTierLimits(quotas) {
    return quotas.reports >= MAX_REPORTS || 
           quotas.scans >= MAX_SCANS_PER_DAY || 
           quotas.leads >= MAX_LEADS;
}

/**
 * Updates the quotas based on the usage.
 * 
 * @param {object} quotas - The current quotas.
 * @param {number} reports - The number of reports to add.
 * @param {number} scans - The number of scans to add.
 * @param {number} leads - The number of leads to add.
 * 
 * @returns {object} The updated quotas.
 */
function updateQuotas(quotas, reports, scans, leads) {
    return {
        reports: quotas.reports + reports,
        scans: quotas.scans + scans,
        leads: quotas.leads + leads
    };
}

export { hasExceededFreeTierLimits, updateQuotas, MAX_REPORTS, MAX_SCANS_PER_DAY, MAX_LEADS };