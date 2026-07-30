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

const getStats = async (userId) => {
    // Basic stats: hours logged, events assigned
    const [[vol]] = await db.query('SELECT id FROM volunteers WHERE user_id = ?', [userId]);
    if (!vol) return { total_hours: 0, events_assigned: 0 };

    const [[hoursRow]] = await db.query('SELECT SUM(hours_logged) as total FROM volunteer_assignments WHERE volunteer_id = ?', [vol.id]);
    
    // Calculate total hours from attended events (end_date - event_date)
    const [[eventHoursRow]] = await db.query(`
        SELECT SUM(TIMESTAMPDIFF(MINUTE, e.event_date, e.end_date) / 60.0) as event_total
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE er.user_id = ? AND er.role = 'volunteer' AND er.attendance_status = 'attended'
    `, [userId]);

    const [[eventsRow]] = await db.query('SELECT COUNT(*) as total FROM event_registrations WHERE user_id = ? AND role = "volunteer"', [userId]);
    const [[attendedRow]] = await db.query('SELECT COUNT(*) as total FROM event_registrations WHERE user_id = ? AND role = "volunteer" AND attendance_status = "attended"', [userId]);
    
    return {
        total_hours: (parseFloat(hoursRow?.total) || 0) + (parseFloat(eventHoursRow?.event_total) || 0),
        events_assigned: eventsRow?.total || 0,
        tasks_completed: eventsRow?.total || 0, // Mock tasks completed for UI compatibility
        participated_events: attendedRow?.total || 0
    };
};

const getEvents = async (userId) => {
    const [rows] = await db.query(`
        SELECT er.id as registration_id, er.attendance_status, e.id as event_id, e.title, e.description, e.location, e.event_date
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE er.user_id = ? AND er.role = 'volunteer'
        ORDER BY e.event_date DESC
    `, [userId]);
    return rows;
};

module.exports = {
    updateProfile,
    createTask,
    assignTask,
    logHours,
    issueCertificate,
    getStats,
    getEvents
};
