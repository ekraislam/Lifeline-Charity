const adminService = require('../services/admin.service');

const getSystemStats = async (req, res) => {
    try {
        const stats = await adminService.getSystemStats();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getCampaigns = async (req, res) => {
    try {
        const campaigns = await adminService.getCampaigns(req.query.status);
        res.json({ campaigns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await adminService.getUsers();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        await adminService.updateUserStatus(req.params.id, isActive);
        res.json({ message: `User status updated successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const exportReport = async (req, res) => {
    try {
        const stats = await adminService.getSystemStats();
        // Generate a very basic CSV for demonstration
        let csv = 'Metric,Value\n';
        csv += `Total Users,${stats.total_users}\n`;
        csv += `Total Campaigns,${stats.total_campaigns}\n`;
        csv += `Total Donations,${stats.total_donations}\n`;
        csv += `Active Volunteers,${stats.total_volunteers}\n`;
        
        res.header('Content-Type', 'text/csv');
        res.attachment('lifeline_system_report.csv');
        return res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getSystemStats,
    getCampaigns,
    getUsers,
    updateUserStatus,
    exportReport
};
