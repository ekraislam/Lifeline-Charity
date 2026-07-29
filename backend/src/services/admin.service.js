const db = require('../config/db');

const getSystemStats = async () => {
    const stats = {};

    // 1. Total Users
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
    stats.total_users = userRows[0].count;

    // 2. Total Campaigns
    const [campaignRows] = await db.query('SELECT COUNT(*) as count FROM campaigns');
    stats.total_campaigns = campaignRows[0].count;

    // 3. Total Donations
    const [donationRows] = await db.query('SELECT SUM(amount) as total FROM donations WHERE status = "success"');
    stats.total_donations = donationRows[0].total || 0;

    // 4. Active Volunteers
    const [volunteerRows] = await db.query('SELECT COUNT(*) as count FROM volunteers');
    stats.total_volunteers = volunteerRows[0].count;

    // 5. User Demographics
    const [demographicsRows] = await db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    stats.usersByRole = {
        donor: 0,
        volunteer: 0,
        ngo: 0,
        beneficiary: 0,
        admin: 0
    };
    demographicsRows.forEach(row => {
        if (stats.usersByRole[row.role] !== undefined) {
            stats.usersByRole[row.role] = row.count;
        }
    });

    // 6. Donation Trends (Last 6 Months)
    const [trendRows] = await db.query(`
        SELECT 
            DATE_FORMAT(created_at, '%b') as month,
            MONTH(created_at) as month_num,
            SUM(amount) as total
        FROM donations
        WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month, month_num
        ORDER BY month_num ASC
    `);

    // Prepare flat arrays for chart
    // If no donation data yet, provide default 6-month labels with zeros
    if (trendRows.length === 0) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        stats.donationTrendLabels = months;
        stats.donationTrendData = [0, 0, 0, 0, 0, 0];
    } else {
        stats.donationTrendLabels = trendRows.map(r => r.month);
        stats.donationTrendData = trendRows.map(r => parseFloat(r.total) || 0);
    }

    return stats;
};

const getCampaigns = async (status) => {
    let query = 'SELECT *, (raised_amount / goal_amount) * 100 AS progress FROM campaigns';
    const params = [];

    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    return rows;
};

const getUsers = async () => {
    const [rows] = await db.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    return rows;
};

const updateUserStatus = async (userId, isActive) => {
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
};

module.exports = {
    getSystemStats,
    getCampaigns,
    getUsers,
    updateUserStatus
};
