const db = require('../config/db');

const createEvent = async (organizerId, data) => {
    const { title, description, location, event_date } = data;
    const [result] = await db.query(
        'INSERT INTO events (title, description, location, event_date, organizer_id) VALUES (?, ?, ?, ?, ?)',
        [title, description, location, event_date, organizerId]
    );
    return result.insertId;
};

const joinEvent = async (eventId, userId, role) => {
    await db.query(
        'INSERT INTO event_registrations (event_id, user_id, role) VALUES (?, ?, ?)',
        [eventId, userId, role]
    );
};

const markAttendance = async (eventId, userId, status) => {
    await db.query(
        'UPDATE event_registrations SET attendance_status = ? WHERE event_id = ? AND user_id = ?',
        [status, eventId, userId]
    );
};

const uploadGallery = async (eventId, imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return;
    const values = imageUrls.map(url => [eventId, url]);
    await db.query('INSERT INTO event_gallery (event_id, image_url) VALUES ?', [values]);
};

const getEvents = async () => {
    const [rows] = await db.query('SELECT * FROM events ORDER BY event_date ASC');
    return rows;
};

module.exports = {
    createEvent,
    joinEvent,
    markAttendance,
    uploadGallery,
    getEvents
};
