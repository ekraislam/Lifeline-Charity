const db = require('../config/db');
const bcrypt = require('bcrypt');

const getProfileById = async (userId) => {
    const [rows] = await db.query('SELECT id, name, email, role, phone, address, avatar, created_at, updated_at FROM users WHERE id = ?', [userId]);
    return rows[0];
};

const updateProfile = async (userId, updateData) => {
    const { name, email, phone, address } = updateData;
    
    // Dynamically build the query based on provided fields
    const fields = [];
    const values = [];
    
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { fields.push('address = ?'); values.push(address); }

    if (fields.length === 0) return;

    values.push(userId);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
};

const updateAvatar = async (userId, avatarUrl) => {
    await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, userId]);
};

const getUserPassword = async (userId) => {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    return rows[0].password;
};

const updatePassword = async (userId, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
};

module.exports = {
    getProfileById,
    updateProfile,
    updateAvatar,
    getUserPassword,
    updatePassword
};
