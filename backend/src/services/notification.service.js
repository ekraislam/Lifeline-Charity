const db = require('../config/db');
const { getIo } = require('../sockets/socket');
const { sendEmail } = require('../utils/email.util');

const createNotification = async (userId, title, message, type) => {
    try {
        const [result] = await db.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [userId, title, message, type]
        );

        const notificationId = result.insertId;
        
        try {
            const io = getIo();
            if (io) {
                io.to(`user_${userId}`).emit('notification', {
                    id: notificationId,
                    title,
                    message,
                    type,
                    is_read: false,
                    created_at: new Date()
                });
            }
        } catch (error) {
            console.error('Socket.io notification emit error:', error.message);
        }

        if (type === 'important') {
            const [rows] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
            if (rows.length > 0) {
                await sendEmail(rows[0].email, title, `<p>${message}</p>`);
            }
        }
        return notificationId;
    } catch (err) {
        console.error('createNotification error:', err);
    }
};

/**
 * Creates an admin notification for all admin users & emits real-time Socket.IO events
 */
const createAdminNotification = async ({ title, message, type = 'admin_info', priority = 'normal' }) => {
    try {
        const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
        if (!admins || admins.length === 0) return;

        const insertedNotifications = [];
        for (const admin of admins) {
            const [res] = await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
                [admin.id, title, message, type]
            );
            insertedNotifications.push({ id: res.insertId, user_id: admin.id });
        }

        try {
            const io = getIo();
            if (io) {
                const payload = { title, message, type, priority, is_read: false, created_at: new Date() };
                io.to('admin').emit('admin_notification', payload);
                for (const item of insertedNotifications) {
                    io.to(`user_${item.user_id}`).emit('admin_notification', { ...payload, id: item.id });
                }
            }
        } catch (err) {
            console.error('Socket.IO admin_notification emit error:', err.message);
        }
    } catch (err) {
        console.error('createAdminNotification error:', err);
    }
};

/**
 * Creates a notification for a specific NGO user & emits real-time via their socket room
 */
const createNGONotification = async (ngoUserId, { title, message, type = 'ngo_info', priority = 'normal' }) => {
    try {
        const [res] = await db.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [ngoUserId, title, message, type]
        );
        const notificationId = res.insertId;

        try {
            const io = getIo();
            if (io) {
                io.to(`user_${ngoUserId}`).emit('notification', {
                    id: notificationId,
                    title,
                    message,
                    type,
                    priority,
                    is_read: false,
                    created_at: new Date()
                });
            }
        } catch (err) {
            console.error('Socket.IO ngo notification emit error:', err.message);
        }
        return notificationId;
    } catch (err) {
        console.error('createNGONotification error:', err);
    }
};

const getUserNotifications = async (userId) => {
    const [rows] = await db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [userId]);
    return rows;
};

const markAsRead = async (notificationId, userId = null) => {
    if (userId) {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [notificationId, userId]);
    } else {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
    }
};

const markAllAsRead = async (userId) => {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
};

const deleteNotification = async (notificationId, userId) => {
    await db.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [notificationId, userId]);
};

const clearAllNotifications = async (userId) => {
    await db.query('DELETE FROM notifications WHERE user_id = ?', [userId]);
};

module.exports = {
    createNotification,
    createAdminNotification,
    createNGONotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
};
