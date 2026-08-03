const db = require('../config/db');

const saveMessage = async (data) => {
    const { name, email, message } = data;
    const [result] = await db.query(
        'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
        [name, email, message]
    );
    const msgId = result.insertId;

    try {
        const { createAdminNotification } = require('./notification.service');
        await createAdminNotification({
            title: '📩 New Support Message Received',
            message: `New message from ${name} (${email}): "${message ? message.slice(0, 80) : ''}..."`,
            type: 'contact_message'
        });
    } catch (err) {
        console.warn('Contact message notification error:', err.message);
    }

    return msgId;
};

const getMessages = async () => {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return rows;
};

const deleteMessage = async (id) => {
    const [result] = await db.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    saveMessage,
    getMessages,
    deleteMessage
};
