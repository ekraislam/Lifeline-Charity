const express = require('express');
const eventController = require('../controllers/event.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createEventSchema, joinEventSchema, attendanceSchema } = require('../validations/event.validation');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/', eventController.getAllEvents);

router.use(authMiddleware);

// User routes
router.post('/:id/join', validate(joinEventSchema), eventController.joinEvent);

// Admin/NGO routes
router.post('/', roleMiddleware(['admin', 'ngo']), validate(createEventSchema), eventController.createEvent);
router.post('/:id/attendance', roleMiddleware(['admin', 'ngo']), validate(attendanceSchema), eventController.markAttendance);
router.post('/:id/gallery', roleMiddleware(['admin', 'ngo']), upload.array('images', 5), eventController.uploadGallery);

module.exports = router;
