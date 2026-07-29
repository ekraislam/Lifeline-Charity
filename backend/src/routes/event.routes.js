const express = require('express');
const eventController = require('../controllers/event.controller');
const { authMiddleware, roleMiddleware, optionalAuthMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer setup for event cover images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../../uploads/events');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, 'event-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Public Routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Volunteer Route
router.post('/:id/register', authMiddleware, roleMiddleware(['volunteer']), eventController.registerVolunteer);

// Admin & NGO Routes
router.use(authMiddleware);
router.post('/', roleMiddleware(['admin', 'ngo']), upload.single('cover_image'), eventController.createEvent);
router.put('/:id', roleMiddleware(['admin', 'ngo']), upload.single('cover_image'), eventController.updateEvent);
router.delete('/:id', roleMiddleware(['admin', 'ngo']), eventController.deleteEvent);
router.patch('/:id/status', roleMiddleware(['admin', 'ngo']), eventController.updateEventStatus);
router.get('/:id/volunteers', roleMiddleware(['admin', 'ngo']), eventController.getEventVolunteers);
router.patch('/:id/volunteers/:userId/status', roleMiddleware(['admin', 'ngo']), eventController.updateVolunteerStatus);

module.exports = router;
