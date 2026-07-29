const authService = require('../services/auth.service');
const { generateTokens } = require('../utils/jwt.util');
const { sendEmail } = require('../utils/email.util');

const register = async (req, res) => {
    try {
        const existingUser = await authService.findUserByEmail(req.body.email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const userId = await authService.createUser(req.body);
        
        // Mock email verification
        const verificationLink = `http://localhost:5000/api/auth/verify?email=${req.body.email}`;
        await sendEmail(req.body.email, 'Verify your Lifeline Account', `<p>Click here to verify: <a href="${verificationLink}">Verify</a></p>`);

        res.status(201).json({ message: 'User registered successfully. Please verify your email.', userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const user = await authService.findUserByEmail(req.body.email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await authService.comparePassword(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
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
        const resetLink = `http://localhost:5000/reset-password?token=${resetToken}`;
        
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
