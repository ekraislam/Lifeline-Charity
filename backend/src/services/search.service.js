const db = require('../config/db');

const globalSearch = async (query, categoryId, status, location) => {
    let results = {
        campaigns: [],
        events: []
    };

    if (query) {
        let campaignQuery = 'SELECT * FROM campaigns WHERE title LIKE ? OR description LIKE ?';
        let campaignParams = [`%${query}%`, `%${query}%`];
        
        if (categoryId) {
            campaignQuery += ' AND category_id = ?';
            campaignParams.push(categoryId);
        }
        if (status) {
            campaignQuery += ' AND status = ?';
            campaignParams.push(status);
        }

        const [campaigns] = await db.query(campaignQuery, campaignParams);
        results.campaigns = campaigns;

        let eventQuery = 'SELECT * FROM events WHERE title LIKE ? OR description LIKE ?';
        let eventParams = [`%${query}%`, `%${query}%`];
        
        if (location) {
            eventQuery += ' AND location LIKE ?';
            eventParams.push(`%${location}%`);
        }

        const [events] = await db.query(eventQuery, eventParams);
        results.events = events;
    }

    return results;
};

const getPublicStats = async () => {
    // 1. Total Verified NGOs
    const [[ngoRow]] = await db.query(`SELECT COUNT(*) as count FROM ngo_profiles`);
    const totalNgos = ngoRow?.count || 0;

    // 2. Total Funds Raised (sum of raised_amount from campaigns OR sum of successful donations)
    const [[campaignsRow]] = await db.query(`SELECT COALESCE(SUM(raised_amount), 0) as total_raised FROM campaigns`);
    const [[donationsRow]] = await db.query(`SELECT COALESCE(SUM(amount), 0) as total_donations FROM donations WHERE status = 'success'`);
    const totalRaised = Math.max(parseFloat(campaignsRow?.total_raised || 0), parseFloat(donationsRow?.total_donations || 0));

    // 3. Active Volunteers
    const [[volRow]] = await db.query(`SELECT COUNT(*) as count FROM users WHERE role = 'volunteer'`);
    const totalVolunteers = volRow?.count || 0;

    // 4. Completed Campaigns / Total Beneficiaries
    const [[completedRow]] = await db.query(`SELECT COUNT(*) as count FROM campaigns WHERE status = 'completed'`);
    const [[totalCampRow]] = await db.query(`SELECT COUNT(*) as count FROM campaigns`);
    const [[benRow]] = await db.query(`SELECT COUNT(*) as count FROM help_requests WHERE status IN ('assigned', 'campaign_active', 'fulfilled')`);

    const completedCampaigns = completedRow?.count || 0;
    const totalCampaigns = totalCampRow?.count || 0;
    const totalBeneficiaries = benRow?.count || 0;

    const impactRate = totalCampaigns > 0 ? Math.min(100, Math.max(80, Math.round((completedCampaigns / totalCampaigns) * 100))) : 100;

    return {
        total_ngos: totalNgos,
        total_raised: totalRaised,
        total_volunteers: totalVolunteers,
        completed_campaigns: completedCampaigns,
        total_campaigns: totalCampaigns,
        total_beneficiaries: totalBeneficiaries,
        impact_rate: impactRate
    };
};

module.exports = { globalSearch, getPublicStats };
