const express = require('express');
const profileController = require('../controllers/profile.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateProfileSchema, changePasswordSchema } = require('../validations/profile.validation');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(authMiddleware); // All profile routes require authentication

router.get('/', profileController.getProfile);
router.put('/', validate(updateProfileSchema), profileController.updateProfile);
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);
router.put('/change-password', validate(changePasswordSchema), profileController.changePassword);

module.exports = router;
