const db = require('../config/db');
const { sendEmail } = require('../utils/email.util');

/**
 * Safely fetches socket.io instance without throwing unhandled exceptions
 */
const safeGetIo = () => {
    try {
        const { getIo } = require('../sockets/socket');
        return getIo();
    } catch (e) {
        return null;
    }
};

/**
 * General User Notification creator & real-time socket pusher
 */
const createNotification = async (userId, title, message, type = 'info', priority = 'normal') => {
    try {
        if (!userId) return null;
        const [result] = await db.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [userId, title, message, type]
        );

        const notificationId = result.insertId;
        const payload = {
            id: notificationId,
            user_id: userId,
            title,
            message,
            type,
            priority,
            is_read: false,
            created_at: new Date().toISOString()
        };

        const io = safeGetIo();
        if (io) {
            io.to(`user_${userId}`).emit('notification', payload);
        }

        if (priority === 'high' || type === 'important' || type === 'security_alert') {
            try {
                const [rows] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
                if (rows.length > 0 && rows[0].email) {
                    await sendEmail(rows[0].email, title, `<p>${message}</p>`);
                }
            } catch (emailErr) {
                console.warn('Email trigger skipped:', emailErr.message);
            }
        }
        return notificationId;
    } catch (err) {
        console.error('createNotification error:', err.message);
        return null;
    }
};

/**
 * Creates an admin notification for all admin users & emits real-time events
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

        const io = safeGetIo();
        if (io) {
            const payload = { title, message, type, priority, is_read: false, created_at: new Date().toISOString() };
            io.to('admin').emit('admin_notification', payload);
            for (const item of insertedNotifications) {
                io.to(`user_${item.user_id}`).emit('notification', { ...payload, id: item.id });
            }
        }
    } catch (err) {
        console.error('createAdminNotification error:', err.message);
    }
};

/**
 * Helper for NGO notifications
 */
const createNGONotification = async (ngoUserId, { title, message, type = 'ngo_info', priority = 'normal' }) => {
    return await createNotification(ngoUserId, title, message, type, priority);
};

/**
 * Helper for Beneficiary notifications
 */
const createBeneficiaryNotification = async (beneficiaryUserId, { title, message, type = 'beneficiary_info', priority = 'normal' }) => {
    return await createNotification(beneficiaryUserId, title, message, type, priority);
};

/**
 * Helper for Volunteer notifications
 */
const createVolunteerNotification = async (volunteerUserId, { title, message, type = 'volunteer_info', priority = 'normal' }) => {
    return await createNotification(volunteerUserId, title, message, type, priority);
};

/**
 * Helper for Donor notifications
 */
const createDonorNotification = async (donorUserId, { title, message, type = 'donation_info', priority = 'normal' }) => {
    return await createNotification(donorUserId, title, message, type, priority);
};

/**
 * Broadcast system announcements to specified targetRole ('all' | 'ngo' | 'volunteer' | 'beneficiary' | 'donor')
 */
const broadcastSystemAnnouncement = async ({ title, message, targetRole = 'all', type = 'announcement', priority = 'normal' }) => {
    try {
        let sql = "SELECT id FROM users WHERE is_active = 1";
        const params = [];
        if (targetRole !== 'all') {
            sql += " AND role = ?";
            params.push(targetRole);
        }
        const [users] = await db.query(sql, params);

        for (const u of users) {
            await createNotification(u.id, title, message, type, priority);
        }
    } catch (err) {
        console.error('broadcastSystemAnnouncement error:', err.message);
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
    createBeneficiaryNotification,
    createVolunteerNotification,
    createDonorNotification,
    broadcastSystemAnnouncement,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
};
