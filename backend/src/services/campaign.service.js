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

const getCampaigns = async (filters = {}) => {
    await syncCampaignCompletionStatus();

    let whereClauses = [];
    let params = [];

    if (filters.ngoUserId) {
        whereClauses.push("np.user_id = ?");
        params.push(filters.ngoUserId);
    } else if (filters.ngoId) {
        whereClauses.push("c.ngo_id = ?");
        params.push(filters.ngoId);
    } else if (!filters.includeWithdrawn && !filters.admin) {
        whereClauses.push("c.status != 'withdrawn'");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

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
        ${whereSql}
        ORDER BY c.created_at DESC
    `, params);

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
            "SELECT id FROM campaigns WHERE help_request_id = ? AND status NOT IN ('cancelled','completed','withdrawn')", [help_request_id]
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
        const { logActivity } = require('./activityLog.service');
        const [[ngoUsr]] = await db.query('SELECT np.org_name, u.id as user_id FROM ngo_profiles np JOIN users u ON np.user_id = u.id WHERE np.id = ?', [ngoId]);

        await logActivity({
            userId: ngoUsr?.user_id || null,
            userName: ngoUsr?.org_name || 'NGO Partner',
            userRole: 'NGO',
            activityType: 'ngo_created_campaign',
            activityTitle: 'NGO Created Campaign',
            activityDescription: `Created campaign "${title}" with target goal $${parseFloat(goal_amount).toLocaleString()}.`,
            relatedId: campaignId
        });

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

    try {
        const { logActivity } = require('./activityLog.service');
        const [[c]] = await db.query('SELECT title, ngo_id FROM campaigns WHERE id = ?', [id]);
        await logActivity({
            userId: null,
            userName: 'Campaign Manager',
            userRole: 'NGO',
            activityType: 'campaign_updated',
            activityTitle: 'Campaign Details Updated',
            activityDescription: `Updated settings for campaign "${c?.title || id}".`,
            relatedId: id
        });
    } catch (e) {
        console.warn('Activity log error in updateCampaign:', e.message);
    }
};

const deleteCampaign = async (id) => {
    await db.query('DELETE FROM campaigns WHERE id = ?', [id]);
};

const updateCampaignStatus = async (id, status) => {
    await db.query('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
    await syncCampaignCompletionStatus(id);

    try {
        const { logActivity } = require('./activityLog.service');
        const [[c]] = await db.query('SELECT title FROM campaigns WHERE id = ?', [id]);
        const actType = status === 'approved' ? 'campaign_published' : status === 'completed' ? 'campaign_completed' : 'campaign_closed';
        const actTitle = status === 'approved' ? 'Campaign Published' : status === 'completed' ? 'Campaign Completed' : 'Campaign Closed';

        await logActivity({
            userId: null,
            userName: 'Platform Officer',
            userRole: 'Admin',
            activityType: actType,
            activityTitle: actTitle,
            activityDescription: `Campaign "${c?.title || id}" status set to ${status}.`,
            relatedId: id
        });
    } catch (e) {
        console.warn('Activity log error in updateCampaignStatus:', e.message);
    }
};


const withdrawCampaign = async (campaignId, userId, { reason, custom_reason }) => {
    // 1. Get user role & NGO profile
    const [[usr]] = await db.query('SELECT role, name FROM users WHERE id = ?', [userId]);
    let ngoId = null;
    let ngoOrgName = usr?.name || 'NGO Partner';

    if (usr?.role === 'ngo') {
        const [ngoRows] = await db.query('SELECT id, org_name FROM ngo_profiles WHERE user_id = ?', [userId]);
        if (ngoRows.length === 0) throw new Error('NGO profile not found');
        ngoId = ngoRows[0].id;
        ngoOrgName = ngoRows[0].org_name;
    }

    // 2. Fetch campaign
    const [cRows] = await db.query('SELECT id, title, ngo_id, help_request_id, status, raised_amount FROM campaigns WHERE id = ?', [campaignId]);
    if (cRows.length === 0) throw new Error('Campaign not found');
    const campaign = cRows[0];

    if (campaign.status === 'withdrawn') {
        throw new Error('This campaign is already withdrawn');
    }

    if (usr?.role === 'ngo' && campaign.ngo_id !== ngoId) {
        throw new Error('You are not authorized to withdraw this campaign');
    }

    const finalReason = reason === 'Other' && custom_reason ? custom_reason : (custom_reason ? `${reason} - ${custom_reason}` : reason);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Mark campaign as withdrawn
        await connection.query(
            'UPDATE campaigns SET status = "withdrawn", withdrawal_reason = ?, withdrawn_at = NOW() WHERE id = ?',
            [finalReason, campaignId]
        );

        if (campaign.help_request_id) {
            const raisedAmount = parseFloat(campaign.raised_amount || 0);
            // Reopen beneficiary help request & deduct previously raised amount from required target
            await connection.query(
                'UPDATE help_requests SET status = "waiting_for_ngo", assigned_ngo_id = NULL, required_amount = GREATEST(0, required_amount - ?) WHERE id = ?',
                [raisedAmount, campaign.help_request_id]
            );


            // Permanently exclude withdrawing NGO from re-evaluating this request
            const targetNgoId = ngoId || campaign.ngo_id;
            if (targetNgoId) {
                await connection.query(
                    `INSERT INTO ngo_request_decisions (help_request_id, ngo_id, action, reason, custom_reason) 
                     VALUES (?, ?, 'declined', ?, ?)
                     ON DUPLICATE KEY UPDATE action = 'declined', reason = VALUES(reason), custom_reason = VALUES(custom_reason), updated_at = NOW()`,
                    [campaign.help_request_id, targetNgoId, `Withdrew Campaign: ${reason}`, custom_reason || null]
                );
            }
        }

        await connection.commit();

        // Trigger Notifications & Activity Log
        try {
            const { createNotification, createAdminNotification, broadcastSystemAnnouncement } = require('./notification.service');
            const { logActivity } = require('./activityLog.service');

            await createAdminNotification({
                title: '🚩 Campaign Withdrawn',
                message: `NGO "${ngoOrgName}" withdrew campaign #${campaignId} ("${campaign.title}"). Reason: ${finalReason}`,
                type: 'campaign_withdrawn',
                priority: 'high'
            });

            if (campaign.help_request_id) {
                const [bRows] = await db.query(
                    'SELECT b.user_id FROM help_requests hr JOIN beneficiaries b ON hr.beneficiary_id = b.id WHERE hr.id = ?',
                    [campaign.help_request_id]
                );
                if (bRows.length > 0) {
                    await createNotification(
                        bRows[0].user_id,
                        '📢 Campaign Status Update',
                        `Your campaign "${campaign.title}" has been withdrawn. Your request has been reopened for other NGOs to review.`,
                        'campaign_withdrawn',
                        'high'
                    );
                }

                await broadcastSystemAnnouncement({
                    title: '🏥 Reopened Beneficiary Request',
                    message: `A beneficiary request ("${campaign.title}") is now available for review by NGOs.`,
                    targetRole: 'ngo',
                    type: 'beneficiary_available',
                    priority: 'normal'
                });
            }

            await logActivity({
                userId,
                userName: ngoOrgName,
                userRole: usr?.role === 'admin' ? 'Admin' : 'NGO',
                activityType: 'campaign_withdrawn',
                activityTitle: 'Campaign Withdrawn',
                activityDescription: `Withdrew campaign #${campaignId} ("${campaign.title}"). Reason: ${finalReason}`,
                relatedId: campaignId
            });
        } catch (notifErr) {
            console.warn('Notification error in withdrawCampaign:', notifErr.message);
        }

        return { success: true };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
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
    withdrawCampaign,
    updateCampaign,
    deleteCampaign,
    updateCampaignStatus,
    addCampaignGallery
};


