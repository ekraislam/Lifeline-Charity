const db = require('../config/db');

const saveMessage = async (data) => {
    const { name, email, message } = data;
    const [result] = await db.query(
        'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
        [name, email, message]
    );
    return result.insertId;
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
