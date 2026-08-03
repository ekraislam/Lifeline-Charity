const db = require('../config/db');

/**
 * Synchronize and auto-complete campaigns where goal is reached OR deadline passed
 */
const syncCampaignCompletionStatus = async (campaignId = null) => {
    try {
        let condition = "WHERE c.status NOT IN ('completed', 'cancelled')";
        const params = [];
        if (campaignId) {
            condition = "WHERE c.id = ?";
            params.push(campaignId);
        }

        const [rows] = await db.query(`
            SELECT c.id, c.title, c.goal_amount, c.raised_amount, c.deadline, c.status
            FROM campaigns c
            ${condition}
        `, params);

        for (const camp of rows) {
            const raised = parseFloat(camp.raised_amount || 0);
            const goal = parseFloat(camp.goal_amount || 0);
            const isGoalReached = goal > 0 && raised >= goal;
            const isExpired = camp.deadline && new Date(camp.deadline) <= new Date();

            if (isGoalReached || isExpired) {
                // Update campaign status to 'completed'
                await db.query('UPDATE campaigns SET status = "completed" WHERE id = ?', [camp.id]);
                camp.status = 'completed';

                const { createAdminNotification } = require('./notification.service');
                if (isGoalReached) {
                    await createAdminNotification({
                        title: '🎉 Campaign Goal Reached!',
                        message: `Campaign "${camp.title}" successfully reached its target funding goal of $${goal.toLocaleString()}!`,
                        type: 'campaign_completed',
                        priority: 'high'
                    });
                } else if (isExpired) {
                    await createAdminNotification({
                        title: '⏰ Campaign Ended Automatically',
                        message: `Campaign "${camp.title}" reached its deadline date and has ended automatically. Total raised: $${raised.toLocaleString()}.`,
                        type: 'campaign_expired',
                        priority: 'normal'
                    });
                }
            }
        }
    } catch (err) {
        console.error("syncCampaignCompletionStatus error:", err);
    }
};

const getCampaigns = async () => {
    await syncCampaignCompletionStatus();

    const [rows] = await db.query(`
        SELECT c.*,
               COALESCE((c.raised_amount / NULLIF(c.goal_amount, 0)) * 100, 0) AS progress,
               GREATEST(0, c.goal_amount - c.raised_amount) AS remaining_amount,
               (SELECT COUNT(DISTINCT id) FROM donations d WHERE d.campaign_id = c.id AND d.status = 'success') AS donor_count,
               (SELECT image_url FROM campaign_gallery cg WHERE cg.campaign_id = c.id LIMIT 1) as cover_image,
               cat.name as category_name,
               np.org_name as ngo_org_name,
               COALESCE(air.risk_level, 'Not Analyzed') as ai_risk_level
        FROM campaigns c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN ngo_profiles np ON c.ngo_id = np.id
        LEFT JOIN help_requests hr ON c.help_request_id = hr.id
        LEFT JOIN ai_verification_reports air ON air.help_request_id = hr.id
        ORDER BY c.created_at DESC
    `);

    return rows.map(row => ({
        ...row,
        gallery: row.cover_image ? [row.cover_image] : [],
        is_completed: row.status === 'completed' || parseFloat(row.raised_amount || 0) >= parseFloat(row.goal_amount || 0)
    }));
};

const getCampaignById = async (id) => {
    await syncCampaignCompletionStatus(id);

    const [rows] = await db.query(`
        SELECT c.*,
               COALESCE((c.raised_amount / NULLIF(c.goal_amount, 0)) * 100, 0) AS progress,
               GREATEST(0, c.goal_amount - c.raised_amount) AS remaining_amount,
               (SELECT COUNT(DISTINCT id) FROM donations d WHERE d.campaign_id = c.id AND d.status = 'success') AS donor_count,
               cat.name as category_name,
               np.org_name as ngo_org_name,
               u.name as beneficiary_name, u.email as beneficiary_email,
               COALESCE(air.risk_level, 'Not Analyzed') as ai_risk_level,
               COALESCE(air.confidence_score, 0) as ai_confidence_score,
               air.reason_for_risk as ai_reason_for_risk,
               air.recommendation as ai_recommendation
        FROM campaigns c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN ngo_profiles np ON c.ngo_id = np.id
        LEFT JOIN help_requests hr ON c.help_request_id = hr.id
        LEFT JOIN beneficiaries b ON hr.beneficiary_id = b.id
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN ai_verification_reports air ON air.help_request_id = hr.id
        WHERE c.id = ?
    `, [id]);

    const campaign = rows[0];
    if (campaign) {
        const [gallery] = await db.query('SELECT image_url FROM campaign_gallery WHERE campaign_id = ?', [id]);
        campaign.gallery = gallery.map(g => g.image_url);
        campaign.is_completed = campaign.status === 'completed' || parseFloat(campaign.raised_amount || 0) >= parseFloat(campaign.goal_amount || 0);

        if (campaign.help_request_id) {
            try {
                const aiVerificationService = require('./aiVerification.service');
                campaign.ai_report = await aiVerificationService.getReportByRequestId(campaign.help_request_id);
            } catch (err) {}
        }
    }
    return campaign;
};

const createCampaign = async (campaignData, userId) => {
    // Find NGO ID if user is NGO
    let ngoId = null;
    const [ngoRows] = await db.query('SELECT id FROM ngo_profiles WHERE user_id = ?', [userId]);
    if (ngoRows.length > 0) {
        ngoId = ngoRows[0].id;
    }

    const { title, description, category_id, goal_amount, deadline, is_featured, help_request_id } = campaignData;

    // Default deadline to 30 days from now if not specified or invalid
    let formattedDeadline = null;
    if (deadline && typeof deadline === 'string' && deadline.trim() !== '') {
        const d = new Date(deadline);
        if (!isNaN(d.getTime())) {
            formattedDeadline = d.toISOString().slice(0, 19).replace('T', ' ');
        }
    }
    if (!formattedDeadline) {
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 30);
        formattedDeadline = defaultDeadline.toISOString().slice(0, 19).replace('T', ' ');
    }

    // If creating campaign for a beneficiary help request
    if (help_request_id) {
        const [hrRows] = await db.query('SELECT status, assigned_ngo_id FROM help_requests WHERE id = ?', [help_request_id]);
        if (hrRows.length === 0) throw new Error('Help request not found');
        if (hrRows[0].assigned_ngo_id !== ngoId) throw new Error('You are not assigned to this beneficiary');

        const [existingCampaigns] = await db.query(
            "SELECT id FROM campaigns WHERE help_request_id = ? AND status NOT IN ('cancelled','completed')", [help_request_id]
        );
        if (existingCampaigns.length > 0) throw new Error('An active campaign already exists for this beneficiary');
    }

    const [result] = await db.query(
        "INSERT INTO campaigns (ngo_id, category_id, title, description, goal_amount, deadline, is_featured, help_request_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')",
        [ngoId, category_id || null, title, description, goal_amount, formattedDeadline, is_featured || false, help_request_id || null]
    );

    const campaignId = result.insertId;

    if (help_request_id) {
        await db.query("UPDATE help_requests SET status = 'campaign_active' WHERE id = ?", [help_request_id]);
    }

    try {
        const { createAdminNotification, createNotification } = require('./notification.service');
        await createAdminNotification({
            title: '📢 New Campaign Created',
            message: `New campaign "${title}" (Goal: $${goal_amount}) was created.`,
            type: 'campaign_created'
        });

        if (help_request_id) {
            const [bUser] = await db.query(
                `SELECT b.user_id FROM help_requests hr JOIN beneficiaries b ON b.id = hr.beneficiary_id WHERE hr.id = ?`, [help_request_id]
            );
            if (bUser.length > 0) {
                await createNotification(
                    bUser[0].user_id,
                    '📢 Campaign Created for Your Request',
                    `A fundraising campaign "${title}" has been launched for your help request #${help_request_id}!`,
                    'campaign_created'
                );
            }
        }
    } catch (notifErr) {
        console.warn('Campaign creation notification error:', notifErr.message);
    }

    return campaignId;
};

const updateCampaign = async (id, updateData) => {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        }
    });

    if (fields.length === 0) return;
    values.push(id);

    await db.query(`UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`, values);
    await syncCampaignCompletionStatus(id);
};

const deleteCampaign = async (id) => {
    await db.query('DELETE FROM campaigns WHERE id = ?', [id]);
};

const updateCampaignStatus = async (id, status) => {
    await db.query('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
    await syncCampaignCompletionStatus(id);
};

const addCampaignGallery = async (campaignId, imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return;
    const values = imageUrls.map(url => [campaignId, url]);
    await db.query('INSERT INTO campaign_gallery (campaign_id, image_url) VALUES ?', [values]);
};

module.exports = {
    syncCampaignCompletionStatus,
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    updateCampaignStatus,
    addCampaignGallery
};
