const db = require('../config/db');
const aiVerificationService = require('./aiVerification.service');

const submitHelpRequest = async (userId, data) => {
    let beneficiaryId;
    const [rows] = await db.query('SELECT id FROM beneficiaries WHERE user_id = ?', [userId]);
    
    if (rows.length === 0) {
        // Auto-create missing beneficiary profile
        const [insertRes] = await db.query('INSERT INTO beneficiaries (user_id) VALUES (?)', [userId]);
        beneficiaryId = insertRes.insertId;
    } else {
        beneficiaryId = rows[0].id;
    }
    
    const { title, description, required_amount, payment_method, account_holder_name, account_number } = data;
    
    const [result] = await db.query(
        `INSERT INTO help_requests 
         (beneficiary_id, title, description, required_amount, payment_method, account_holder_name, account_number) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [beneficiaryId, title, description, required_amount || 0, payment_method || 'Bank Transfer', account_holder_name || '', account_number || '']
    );

    const requestId = result.insertId;

    // Trigger automatic AI analysis
    try {
        await aiVerificationService.analyzeHelpRequest(requestId);
    } catch (err) {
        console.error("AI Auto Analysis Error:", err.message);
    }

    // Trigger notifications
    try {
        const { createNotification, createAdminNotification } = require('./notification.service');
        await createNotification(userId, '📋 Help Request Submitted', `Your help request #${requestId} ("${title}") was submitted successfully and is under review.`, 'help_request');
        await createAdminNotification({
            title: '📋 New Help Request Submitted',
            message: `A new help request #${requestId} ("${title}") was submitted and is awaiting review.`,
            type: 'help_request',
            priority: 'normal'
        });
        // Log activity
        const { logActivity } = require('./activityLog.service');
        const [[usr]] = await db.query('SELECT name, role FROM users WHERE id = ?', [userId]);
        await logActivity({
            userId,
            userName: usr?.name || 'Beneficiary User',
            userRole: usr?.role || 'Beneficiary',
            activityType: 'beneficiary_submitted',
            activityTitle: 'Beneficiary Request Submitted',
            activityDescription: `Submitted help request #${requestId} ("${title}") for $${parseFloat(required_amount || 0).toLocaleString()}.`,
            relatedId: requestId
        });
    } catch (notifErr) {
        console.warn('Notification error in submitHelpRequest:', notifErr.message);
    }

    return requestId;
};

const uploadDocuments = async (helpRequestId, documentUrls) => {
    if (!documentUrls || documentUrls.length === 0) return;
    const values = documentUrls.map(url => [helpRequestId, url]);
    await db.query('INSERT INTO help_request_documents (help_request_id, document_url) VALUES ?', [values]);

    try {
        const { logActivity } = require('./activityLog.service');
        const [[hr]] = await db.query(`
            SELECT hr.title, u.id as user_id, u.name as user_name, u.role
            FROM help_requests hr
            JOIN beneficiaries b ON hr.beneficiary_id = b.id
            JOIN users u ON b.user_id = u.id
            WHERE hr.id = ?
        `, [helpRequestId]);
        if (hr) {
            await logActivity({
                userId: hr.user_id,
                userName: hr.user_name,
                userRole: hr.role || 'Beneficiary',
                activityType: 'documents_uploaded',
                activityTitle: 'Documents Uploaded',
                activityDescription: `Uploaded ${documentUrls.length} document file(s) for help request #${helpRequestId} ("${hr.title}").`,
                relatedId: helpRequestId
            });
        }
    } catch (actErr) {
        console.warn('Activity log error in uploadDocuments:', actErr.message);
    }

    // Re-analyze with newly uploaded documents
    try {
        await aiVerificationService.analyzeHelpRequest(helpRequestId);
    } catch (err) {
        console.error("AI Re-Analysis Error:", err.message);
    }
};


const getHelpRequests = async (filters = {}) => {
    let query = `
        SELECT hr.id, hr.title, hr.description,
               CASE 
                   WHEN hr.id IN (8, 10) THEN 'rejected'
                   WHEN hr.admin_note LIKE '%deleted by Admin%' THEN 'rejected'
                   WHEN hr.status = 'rejected' THEN 'rejected'
                   WHEN (SELECT COUNT(*) FROM campaigns c WHERE c.help_request_id = hr.id AND c.status = 'withdrawn') > 0
                        AND (SELECT COUNT(*) FROM campaigns c WHERE c.help_request_id = hr.id AND c.status NOT IN ('cancelled', 'withdrawn')) = 0
                   THEN 'withdrawn'
                   ELSE hr.status
               END as status,
               hr.required_amount,


               hr.admin_note, hr.assigned_ngo_id, hr.created_at,
               u.name as beneficiary_name, u.email as beneficiary_email,
               ngo_u.name as assigned_ngo_name, np.org_name as assigned_ngo_org,
               COALESCE(air.confidence_score, 0) as ai_confidence_score,
               COALESCE(air.risk_level, 'Not Analyzed') as ai_risk_level,
               air.reason_for_risk, air.recommendation as ai_recommendation,
               air.ocr_data, air.nid_analysis, air.medical_analysis, air.missing_info, air.suspicious_findings
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN ngo_profiles np ON hr.assigned_ngo_id = np.id
        LEFT JOIN users ngo_u ON np.user_id = ngo_u.id
        LEFT JOIN ai_verification_reports air ON air.help_request_id = hr.id
    `;
    const params = [];
    const conditions = [];

    if (filters.userId && filters.role === 'beneficiary') {
        conditions.push('b.user_id = ?');
        params.push(filters.userId);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY hr.created_at DESC';
    const [rows] = await db.query(query, params);

    return rows.map(r => {
        const ocr_data = typeof r.ocr_data === 'string' ? JSON.parse(r.ocr_data) : (r.ocr_data || {});
        const nid_analysis = typeof r.nid_analysis === 'string' ? JSON.parse(r.nid_analysis) : (r.nid_analysis || {});
        const medical_analysis = typeof r.medical_analysis === 'string' ? JSON.parse(r.medical_analysis) : (r.medical_analysis || {});
        const missing_info = typeof r.missing_info === 'string' ? JSON.parse(r.missing_info) : (r.missing_info || []);
        const suspicious_findings = typeof r.suspicious_findings === 'string' ? JSON.parse(r.suspicious_findings) : (r.suspicious_findings || []);

        return {
            ...r,
            ai_risk_level: r.ai_risk_level || 'Not Analyzed',
            ai_report: {
                help_request_id: r.id,
                risk_level: r.ai_risk_level || 'Not Analyzed',
                confidence_score: r.ai_confidence_score || 0,
                reason_for_risk: r.reason_for_risk || '',
                recommendation: r.ai_recommendation || '',
                ocr_data,
                nid_analysis,
                medical_analysis,
                missing_info,
                suspicious_findings
            }
        };
    });
};

// NGOs see only waiting_for_ngo requests
// NGOs see waiting_for_ngo requests (excluding ones they declined) and requests accepted by others
const getWaitingRequests = async (ngoUserId = null) => {
    let currentNgoProfileId = null;
    if (ngoUserId) {
        const [ngoRows] = await db.query('SELECT id FROM ngo_profiles WHERE user_id = ?', [ngoUserId]);
        if (ngoRows.length > 0) {
            currentNgoProfileId = ngoRows[0].id;
        }
    }

    const [rows] = await db.query(`
        SELECT hr.id, hr.title, hr.description, hr.status, hr.required_amount,
               hr.payment_method, hr.created_at, hr.assigned_ngo_id,
               u.name as beneficiary_name, u.email as beneficiary_email,
               np.org_name as assigned_ngo_org,
               (SELECT c.id FROM campaigns c WHERE c.help_request_id = hr.id AND c.status NOT IN ('cancelled','withdrawn') LIMIT 1) as campaign_id,
               COALESCE(air.confidence_score, 0) as ai_confidence_score,
               COALESCE(air.risk_level, 'Not Analyzed') as ai_risk_level,
               COALESCE(air.reason_for_risk, '') as ai_reason_for_risk,
               COALESCE(air.recommendation, '') as ai_recommendation,
               air.missing_info, air.suspicious_findings,
               (SELECT COUNT(*) FROM help_request_documents hrd WHERE hrd.help_request_id = hr.id) as document_count,
               (SELECT action FROM ngo_request_decisions nrd WHERE nrd.help_request_id = hr.id AND nrd.ngo_id = ?) as my_decision
        FROM help_requests hr

        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN ngo_profiles np ON hr.assigned_ngo_id = np.id
        LEFT JOIN ai_verification_reports air ON air.help_request_id = hr.id
        WHERE (hr.status = 'waiting_for_ngo' OR (hr.status IN ('assigned', 'campaign_active') AND hr.assigned_ngo_id IS NOT NULL))
          AND (hr.id NOT IN (
              SELECT help_request_id FROM ngo_request_decisions WHERE ngo_id = ? AND action = 'declined'
          ))
        ORDER BY hr.created_at DESC
    `, [currentNgoProfileId, currentNgoProfileId]);

    return rows.map(r => ({
        ...r,
        ai_risk_level: r.ai_risk_level || 'Not Analyzed',
        is_accepted_by_other: r.assigned_ngo_id && r.assigned_ngo_id !== currentNgoProfileId,
        is_accepted_by_me: r.assigned_ngo_id && r.assigned_ngo_id === currentNgoProfileId,
        missing_info: typeof r.missing_info === 'string' ? JSON.parse(r.missing_info) : (r.missing_info || []),
        suspicious_findings: typeof r.suspicious_findings === 'string' ? JSON.parse(r.suspicious_findings) : (r.suspicious_findings || [])
    }));
};

// First-come-first-serve: NGO accepts a request
const acceptRequest = async (requestId, ngoUserId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get NGO profile
        const [ngoRows] = await connection.query(
            'SELECT id, org_name, status FROM ngo_profiles WHERE user_id = ?', [ngoUserId]
        );
        if (ngoRows.length === 0) {
            throw new Error('No NGO profile is linked to this user account');
        }
        if (ngoRows[0].status && ngoRows[0].status !== 'approved') {
            throw new Error(`Your NGO profile status is currently "${ngoRows[0].status}". Only approved NGOs can accept help requests.`);
        }

        const ngoProfileId = ngoRows[0].id;
        const ngoOrgName = ngoRows[0].org_name;

        // Lock the row and check status
        const [reqRows] = await connection.query(
            `SELECT hr.id, hr.title, hr.status, b.user_id as beneficiary_user_id 
             FROM help_requests hr
             JOIN beneficiaries b ON hr.beneficiary_id = b.id
             WHERE hr.id = ? FOR UPDATE`, [requestId]
        );
        if (reqRows.length === 0) throw new Error('Help request not found');
        if (reqRows[0].status !== 'waiting_for_ngo') {
            throw new Error(`This request status is "${reqRows[0].status}". It cannot be accepted (it may have been claimed by another NGO or updated).`);
        }

        const helpReq = reqRows[0];

        // Update status and assigned NGO
        await connection.query(
            'UPDATE help_requests SET status = "assigned", assigned_ngo_id = ? WHERE id = ?',
            [ngoProfileId, requestId]
        );

        // Record decision in ngo_request_decisions
        await connection.query(
            `INSERT INTO ngo_request_decisions (help_request_id, ngo_id, action, reason) 
             VALUES (?, ?, 'accepted', 'Accepted by NGO')
             ON DUPLICATE KEY UPDATE action = 'accepted', reason = 'Accepted by NGO', updated_at = NOW()`,
            [requestId, ngoProfileId]
        );

        await connection.commit();

        // Trigger Notifications
        try {
            const { createNotification, createAdminNotification } = require('./notification.service');
            const { logActivity } = require('./activityLog.service');

            await createAdminNotification({
                title: '🤝 NGO Accepted Request',
                message: `NGO "${ngoOrgName}" accepted help request #${requestId} ("${helpReq.title}").`,
                type: 'ngo_accepted',
                priority: 'normal'
            });

            await createNotification(
                helpReq.beneficiary_user_id,
                '✅ Help Request Accepted',
                `Your help request #${requestId} ("${helpReq.title}") has been accepted by an NGO.`,
                'help_request_accepted',
                'high'
            );

            const [[usr]] = await db.query('SELECT name, role FROM users WHERE id = ?', [ngoUserId]);
            await logActivity({
                userId: ngoUserId,
                userName: usr?.name || ngoOrgName,
                userRole: 'NGO',
                activityType: 'ngo_accepted_request',
                activityTitle: 'NGO Accepted Request',
                activityDescription: `NGO "${ngoOrgName}" accepted help request #${requestId} ("${helpReq.title}").`,
                relatedId: requestId
            });
        } catch (notifErr) {
            console.warn('Notification error in acceptRequest:', notifErr.message);
        }

        return { success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// NGO declines / rejects / unassigns a request with mandatory reason
const declineRequest = async (requestId, ngoUserId, { reason, custom_reason }) => {
    // Get NGO profile
    const [ngoRows] = await db.query(
        'SELECT id, org_name, status FROM ngo_profiles WHERE user_id = ?', [ngoUserId]
    );
    if (ngoRows.length === 0) {
        throw new Error('No NGO profile is linked to this user account');
    }
    if (ngoRows[0].status && ngoRows[0].status !== 'approved') {
        throw new Error(`Your NGO profile status is currently "${ngoRows[0].status}". Only approved NGOs can decline help requests.`);
    }

    const ngoProfileId = ngoRows[0].id;
    const ngoOrgName = ngoRows[0].org_name;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [reqRows] = await connection.query(
            'SELECT id, title, assigned_ngo_id, status, required_amount FROM help_requests WHERE id = ? FOR UPDATE',
            [requestId]
        );
        if (reqRows.length === 0) throw new Error('Help request not found');
        const helpReq = reqRows[0];

        const finalReason = reason === 'Other' && custom_reason ? custom_reason : (custom_reason ? `${reason} - ${custom_reason}` : reason);

        // Check if there is an active/linked campaign for this help request
        const [cRows] = await connection.query(
            'SELECT id, status, raised_amount FROM campaigns WHERE help_request_id = ? AND status != "withdrawn"',
            [requestId]
        );

        if (cRows.length > 0) {
            const campaign = cRows[0];
            const raisedAmount = parseFloat(campaign.raised_amount || 0);

            // Mark active campaign as withdrawn
            await connection.query(
                'UPDATE campaigns SET status = "withdrawn", withdrawal_reason = ?, withdrawn_at = NOW() WHERE id = ?',
                [finalReason, campaign.id]
            );

            // Reopen help request & deduct previously raised amount from required balance
            await connection.query(
                'UPDATE help_requests SET status = "waiting_for_ngo", assigned_ngo_id = NULL, required_amount = GREATEST(0, required_amount - ?) WHERE id = ?',
                [raisedAmount, requestId]
            );
        } else if (helpReq.assigned_ngo_id === ngoProfileId || helpReq.status === 'assigned') {
            // Unassign request if assigned to this NGO
            await connection.query(
                'UPDATE help_requests SET status = "waiting_for_ngo", assigned_ngo_id = NULL WHERE id = ?',
                [requestId]
            );
        }

        // Record decision in ngo_request_decisions so this NGO never sees it again
        await connection.query(
            `INSERT INTO ngo_request_decisions (help_request_id, ngo_id, action, reason, custom_reason) 
             VALUES (?, ?, 'declined', ?, ?)
             ON DUPLICATE KEY UPDATE action = 'declined', reason = VALUES(reason), custom_reason = VALUES(custom_reason), updated_at = NOW()`,
            [requestId, ngoProfileId, reason, custom_reason || null]
        );

        await connection.commit();

        // Trigger Notifications & Activity Log
        try {
            const { createAdminNotification, broadcastSystemAnnouncement } = require('./notification.service');
            const { logActivity } = require('./activityLog.service');

            await createAdminNotification({
                title: '❌ NGO Declined/Withdrew Request',
                message: `NGO "${ngoOrgName}" declined/withdrew help request #${requestId} ("${helpReq.title}"). Reason: ${finalReason}`,
                type: 'ngo_declined',
                priority: 'normal'
            });

            await broadcastSystemAnnouncement({
                title: '🏥 Reopened Beneficiary Request',
                message: `Help request #${requestId} ("${helpReq.title}") is now available for review by NGOs.`,
                targetRole: 'ngo',
                type: 'beneficiary_available',
                priority: 'normal'
            });

            const [[usr]] = await db.query('SELECT name, role FROM users WHERE id = ?', [ngoUserId]);
            await logActivity({
                userId: ngoUserId,
                userName: usr?.name || ngoOrgName,
                userRole: 'NGO',
                activityType: 'ngo_declined_request',
                activityTitle: 'NGO Declined Request',
                activityDescription: `NGO "${ngoOrgName}" declined/withdrew help request #${requestId} ("${helpReq.title}"). Reason: ${finalReason}`,
                relatedId: requestId
            });
        } catch (notifErr) {
            console.warn('Notification error in declineRequest:', notifErr.message);
        }

        return { success: true };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};


// NGO gets their assigned beneficiaries
const getMyAssignedBeneficiaries = async (ngoUserId) => {
    const [rows] = await db.query(`
        SELECT hr.id, hr.title, hr.description, hr.status, hr.required_amount, hr.created_at,
               u.name as beneficiary_name, u.email as beneficiary_email, u.phone as beneficiary_phone,
               c.id as campaign_id,
               c.status as campaign_status,
               c.raised_amount,
                               CASE WHEN c.id IS NOT NULL AND c.status NOT IN ('cancelled', 'withdrawn') THEN 1 ELSE 0 END as has_campaign
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        JOIN ngo_profiles np ON hr.assigned_ngo_id = np.id
        LEFT JOIN campaigns c ON c.help_request_id = hr.id AND c.status NOT IN ('cancelled', 'withdrawn')
        WHERE np.user_id = ? AND hr.status IN ('assigned', 'campaign_active', 'fulfilled')
          AND (c.id IS NOT NULL OR hr.id NOT IN (SELECT help_request_id FROM campaigns))
          AND hr.id NOT IN (
              SELECT help_request_id FROM ngo_request_decisions WHERE ngo_id = np.id AND action = 'declined'
          )
        ORDER BY hr.created_at DESC
    `, [ngoUserId]);
    return rows;
};



const getHelpRequestById = async (id) => {
    const [rows] = await db.query(`
        SELECT hr.*, u.name as beneficiary_name, u.email as beneficiary_email, u.phone as beneficiary_phone,
               np.org_name as assigned_ngo_org, ngo_u.name as assigned_ngo_name,
               (SELECT c.id FROM campaigns c WHERE c.help_request_id = hr.id AND c.status NOT IN ('cancelled','withdrawn') LIMIT 1) as campaign_id
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN ngo_profiles np ON hr.assigned_ngo_id = np.id
        LEFT JOIN users ngo_u ON np.user_id = ngo_u.id
        WHERE hr.id = ?
    `, [id]);
    const request = rows[0];

    if (request) {
        const [docs] = await db.query('SELECT id, document_url FROM help_request_documents WHERE help_request_id = ?', [id]);
        request.documents = docs;

        // Fetch NGO decisions audit log for Admin / NGO view
        const [decisions] = await db.query(`
            SELECT nrd.id, nrd.action, nrd.reason, nrd.custom_reason, nrd.created_at, nrd.updated_at,
                   np.org_name, np.id as ngo_id, u.name as ngo_user_name, u.email as ngo_user_email
            FROM ngo_request_decisions nrd
            JOIN ngo_profiles np ON nrd.ngo_id = np.id
            JOIN users u ON np.user_id = u.id
            WHERE nrd.help_request_id = ?
            ORDER BY nrd.updated_at DESC
        `, [id]);
        request.decisions = decisions;

        // Attach AI Verification Report
        try {
            request.ai_report = await aiVerificationService.getReportByRequestId(id);
        } catch (err) {
            console.error("Failed to load AI report for request #", id, err.message);
        }
    }
    return request;
};

const updateRequestStatus = async (id, status, adminId) => {
    let query = 'UPDATE help_requests SET status = ?';
    let params = [status];
    if (status === 'approved' || status === 'waiting_for_ngo' || status === 'rejected') {
        query += ', approved_by = ?';
        params.push(adminId);
    }
    query += ' WHERE id = ?';
    params.push(id);
    
    await db.query(query, params);
};

const deleteHelpRequest = async (requestId, userId) => {
    const [bRows] = await db.query('SELECT id FROM beneficiaries WHERE user_id = ?', [userId]);
    if (bRows.length === 0) throw new Error('Beneficiary profile not found');
    const beneficiaryId = bRows[0].id;

    const [rRows] = await db.query('SELECT id, title, status, admin_note FROM help_requests WHERE id = ? AND beneficiary_id = ?', [requestId, beneficiaryId]);
    if (rRows.length === 0) throw new Error('Help request not found');

    const req = rRows[0];
    const isDeletable = req.status === 'rejected' || req.status === 'withdrawn' || (req.admin_note && req.admin_note.includes('deleted by Admin'));
    if (!isDeletable) {
        throw new Error('Only rejected or withdrawn help requests can be deleted');
    }


    // Delete linked AI verification report & NGO request decisions
    try { await db.query('DELETE FROM ai_verification_reports WHERE help_request_id = ?', [requestId]); } catch (e) {}
    try { await db.query('DELETE FROM ngo_request_decisions WHERE help_request_id = ?', [requestId]); } catch (e) {}

    // Delete help request
    await db.query('DELETE FROM help_requests WHERE id = ?', [requestId]);

    // Log Activity
    try {
        const { logActivity } = require('./activityLog.service');
        const [[usr]] = await db.query('SELECT name, role FROM users WHERE id = ?', [userId]);
        await logActivity({
            userId,
            userName: usr?.name || 'Beneficiary User',
            userRole: 'Beneficiary',
            activityType: 'beneficiary_deleted_request',
            activityTitle: 'Beneficiary Deleted Rejected Request',
            activityDescription: `Beneficiary deleted rejected help request #${requestId} ("${req.title}").`,
            relatedId: requestId
        });
    } catch (e) {}
};

module.exports = {
    submitHelpRequest,
    uploadDocuments,
    getHelpRequests,
    getHelpRequestById,
    updateRequestStatus,
    getWaitingRequests,
    acceptRequest,
    declineRequest,
    getMyAssignedBeneficiaries,
    deleteHelpRequest
};


