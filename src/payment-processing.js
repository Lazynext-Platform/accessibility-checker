// File: src/payment-processing.js
import { initPlatform } from '../platform.js';

const initPaymentProcessing = async () => {
  const platform = await initPlatform();
  return platform.paymentProcessing();
};

const processPayment = async (paymentData, platform) => {
  try {
    const result = await platform.paymentProcessing().processPayment(paymentData);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const manageSubscription = async (subscriptionData, platform) => {
  try {
    const result = await platform.subscriptionManagement().manageSubscription(subscriptionData);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { initPaymentProcessing, processPayment, manageSubscription };