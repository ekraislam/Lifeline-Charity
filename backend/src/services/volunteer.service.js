const db = require('../config/db');

const updateProfile = async (userId, data) => {
    await db.query(
        'UPDATE volunteers SET skills = ?, availability = ? WHERE user_id = ?',
        [data.skills, data.availability, userId]
    );
};

const createTask = async (data) => {
    const { title, description, required_skills } = data;
    const [result] = await db.query(
        'INSERT INTO volunteer_tasks (title, description, required_skills) VALUES (?, ?, ?)',
        [title, description, required_skills]
    );
    return result.insertId;
};

const assignTask = async (volunteerId, taskId) => {
    await db.query(
        'INSERT INTO volunteer_assignments (volunteer_id, task_id, assigned_date) VALUES (?, ?, CURDATE())',
        [volunteerId, taskId]
    );
    await db.query('UPDATE volunteer_tasks SET status = ? WHERE id = ?', ['assigned', taskId]);
};

const logHours = async (volunteerId, taskId, data) => {
    const { hours_logged, attendance_status } = data;
    await db.query(
        'UPDATE volunteer_assignments SET hours_logged = ?, attendance_status = ? WHERE volunteer_id = ? AND task_id = ?',
        [hours_logged, attendance_status, volunteerId, taskId]
    );
};

const issueCertificate = async (volunteerId) => {
    // Generate a mock URL for the certificate
    const url = `/certificates/vol_${volunteerId}_${Date.now()}.pdf`;
    await db.query(
        'INSERT INTO volunteer_certificates (volunteer_id, issue_date, certificate_url) VALUES (?, CURDATE(), ?)',
        [volunteerId, url]
    );
    return url;
};

module.exports = {
    updateProfile,
    createTask,
    assignTask,
    logHours,
    issueCertificate
};
