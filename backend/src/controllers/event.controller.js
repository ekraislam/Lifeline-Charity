const eventService = require('../services/event.service');

const getEvents = async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            category_id: req.query.category_id,
            status: req.query.status,
            organizer_id: req.query.organizer_id
        };
        const events = await eventService.getEvents(filters);
        res.json({ events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await eventService.getEventById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createEvent = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.cover_image = '/uploads/events/' + req.file.filename;
        }
        const eventId = await eventService.createEvent(data, req.user.id);
        res.status(201).json({ message: 'Event created successfully', eventId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const updateEvent = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.cover_image = '/uploads/events/' + req.file.filename;
        }
        await eventService.updateEvent(req.params.id, data, req.user.id, req.user.role);
        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error(error);
        const status = error.message.includes('Unauthorized') ? 403 : (error.message.includes('not found') ? 404 : 500);
        res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

const deleteEvent = async (req, res) => {
    try {
        await eventService.deleteEvent(req.params.id, req.user.id, req.user.role);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        const status = error.message.includes('Unauthorized') ? 403 : (error.message.includes('not found') ? 404 : 500);
        res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

const updateEventStatus = async (req, res) => {
    try {
        await eventService.updateEventStatus(req.params.id, req.body.status, req.user.id, req.user.role);
        res.json({ message: 'Event status updated' });
    } catch (error) {
        console.error(error);
        const status = error.message.includes('Unauthorized') ? 403 : (error.message.includes('not found') ? 404 : 500);
        res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

const registerVolunteer = async (req, res) => {
    try {
        await eventService.registerVolunteer(req.params.id, req.user.id);
        res.json({ message: 'Successfully registered for event' });
    } catch (error) {
        console.error(error);
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

const getEventVolunteers = async (req, res) => {
    try {
        const volunteers = await eventService.getEventVolunteers(req.params.id, req.user.id, req.user.role);
        res.json({ volunteers });
    } catch (error) {
        console.error(error);
        const status = error.message.includes('Unauthorized') ? 403 : (error.message.includes('not found') ? 404 : 500);
        res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

const updateVolunteerStatus = async (req, res) => {
    try {
        await eventService.updateVolunteerApplicationStatus(
            req.params.id, 
            req.params.userId, 
            req.body.status, 
            req.user.id, 
            req.user.role
        );
        res.json({ message: 'Volunteer status updated successfully' });
    } catch (error) {
        console.error(error);
        const status = error.message.includes('Unauthorized') ? 403 : (error.message.includes('not found') ? 404 : 400);
        res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    registerVolunteer,
    getEventVolunteers,
    updateVolunteerStatus
};
