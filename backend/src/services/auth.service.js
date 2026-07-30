const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const findUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const createUser = async (userData) => {
    const { name, email, password, role, phone, address, org_name, registration_number } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, phone || null, address || null]
        );
        const userId = result.insertId;

        if (role === 'ngo') {
            const { documents } = userData;
            await connection.query(
                'INSERT INTO ngo_profiles (user_id, org_name, registration_number, documents) VALUES (?, ?, ?, ?)',
                [userId, org_name, registration_number, documents ? JSON.stringify(documents) : null]
            );
        } else if (role === 'volunteer') {
            const { skills, availability } = userData;
            await connection.query('INSERT INTO volunteers (user_id, skills, availability, status) VALUES (?, ?, ?, ?)', [userId, skills || null, availability || null, 'pending']);
        } else if (role === 'beneficiary') {
            await connection.query('INSERT INTO beneficiaries (user_id) VALUES (?)', [userId]);
        }

        await connection.commit();
        return userId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Reset Password Logic (Stub for DB tokens)
// In a real app, store reset token in DB. Here we just use JWT.
const generateResetToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const verifyResetToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const updatePassword = async (email, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
};

module.exports = {
    findUserByEmail,
    createUser,
    comparePassword,
    generateResetToken,
    verifyResetToken,
    updatePassword
};
