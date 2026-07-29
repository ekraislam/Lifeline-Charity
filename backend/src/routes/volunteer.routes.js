const express = require('express');
const volunteerController = require('../controllers/volunteer.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateProfileSchema, createTaskSchema, assignTaskSchema, logHoursSchema } = require('../validations/volunteer.validation');

const router = express.Router();

router.use(authMiddleware);

// Volunteer specific routes
router.get('/stats', roleMiddleware(['volunteer']), volunteerController.getStats);
router.get('/events', roleMiddleware(['volunteer']), volunteerController.getEvents);
router.put('/profile', roleMiddleware(['volunteer']), validate(updateProfileSchema), volunteerController.updateProfile);
router.post('/log-hours', roleMiddleware(['volunteer']), validate(logHoursSchema), volunteerController.logHours);

// Admin/NGO routes
router.post('/tasks', roleMiddleware(['admin', 'ngo']), validate(createTaskSchema), volunteerController.createTask);
router.post('/assign-task', roleMiddleware(['admin', 'ngo']), validate(assignTaskSchema), volunteerController.assignTask);
router.post('/certificates/:volunteer_id', roleMiddleware(['admin']), volunteerController.issueCertificate);

module.exports = router;
