const eventService = require('../services/event.service');

const createEvent = async (req, res) => {
    try {
        const eventId = await eventService.createEvent(req.user.id, req.body);
        res.status(201).json({ message: 'Event created successfully', eventId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const joinEvent = async (req, res) => {
    try {
        await eventService.joinEvent(req.params.id, req.user.id, req.body.role);
        res.json({ message: 'Successfully joined event' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const markAttendance = async (req, res) => {
    try {
        await eventService.markAttendance(req.params.id, req.body.user_id, req.body.attendance_status);
        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const uploadGallery = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        await eventService.uploadGallery(req.params.id, imageUrls);
        res.json({ message: 'Gallery updated successfully', imageUrls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const events = await eventService.getEvents();
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createEvent,
    joinEvent,
    markAttendance,
    uploadGallery,
    getAllEvents
};
