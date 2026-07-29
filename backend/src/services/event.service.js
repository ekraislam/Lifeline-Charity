const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const getEvents = async (filters = {}) => {
    let query = `
        SELECT e.*, c.name as category_name, u.name as organizer_name,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.role = 'volunteer') as registered_volunteers
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN users u ON e.organizer_id = u.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
        query += ` AND (e.title LIKE ? OR e.location LIKE ?)`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.category_id) {
        query += ` AND e.category_id = ?`;
        params.push(filters.category_id);
    }
    if (filters.status) {
        query += ` AND e.status = ?`;
        params.push(filters.status);
    }
    if (filters.organizer_id) {
        query += ` AND e.organizer_id = ?`;
        params.push(filters.organizer_id);
    }

    query += ` ORDER BY e.event_date ASC`;

    const [rows] = await db.query(query, params);
    return rows;
};

const getEventById = async (id) => {
    const [rows] = await db.query(`
        SELECT e.*, c.name as category_name, u.name as organizer_name,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.role = 'volunteer') as registered_volunteers
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN users u ON e.organizer_id = u.id
        WHERE e.id = ?
    `, [id]);
    return rows[0];
};

const createEvent = async (data, organizerId) => {
    const { title, description, category_id, location, event_date, max_volunteers, registration_deadline, status, cover_image } = data;
    const [result] = await db.query(`
        INSERT INTO events (title, description, category_id, location, event_date, max_volunteers, registration_deadline, status, cover_image, organizer_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, category_id || null, location, event_date, max_volunteers || 0, registration_deadline || null, status || 'upcoming', cover_image || null, organizerId]);
    return result.insertId;
};

const updateEvent = async (id, data, userId, userRole) => {
    const event = await getEventById(id);
    if (!event) throw new Error('Event not found');
    
    // Check permission
    if (userRole === 'ngo' && event.organizer_id !== userId) {
        throw new Error('Unauthorized to edit this event');
    }

    const { title, description, category_id, location, event_date, max_volunteers, registration_deadline, status, cover_image } = data;
    
    let query = `UPDATE events SET title=?, description=?, category_id=?, location=?, event_date=?, max_volunteers=?, registration_deadline=?, status=?`;
    const params = [title, description, category_id || null, location, event_date, max_volunteers || 0, registration_deadline || null, status];
    
    if (cover_image) {
        query += `, cover_image=?`;
        params.push(cover_image);
        // Optional: delete old image if exists
        if (event.cover_image) {
            const oldPath = path.join(__dirname, '../../', event.cover_image);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
    }
    
    query += ` WHERE id=?`;
    params.push(id);

    await db.query(query, params);
};

const deleteEvent = async (id, userId, userRole) => {
    const event = await getEventById(id);
    if (!event) throw new Error('Event not found');
    
    if (userRole === 'ngo' && event.organizer_id !== userId) {
        throw new Error('Unauthorized to delete this event');
    }

    // Delete image if exists
    if (event.cover_image) {
        const oldPath = path.join(__dirname, '../../', event.cover_image);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }

    await db.query(`DELETE FROM events WHERE id = ?`, [id]);
};

const updateEventStatus = async (id, status, userId, userRole) => {
    const event = await getEventById(id);
    if (!event) throw new Error('Event not found');
    
    if (userRole === 'ngo' && event.organizer_id !== userId) {
        throw new Error('Unauthorized to update this event');
    }

    await db.query(`UPDATE events SET status = ? WHERE id = ?`, [status, id]);
};

const registerVolunteer = async (eventId, userId) => {
    const event = await getEventById(eventId);
    if (!event) throw new Error('Event not found');
    
    if (event.status === 'cancelled' || event.status === 'completed') {
        throw new Error('Cannot register for this event');
    }

    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
        throw new Error('Registration deadline has passed');
    }

    if (event.max_volunteers > 0 && event.registered_volunteers >= event.max_volunteers) {
        throw new Error('Maximum volunteers capacity reached');
    }

    const [[existing]] = await db.query(`SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ? AND role = 'volunteer'`, [eventId, userId]);
    if (existing) {
        throw new Error('You are already registered for this event');
    }

    await db.query(`
        INSERT INTO event_registrations (event_id, user_id, role, attendance_status)
        VALUES (?, ?, 'volunteer', 'pending')
    `, [eventId, userId]);
};

const getEventVolunteers = async (eventId, userId, userRole) => {
    const event = await getEventById(eventId);
    if (!event) throw new Error('Event not found');
    
    if (userRole === 'ngo' && event.organizer_id !== userId) {
        throw new Error('Unauthorized to view volunteers for this event');
    }

    const [rows] = await db.query(`
        SELECT er.id as registration_id, er.attendance_status, er.created_at,
               u.id as user_id, u.name, u.email, u.phone,
               v.skills
        FROM event_registrations er
        JOIN users u ON er.user_id = u.id
        LEFT JOIN volunteers v ON v.user_id = u.id
        WHERE er.event_id = ? AND er.role = 'volunteer'
        ORDER BY er.created_at DESC
    `, [eventId]);
    return rows;
};

const updateVolunteerApplicationStatus = async (eventId, userId, status, updaterId, updaterRole) => {
    const event = await getEventById(eventId);
    if (!event) throw new Error('Event not found');
    
    if (updaterRole === 'ngo' && event.organizer_id !== updaterId) {
        throw new Error('Unauthorized to update volunteer status for this event');
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status');
    }

    const [result] = await db.query(`
        UPDATE event_registrations 
        SET attendance_status = ? 
        WHERE event_id = ? AND user_id = ? AND role = 'volunteer'
    `, [status, eventId, userId]);

    if (result.affectedRows === 0) {
        throw new Error('Volunteer registration not found');
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
    updateVolunteerApplicationStatus
};
