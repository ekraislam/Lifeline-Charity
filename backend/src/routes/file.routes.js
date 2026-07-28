const express = require('express');
const fileController = require('../controllers/file.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Only admins can delete files globally for now, or you could add owner checks
router.delete('/:filename', roleMiddleware(['admin']), fileController.deleteFile);

module.exports = router;
