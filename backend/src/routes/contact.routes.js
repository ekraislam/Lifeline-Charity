const express = require('express');
const contactController = require('../controllers/contact.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', contactController.submitContact);

// Admin route
router.get('/', authMiddleware, roleMiddleware(['admin']), contactController.getMessages);

module.exports = router;
