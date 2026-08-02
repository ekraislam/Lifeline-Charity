const donationService = require('../services/donation.service');
const adminService = require('../services/admin.service');
const paymentGateway = require('../services/payment.gateway');

const donate = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null; // allow anonymous
        const donationId = await donationService.createDonation(userId, req.body);

        // Payment return URL generation
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const defaultBackend = `${protocol}://${host}`;
        const rawBackendUrl = defaultBackend || process.env.API_URL;
        const backendUrl = rawBackendUrl.replace(/\/+$/, '');
        const returnUrl = `${backendUrl}/api/donations/payment-callback`;
        const paymentData = await paymentGateway.processPayment(req.body.amount, 'USD', donationId, returnUrl);

        res.json({
            message: 'Stripe donation initiated',
            donation_id: donationId,
            checkout_url: paymentData.payment_url,
            payment_url: paymentData.payment_url,
            transaction_id: paymentData.transaction_id
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'Campaign not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Donations are only allowed for approved campaigns' || error.message === 'Donations are only allowed for active campaigns') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'This campaign has already reached its goal amount') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const paymentCallback = async (req, res) => {
    try {
        const { status, donation_id, transaction_id } = req.query;

        if (status === 'success') {
            const txnId = transaction_id || `cs_test_${Date.now()}`;
            await donationService.updatePaymentStatus(donation_id, 'success', txnId, req.query);
            res.json({
                status: 'success',
                message: 'Stripe payment successful',
                donation_id,
                transaction_id: txnId
            });
        } else {
            await donationService.updatePaymentStatus(donation_id, 'failed', null, req.query);
            res.json({
                status: 'cancelled',
                message: 'Stripe payment was cancelled or failed',
                donation_id
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getHistory = async (req, res) => {
    try {
        let history;
        if (req.user && req.user.role === 'admin') {
            history = await adminService.getAdminDonations();
        } else {
            history = await donationService.getDonationHistory(req.user.id);
        }
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getReceipt = async (req, res) => {
    try {
        const receipt = await donationService.getDonationReceipt(req.params.id, req.user.id, req.user.role);
        res.json(receipt);
    } catch (error) {
        console.error(error);
        if (error.message === 'Donation not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getDonationDetails = async (req, res) => {
    try {
        const donation = await donationService.getDonationById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });
        res.json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { donate, paymentCallback, getHistory, getReceipt, getDonationDetails };