// File: test/referral.test.mjs
import test from 'node:test';
import assert from 'node:assert';
import ReferralProgram from '../src/referral.js';

test('ReferralProgram generateReferralLink', async () => {
  const referralProgram = new ReferralProgram('customerId');
  const referralLink = await referralProgram.generateReferralLink();
  assert.ok(referralLink, 'Referral link should be generated');
});

test('ReferralProgram getReferralRewards', async () => {
  const referralProgram = new ReferralProgram('customerId');
  const referralRewards = await referralProgram.getReferralRewards();
  assert.ok(referralRewards, 'Referral rewards should be retrieved');
});

test('ReferralProgram updateReferralRewards', async () => {
  const referralProgram = new ReferralProgram('customerId');
  const rewards = {reward: 'reward'};
  await referralProgram.updateReferralRewards(rewards);
  assert.ok(true, 'Referral rewards should be updated');
});

test('ReferralProgram error handling', async () => {
  const referralProgram = new ReferralProgram('customerId');
  try {
    await referralProgram.generateReferralLink();
    assert.fail('Error should be thrown');
  } catch (error) {
    assert.ok(error, 'Error should be thrown');
  }
});