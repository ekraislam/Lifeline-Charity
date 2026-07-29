const db = require('../config/db');

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
    
    const { title, description, required_amount } = data;
    
    const [result] = await db.query(
        'INSERT INTO help_requests (beneficiary_id, title, description, required_amount) VALUES (?, ?, ?, ?)',
        [beneficiaryId, title, description, required_amount || 0]
    );
    return result.insertId;
};

const uploadDocuments = async (helpRequestId, documentUrls) => {
    if (!documentUrls || documentUrls.length === 0) return;
    const values = documentUrls.map(url => [helpRequestId, url]);
    await db.query('INSERT INTO help_request_documents (help_request_id, document_url) VALUES ?', [values]);
};

const getHelpRequests = async (filters = {}) => {
    let query = `
        SELECT hr.id, hr.title, hr.description, hr.status, hr.required_amount,
               hr.admin_note, hr.assigned_ngo_id, hr.created_at,
               u.name as beneficiary_name, u.email as beneficiary_email,
               ngo_u.name as assigned_ngo_name, np.org_name as assigned_ngo_org
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN ngo_profiles np ON hr.assigned_ngo_id = np.id
        LEFT JOIN users ngo_u ON np.user_id = ngo_u.id
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
    return rows;
};

// NGOs see only waiting_for_ngo requests
const getWaitingRequests = async () => {
    const [rows] = await db.query(`
        SELECT hr.id, hr.title, hr.description, hr.status, hr.required_amount, hr.created_at,
               u.name as beneficiary_name, u.email as beneficiary_email
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        WHERE hr.status = 'waiting_for_ngo'
        ORDER BY hr.created_at DESC
    `);
    return rows;
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
               (SELECT COUNT(*) FROM campaigns c WHERE c.help_request_id = hr.id AND c.status != 'cancelled') as has_campaign
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        JOIN ngo_profiles np ON hr.assigned_ngo_id = np.id
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
