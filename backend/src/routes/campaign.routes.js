const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCampaignSchema, updateCampaignSchema, approveRejectSchema } = require('../validations/campaign.validation');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Public routes
router.get('/', campaignController.getAllCampaigns);
router.get('/:id', campaignController.getCampaignById);

// Protected routes (Admin or NGO)
router.use(authMiddleware);

router.post('/', roleMiddleware(['admin', 'ngo']), validate(createCampaignSchema), campaignController.createCampaign);
router.put('/:id', roleMiddleware(['admin', 'ngo']), validate(updateCampaignSchema), campaignController.updateCampaign);
router.delete('/:id', roleMiddleware(['admin', 'ngo']), campaignController.deleteCampaign);

// Gallery upload
router.post('/:id/gallery', roleMiddleware(['admin', 'ngo']), upload.array('images', 5), campaignController.uploadGallery);

// AI Assistant route
router.post('/ai-assistant', roleMiddleware(['admin', 'ngo']), campaignController.handleAiAssistant);

// Admin only route
router.put('/:id/status', roleMiddleware(['admin']), validate(approveRejectSchema), campaignController.approveRejectCampaign);

module.exports = router;
