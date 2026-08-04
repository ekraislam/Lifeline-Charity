const express = require('express');
const beneficiaryController = require('../controllers/beneficiary.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createHelpRequestSchema, updateStatusSchema } = require('../validations/beneficiary.validation');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(authMiddleware);

// Beneficiary routes
router.post('/requests', roleMiddleware(['beneficiary']), upload.array('documents', 5), validate(createHelpRequestSchema), beneficiaryController.submitHelpRequest);
router.post('/requests/:id/documents', roleMiddleware(['beneficiary']), upload.array('documents', 5), beneficiaryController.uploadDocuments);

// NGO routes — must be before /:id to avoid conflict
router.get('/requests/waiting', roleMiddleware(['ngo']), beneficiaryController.getWaitingRequests);
router.get('/requests/my-assigned', roleMiddleware(['ngo']), beneficiaryController.getMyAssigned);
router.post('/requests/:id/accept', roleMiddleware(['ngo']), beneficiaryController.acceptRequest);
router.post('/requests/:id/decline', roleMiddleware(['ngo']), beneficiaryController.declineRequest);

// Admin / NGO / Beneficiary routes
router.get('/requests', roleMiddleware(['admin', 'ngo', 'beneficiary']), beneficiaryController.getAllRequests);
router.get('/requests/:id', roleMiddleware(['admin', 'ngo']), beneficiaryController.getRequestById);
router.delete('/requests/:id', roleMiddleware(['beneficiary']), beneficiaryController.deleteHelpRequest);

module.exports = router;

