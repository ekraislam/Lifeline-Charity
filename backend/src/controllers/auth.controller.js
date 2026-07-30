const authService = require('../services/auth.service');
const { generateTokens } = require('../utils/jwt.util');
const { sendEmail } = require('../utils/email.util');

const register = async (req, res) => {
    try {
        if (req.body.email) req.body.email = req.body.email.trim().toLowerCase();
        if (req.body.password) req.body.password = req.body.password.trim();

        const existingUser = await authService.findUserByEmail(req.body.email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        if (req.files && req.files.length > 0) {
            req.body.documents = req.files.map(f => `/uploads/${f.filename}`);
        }

        const userId = await authService.createUser(req.body);
        
        // Mock email verification
        const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN_2 || process.env.CORS_ORIGIN_1 || 'http://localhost:5173';
        const verificationLink = `${frontendUrl}/verify?email=${req.body.email}`;
        await sendEmail(req.body.email, 'Verify your Lifeline Account', `<p>Click here to verify: <a href="${verificationLink}">Verify</a></p>`);

        res.status(201).json({ message: 'User registered successfully. Please verify your email.', userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
        const password = req.body.password ? req.body.password.trim() : '';

        const user = await authService.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.is_active === 0 || user.is_active === false) {
            return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
        }

        const isMatch = await authService.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check NGO approval status
        if (user.role === 'ngo') {
            const db = require('../config/db');
            const [[ngoProfile]] = await db.query('SELECT status FROM ngo_profiles WHERE user_id = ?', [user.id]);
            if (ngoProfile) {
                if (ngoProfile.status === 'pending') {
                    return res.status(403).json({ message: 'Your NGO account is pending admin approval. Please wait for verification.' });
                }
                if (ngoProfile.status === 'rejected') {
                    return res.status(403).json({ message: 'Your NGO account has been rejected by admin. Please contact support.' });
                }
            }
        }

        // Check Volunteer approval status
        if (user.role === 'volunteer') {
            const db = require('../config/db');
            const [[volProfile]] = await db.query('SELECT status FROM volunteers WHERE user_id = ?', [user.id]);
            if (volProfile) {
                if (volProfile.status === 'pending') {
                    return res.status(403).json({ message: 'Your volunteer application is pending admin approval.' });
                }
                if (volProfile.status === 'rejected') {
                    return res.status(403).json({ message: 'Your volunteer application has been rejected by admin.' });
                }
            }
        }

        const tokens = generateTokens(user);
        const { password: _, ...userData } = user;
        res.json({ message: 'Login successful', user: userData, ...tokens });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const user = await authService.findUserByEmail(req.body.email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = authService.generateResetToken(user.email);
        const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN_2 || process.env.CORS_ORIGIN_1 || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
        
        await sendEmail(user.email, 'Lifeline - Password Reset', `<p>Click here to reset: <a href="${resetLink}">Reset Password</a></p>`);

        res.json({ message: 'Password reset link sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = authService.verifyResetToken(token);

        await authService.updatePassword(decoded.email, newPassword);

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { register, login, forgotPassword, resetPassword };
