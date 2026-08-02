const db = require('../config/db');
const { syncCampaignCompletionStatus, getCampaignById } = require('./campaign.service');

const createDonation = async (userId, donationData) => {
    const { campaign_id, amount, is_anonymous, is_recurring, recurring_frequency } = donationData;

    await syncCampaignCompletionStatus(campaign_id);

    const [campaigns] = await db.query('SELECT status, raised_amount, goal_amount, deadline FROM campaigns WHERE id = ?', [campaign_id]);
    if (campaigns.length === 0) {
        throw new Error('Campaign not found');
    }
    const campaign = campaigns[0];
    
    const raisedAmount = parseFloat(campaign.raised_amount) || 0;
    const goalAmount = parseFloat(campaign.goal_amount) || 0;
    const isExpired = campaign.deadline && new Date(campaign.deadline) <= new Date();

    if (campaign.status === 'completed' || isExpired || (goalAmount > 0 && raisedAmount >= goalAmount)) {
        throw new Error('This campaign has been completed and is no longer accepting donations');
    }

    if (campaign.status !== 'approved' && campaign.status !== 'pending' && campaign.status !== 'running') {
        throw new Error('Donations are only allowed for active campaigns');
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
            [donationId, 'stripe_checkout', 'pending']
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
    let updatedCampaignId = null;

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
                updatedCampaignId = donation[0].campaign_id;
                await connection.query('UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?', [donation[0].amount, updatedCampaignId]);
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    // Post-commit tasks: Sync campaign completion & broadcast real-time socket events
    const { createAdminNotification } = require('./notification.service');

    if (status === 'success' && updatedCampaignId) {
        await syncCampaignCompletionStatus(updatedCampaignId);
        const updatedCampaign = await getCampaignById(updatedCampaignId);

        const [donData] = await db.query('SELECT amount FROM donations WHERE id = ?', [donationId]);
        const donAmt = donData && donData[0] ? parseFloat(donData[0].amount) : 0;

        if (donAmt >= 500) {
            await createAdminNotification({
                title: '💰 Large Donation Received!',
                message: `Generous contribution of $${donAmt.toLocaleString()} received for campaign: "${updatedCampaign?.title || 'Campaign'}".`,
                type: 'large_donation',
                priority: 'high'
            });
        } else {
            await createAdminNotification({
                title: 'New Donation Received',
                message: `Donation of $${donAmt.toLocaleString()} received for "${updatedCampaign?.title || 'Campaign'}".`,
                type: 'donation_success',
                priority: 'normal'
            });
        }

        // ── NGO Notifications ──────────────────────────────────────────────────
        try {
            const { createNGONotification } = require('./notification.service');
            // Get NGO user_id for this campaign
            const [ngoRows] = await db.query(
                `SELECT np.user_id FROM campaigns c
                 JOIN ngo_profiles np ON np.id = c.ngo_id
                 WHERE c.id = ?`, [updatedCampaignId]
            );
            if (ngoRows.length > 0) {
                const ngoUserId = ngoRows[0].user_id;
                const raised = parseFloat(updatedCampaign?.raised_amount || 0);
                const goal = parseFloat(updatedCampaign?.goal_amount || 1);
                const pct = goal > 0 ? Math.floor((raised / goal) * 100) : 0;

                // New donation notification
                await createNGONotification(ngoUserId, {
                    title: '💳 New Donation Received',
                    message: `$${donAmt.toLocaleString()} donated to your campaign "${updatedCampaign?.title || ''}". Total raised: $${raised.toLocaleString()}.`,
                    type: 'donation_success',
                    priority: donAmt >= 500 ? 'high' : 'normal'
                });

                // Milestone notifications (25%, 50%, 75%, 100%)
                const milestones = [25, 50, 75, 100];
                for (const milestone of milestones) {
                    if (pct >= milestone && (pct - Math.floor((donAmt / goal) * 100)) < milestone) {
                        await createNGONotification(ngoUserId, {
                            title: milestone === 100 ? '🎉 Campaign Goal Reached!' : `🏆 ${milestone}% Milestone Reached!`,
                            message: milestone === 100
                                ? `Your campaign "${updatedCampaign?.title || ''}" has reached its full goal of $${goal.toLocaleString()}!`
                                : `Your campaign "${updatedCampaign?.title || ''}" has reached ${milestone}% of its $${goal.toLocaleString()} goal.`,
                            type: milestone === 100 ? 'campaign_completed' : 'campaign_milestone',
                            priority: milestone >= 75 ? 'high' : 'normal'
                        });
                    }
                }
            }
        } catch (ngoErr) {
            console.error('NGO donation notification error:', ngoErr.message);
        }

        try {
            const { getIo } = require('../sockets/socket');
            const io = getIo();
            io.emit('campaign_updated', {
                campaign_id: updatedCampaignId,
                raised_amount: updatedCampaign.raised_amount,
                goal_amount: updatedCampaign.goal_amount,
                status: updatedCampaign.status,
                donor_count: updatedCampaign.donor_count,
                progress: updatedCampaign.progress,
                remaining_amount: updatedCampaign.remaining_amount,
                is_completed: updatedCampaign.is_completed
            });
            io.emit('donation_success', {
                donation_id: donationId,
                campaign_id: updatedCampaignId,
                amount: gatewayResponse?.amount || null
            });
        } catch (e) {
            console.error("Socket emit error:", e.message);
        }
    } else if (status === 'failed') {
        await createAdminNotification({
            title: '⚠️ Failed Payment Attempt',
            message: `Donation transaction #${donationId} failed processing via Stripe gateway.`,
            type: 'donation_failed',
            priority: 'high'
        });
    }
};

const getDonationHistory = async (userId) => {
    const [rows] = await db.query(`
        SELECT 
            d.id,
            d.user_id,
            d.campaign_id,
            d.amount,
            d.is_anonymous,
            d.is_recurring,
            d.recurring_frequency,
            d.status,
            d.created_at,
            COALESCE(c.title, 'General Contribution') AS campaign_title,
            c.status AS campaign_status,
            c.goal_amount,
            c.raised_amount,
            COALESCE(pt.gateway_name, 'Stripe Checkout') AS payment_method,
            COALESCE(pt.transaction_id, CONCAT('TXN_', d.id)) AS transaction_id
        FROM donations d 
        LEFT JOIN campaigns c ON d.campaign_id = c.id 
        LEFT JOIN (
            SELECT donation_id, gateway_name, transaction_id 
            FROM payment_transactions 
            WHERE id IN (SELECT MAX(id) FROM payment_transactions GROUP BY donation_id)
        ) pt ON pt.donation_id = d.id
        WHERE d.user_id = ? 
        ORDER BY d.created_at DESC
    `, [userId]);
    return rows;
};

const getDonationReceipt = async (donationId, userId, userRole) => {
    const [rows] = await db.query(`
        SELECT 
            d.id, 
            d.amount, 
            d.created_at AS date, 
            d.status,
            d.is_anonymous,
            d.is_recurring,
            d.recurring_frequency,
            COALESCE(u.name, 'Anonymous') AS donor_name, 
            u.email AS donor_email,
            c.title AS campaign_title, 
            d.user_id,
            COALESCE(pt.gateway_name, 'Stripe Checkout') AS payment_method,
            COALESCE(pt.transaction_id, CONCAT('TXN_', d.id)) AS transaction_id
        FROM donations d 
        LEFT JOIN users u ON d.user_id = u.id 
        JOIN campaigns c ON d.campaign_id = c.id 
        LEFT JOIN payment_transactions pt ON pt.donation_id = d.id
        WHERE d.id = ?
    `, [donationId]);
    
    if (rows.length === 0) {
        throw new Error('Donation not found');
    }
    
    const donation = rows[0];
    if (donation.user_id !== userId && userRole !== 'admin') {
        throw new Error('Unauthorized');
    }
    
    return {
        receipt_url: `receipt-${donation.id}`,
        receipt_number: `LL-REC-${String(donation.id).padStart(6, '0')}`,
        date: donation.date,
        donor_name: donation.is_anonymous ? 'Anonymous Donor' : donation.donor_name,
        donor_email: donation.donor_email || 'N/A',
        campaign_title: donation.campaign_title,
        amount: donation.amount,
        payment_method: donation.payment_method,
        transaction_id: donation.transaction_id,
        status: donation.status,
        is_recurring: donation.is_recurring,
        recurring_frequency: donation.recurring_frequency
    };
};

const getDonationById = async (donationId) => {
    const [rows] = await db.query(`
        SELECT 
            d.id,
            d.user_id,
            d.campaign_id,
            d.amount,
            d.is_anonymous,
            d.is_recurring,
            d.recurring_frequency,
            d.status,
            d.created_at,
            c.title AS campaign_title,
            COALESCE(pt.gateway_name, 'Stripe Checkout') AS payment_method,
            COALESCE(pt.transaction_id, CONCAT('TXN_', d.id)) AS transaction_id
        FROM donations d 
        JOIN campaigns c ON d.campaign_id = c.id 
        LEFT JOIN payment_transactions pt ON pt.donation_id = d.id
        WHERE d.id = ?
    `, [donationId]);
    return rows[0] || null;
};

module.exports = {
    createDonation,
    updatePaymentStatus,
    getDonationHistory,
    getDonationReceipt,
    getDonationById
};
