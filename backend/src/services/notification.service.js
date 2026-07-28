const db = require('../config/db');
const { getIo } = require('../sockets/socket');
const { sendEmail } = require('../utils/email.util');

const createNotification = async (userId, title, message, type) => {
    const [result] = await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [userId, title, message, type]
    );

    const notificationId = result.insertId;
    
    // Push real-time notification via Socket.io
    try {
        const io = getIo();
        io.to(`user_${userId}`).emit('notification', {
            id: notificationId,
            title,
            message,
            type,
            created_at: new Date()
        });
    } catch (error) {
        console.error('Socket.io error:', error);
    }

    // Optional: send email for important notifications
    if (type === 'important') {
        const [rows] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
        if (rows.length > 0) {
            await sendEmail(rows[0].email, title, `<p>${message}</p>`);
        }
    }
};

const getUserNotifications = async (userId) => {
    const [rows] = await db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
};

const markAsRead = async (notificationId) => {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead
};
