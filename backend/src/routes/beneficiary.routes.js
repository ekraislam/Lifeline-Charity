const express = require('express');
const beneficiaryController = require('../controllers/beneficiary.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createHelpRequestSchema, updateStatusSchema } = require('../validations/beneficiary.validation');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(authMiddleware);

// Beneficiary routes
router.post('/requests', roleMiddleware(['beneficiary']), validate(createHelpRequestSchema), beneficiaryController.submitHelpRequest);
router.post('/requests/:id/documents', roleMiddleware(['beneficiary']), upload.array('documents', 5), beneficiaryController.uploadDocuments);

// Admin / NGO routes
router.get('/requests', roleMiddleware(['admin', 'ngo']), beneficiaryController.getAllRequests);
router.get('/requests/:id', roleMiddleware(['admin', 'ngo']), beneficiaryController.getRequestById);
router.put('/requests/:id/status', roleMiddleware(['admin']), validate(updateStatusSchema), beneficiaryController.updateRequestStatus);

module.exports = router;
