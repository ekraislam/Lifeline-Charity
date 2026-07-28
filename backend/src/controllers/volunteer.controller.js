const volunteerService = require('../services/volunteer.service');

const updateProfile = async (req, res) => {
    try {
        await volunteerService.updateProfile(req.user.id, req.body);
        res.json({ message: 'Volunteer profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createTask = async (req, res) => {
    try {
        const taskId = await volunteerService.createTask(req.body);
        res.status(201).json({ message: 'Task created successfully', taskId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const assignTask = async (req, res) => {
    try {
        await volunteerService.assignTask(req.body.volunteer_id, req.body.task_id);
        res.json({ message: 'Task assigned successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logHours = async (req, res) => {
    try {
        // Find volunteer ID for the logged in user
        const db = require('../config/db');
        const [rows] = await db.query('SELECT id FROM volunteers WHERE user_id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Volunteer profile not found' });
        
        await volunteerService.logHours(rows[0].id, req.body.task_id, req.body);
        res.json({ message: 'Hours logged successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const issueCertificate = async (req, res) => {
    try {
        const url = await volunteerService.issueCertificate(req.params.volunteer_id);
        res.json({ message: 'Certificate issued successfully', certificate_url: url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    updateProfile,
    createTask,
    assignTask,
    logHours,
    issueCertificate
};
