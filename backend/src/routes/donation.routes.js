const express = require('express');
const donationController = require('../controllers/donation.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createDonationSchema } = require('../validations/donation.validation');

const router = express.Router();

// Optional auth for donations (to allow anonymous users)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authMiddleware(req, res, next);
    }
    next();
};

router.post('/', optionalAuth, validate(createDonationSchema), donationController.donate);
router.get('/payment-callback', donationController.paymentCallback);

// Protected routes
router.use(authMiddleware);
router.get('/history', donationController.getHistory);
router.get('/:id/receipt', donationController.getReceipt);
router.get('/:id', optionalAuth, donationController.getDonationDetails);

module.exports = router;
