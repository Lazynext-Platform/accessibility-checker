// File: test/mocks.js
class PaymentProcessingMock {
  async processPayment(paymentData) {
    if (this.reject) {
      throw new Error(this.reject);
    }
    return { success: true, paymentData };
  }

  reject = null;
}

class SubscriptionManagementMock {
  async manageSubscription(subscriptionData) {
    if (this.reject) {
      throw new Error(this.reject);
    }
    return { success: true, subscriptionData };
  }

  reject = null;
}

export { PaymentProcessingMock, SubscriptionManagementMock };