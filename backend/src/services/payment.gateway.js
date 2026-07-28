// Abstract Payment Gateway Interface Mock

class PaymentGatewayInterface {
    async processPayment(amount, currency, donationId, returnUrl) {
        throw new Error('Not implemented');
    }
    async verifyWebhook(payload, signature) {
        throw new Error('Not implemented');
    }
}

class MockPaymentGateway extends PaymentGatewayInterface {
    async processPayment(amount, currency, donationId, returnUrl) {
        // Mock a successful payment URL generation
        return {
            success: true,
            transaction_id: `MOCK_TXN_${Date.now()}`,
            payment_url: `${returnUrl}?status=success&donation_id=${donationId}`
        };
    }
    
    async verifyWebhook(payload, signature) {
        // Mock webhook verification
        return true;
    }
}

module.exports = new MockPaymentGateway();
