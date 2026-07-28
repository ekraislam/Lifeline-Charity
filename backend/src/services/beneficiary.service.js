const db = require('../config/db');

const submitHelpRequest = async (userId, data) => {
    const [rows] = await db.query('SELECT id FROM beneficiaries WHERE user_id = ?', [userId]);
    if (rows.length === 0) throw new Error('Beneficiary profile not found');
    
    const beneficiaryId = rows[0].id;
    const { title, description } = data;
    
    const [result] = await db.query(
        'INSERT INTO help_requests (beneficiary_id, title, description) VALUES (?, ?, ?)',
        [beneficiaryId, title, description]
    );
    return result.insertId;
};

const uploadDocuments = async (helpRequestId, documentUrls) => {
    if (!documentUrls || documentUrls.length === 0) return;
    const values = documentUrls.map(url => [helpRequestId, url]);
    await db.query('INSERT INTO help_request_documents (help_request_id, document_url) VALUES ?', [values]);
};

const getHelpRequests = async () => {
    const [rows] = await db.query('SELECT * FROM help_requests ORDER BY created_at DESC');
    return rows;
};

const getHelpRequestById = async (id) => {
    const [rows] = await db.query('SELECT * FROM help_requests WHERE id = ?', [id]);
    const request = rows[0];
    if (request) {
        const [docs] = await db.query('SELECT document_url FROM help_request_documents WHERE help_request_id = ?', [id]);
        request.documents = docs;
    }
    return request;
};

const updateRequestStatus = async (id, status, adminId) => {
    let query = 'UPDATE help_requests SET status = ?';
    let params = [status];
    if (status === 'approved' || status === 'rejected') {
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
    updateRequestStatus
};
