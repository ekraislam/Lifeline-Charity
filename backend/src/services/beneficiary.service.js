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
    } catch (notifErr) {
        console.warn('Notification error in submitHelpRequest:', notifErr.message);
    }

    return requestId;
};

const uploadDocuments = async (helpRequestId, documentUrls) => {
    if (!documentUrls || documentUrls.length === 0) return;
    const values = documentUrls.map(url => [helpRequestId, url]);
    await db.query('INSERT INTO help_request_documents (help_request_id, document_url) VALUES ?', [values]);

    // Re-analyze with newly uploaded documents
    try {
        await aiVerificationService.analyzeHelpRequest(helpRequestId);
    } catch (err) {
        console.error("AI Re-Analysis Error:", err.message);
    }
};

const getHelpRequests = async (filters = {}) => {
    let query = `
        SELECT hr.id, hr.title, hr.description, hr.status, hr.required_amount,
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
const getWaitingRequests = async () => {
    const [rows] = await db.query(`
        SELECT hr.id, hr.title, hr.description, hr.status, hr.required_amount,
               hr.payment_method, hr.created_at,
               u.name as beneficiary_name, u.email as beneficiary_email,
               COALESCE(air.confidence_score, 0) as ai_confidence_score,
               COALESCE(air.risk_level, 'Not Analyzed') as ai_risk_level,
               COALESCE(air.reason_for_risk, '') as ai_reason_for_risk,
               COALESCE(air.recommendation, '') as ai_recommendation,
               air.missing_info, air.suspicious_findings,
               (SELECT COUNT(*) FROM help_request_documents hrd WHERE hrd.help_request_id = hr.id) as document_count
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN ai_verification_reports air ON air.help_request_id = hr.id
        WHERE hr.status = 'waiting_for_ngo'
        ORDER BY hr.created_at DESC
    `);
    return rows.map(r => ({
        ...r,
        ai_risk_level: r.ai_risk_level || 'Not Analyzed',
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
            'SELECT id FROM ngo_profiles WHERE user_id = ? AND status = "approved"', [ngoUserId]
        );
        if (ngoRows.length === 0) throw new Error('NGO profile not found or not approved');
        const ngoProfileId = ngoRows[0].id;

        // Lock the row and check status
        const [reqRows] = await connection.query(
            'SELECT id, status FROM help_requests WHERE id = ? FOR UPDATE', [requestId]
        );
        if (reqRows.length === 0) throw new Error('Help request not found');
        if (reqRows[0].status !== 'waiting_for_ngo') {
            throw new Error('This request has already been assigned to another NGO');
        }

        // Assign
        await connection.query(
            'UPDATE help_requests SET status = "assigned", assigned_ngo_id = ? WHERE id = ?',
            [ngoProfileId, requestId]
        );

        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
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
               c.goal_amount,
               CASE WHEN c.id IS NOT NULL AND c.status != 'cancelled' THEN 1 ELSE 0 END as has_campaign
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        JOIN ngo_profiles np ON hr.assigned_ngo_id = np.id
        LEFT JOIN campaigns c ON c.help_request_id = hr.id AND c.status != 'cancelled'
        WHERE np.user_id = ? AND hr.status IN ('assigned', 'campaign_active', 'fulfilled')
        ORDER BY hr.created_at DESC
    `, [ngoUserId]);
    return rows;
};

const getHelpRequestById = async (id) => {
    const [rows] = await db.query(`
        SELECT hr.*, u.name as beneficiary_name, u.email as beneficiary_email, u.phone as beneficiary_phone,
               np.org_name as assigned_ngo_org, ngo_u.name as assigned_ngo_name
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

module.exports = {
    submitHelpRequest,
    uploadDocuments,
    getHelpRequests,
    getHelpRequestById,
    updateRequestStatus,
    getWaitingRequests,
    acceptRequest,
    getMyAssignedBeneficiaries
};
