const db = require('../config/db');

const createDonation = async (userId, donationData) => {
    const { campaign_id, amount, is_anonymous, is_recurring, recurring_frequency } = donationData;

    const [campaigns] = await db.query('SELECT status, raised_amount, goal_amount FROM campaigns WHERE id = ?', [campaign_id]);
    if (campaigns.length === 0) {
        throw new Error('Campaign not found');
    }
    const campaign = campaigns[0];
    if (campaign.status !== 'approved') {
        throw new Error('Donations are only allowed for approved campaigns');
    }
    if (campaign.raised_amount >= campaign.goal_amount && campaign.goal_amount > 0) {
        throw new Error('This campaign has already reached its goal amount');
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO donations (user_id, campaign_id, amount, is_anonymous, is_recurring, recurring_frequency, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId || null, campaign_id, amount, is_anonymous || false, is_recurring || false, recurring_frequency || 'none', 'pending']
        );
        const donationId = result.insertId;

        // Mock payment transaction entry
        await connection.query(
            'INSERT INTO payment_transactions (donation_id, gateway_name, status) VALUES (?, ?, ?)',
            [donationId, 'mock_gateway', 'pending']
        );

        await connection.commit();
        return donationId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updatePaymentStatus = async (donationId, status, transactionId, gatewayResponse) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE payment_transactions SET status = ?, transaction_id = ?, gateway_response = ? WHERE donation_id = ?',
            [status, transactionId, JSON.stringify(gatewayResponse), donationId]
        );

        await connection.query(
            'UPDATE donations SET status = ? WHERE id = ?',
            [status, donationId]
        );

        if (status === 'success') {
            // Update campaign raised amount
            const [donation] = await connection.query('SELECT campaign_id, amount FROM donations WHERE id = ?', [donationId]);
            if (donation.length > 0) {
                await connection.query('UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?', [donation[0].amount, donation[0].campaign_id]);
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getDonationHistory = async (userId) => {
    const [rows] = await db.query(`
        SELECT d.*, c.title AS campaign_title 
        FROM donations d 
        JOIN campaigns c ON d.campaign_id = c.id 
        WHERE d.user_id = ? 
        ORDER BY d.created_at DESC
    `, [userId]);
    return rows;
};

module.exports = {
    createDonation,
    updatePaymentStatus,
    getDonationHistory
};
