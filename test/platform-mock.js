// File: test/platform-mock.js
import { PaymentProcessingMock, SubscriptionManagementMock } from './mocks.js';

const setupPlatformMock = async () => {
  const paymentProcessingMock = new PaymentProcessingMock();
  const subscriptionManagementMock = new SubscriptionManagementMock();
  return {
    paymentProcessingMock,
    subscriptionManagementMock,
    paymentProcessing: () => paymentProcessingMock,
    subscriptionManagement: () => subscriptionManagementMock,
  };
};

export { setupPlatformMock };