import { describe, expect, it } from 'node:test';
import { query } from '../src/db.js'; // Assuming a db module for D1 SQL interactions

describe('Database Schema', () => {
  it('should insert a user', async () => {
    const email = 'test@example.com';
    const name = 'Test User';
    await query(`INSERT INTO users (email, name) VALUES ($1, $2)`, [email, name]);
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    expect(result.rows.length).toBe(1);
  });

  it('should insert a scan result', async () => {
    const userId = 'some-valid-user-id';
    const url = 'https://example.com';
    const result = { accessibility: 'high' };
    await query(`INSERT INTO scan_results (user_id, url, result) VALUES ($1, $2, $3)`, [userId, url, JSON.stringify(result)]);
    const scanResult = await query(`SELECT * FROM scan_results WHERE user_id = $1 AND url = $2`, [userId, url]);
    expect(scanResult.rows.length).toBe(1);
  });
});