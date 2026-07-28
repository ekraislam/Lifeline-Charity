const profileService = require('../services/profile.service');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
    try {
        const user = await profileService.getProfileById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        await profileService.updateProfile(req.user.id, req.body);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const avatarUrl = `/uploads/${req.file.filename}`;
        await profileService.updateAvatar(req.user.id, avatarUrl);
        
        res.json({ message: 'Avatar uploaded successfully', avatarUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        const currentHashedPassword = await profileService.getUserPassword(req.user.id);
        const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        await profileService.updatePassword(req.user.id, newPassword);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getProfile, updateProfile, uploadAvatar, changePassword };
