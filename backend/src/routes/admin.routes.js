const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/stats', adminController.getSystemStats);
router.get('/campaigns', adminController.getCampaigns);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/export', adminController.exportReport);

module.exports = router;
