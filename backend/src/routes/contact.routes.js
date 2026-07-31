const express = require('express');
const contactController = require('../controllers/contact.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', contactController.submitContact);

// Admin routes
router.get('/', authMiddleware, roleMiddleware(['admin']), contactController.getMessages);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), contactController.deleteMessage);

module.exports = router;
