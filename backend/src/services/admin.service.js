const db = require('../config/db');
const ExcelJS = require('exceljs');

// ──────────────────────────────────────────────────────────────────
// SYSTEM STATS
// ──────────────────────────────────────────────────────────────────
const getSystemStats = async () => {
    const stats = {};

    const [[userRow]] = await db.query('SELECT COUNT(*) as count FROM users');
    stats.total_users = userRow.count;

    const [[campaignRow]] = await db.query('SELECT COUNT(*) as count FROM campaigns');
    stats.total_campaigns = campaignRow.count;

    const [[donationRow]] = await db.query('SELECT SUM(amount) as total FROM donations WHERE status = "success"');
    stats.total_donations = donationRow.total || 0;

    const [[volunteerRow]] = await db.query("SELECT COUNT(*) as count FROM volunteers WHERE status = 'approved'");
    stats.total_volunteers = volunteerRow.count;

    const [[ngoRow]] = await db.query('SELECT COUNT(*) as count FROM ngo_profiles');
    stats.total_ngos = ngoRow.count;

    const [demographicsRows] = await db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    stats.usersByRole = { donor: 0, volunteer: 0, ngo: 0, beneficiary: 0, admin: 0 };
    demographicsRows.forEach(row => {
        if (stats.usersByRole[row.role] !== undefined) stats.usersByRole[row.role] = row.count;
    });

    const [trendRows] = await db.query(`
        SELECT DATE_FORMAT(created_at, '%b') as month, MONTH(created_at) as month_num, SUM(amount) as total
        FROM donations
        WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month, month_num ORDER BY month_num ASC
    `);

    if (trendRows.length === 0) {
        stats.donationTrendLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        stats.donationTrendData = [0, 0, 0, 0, 0, 0];
    } else {
        stats.donationTrendLabels = trendRows.map(r => r.month);
        stats.donationTrendData = trendRows.map(r => parseFloat(r.total) || 0);
    }

    return stats;
};

// ──────────────────────────────────────────────────────────────────
// CAMPAIGNS
// ──────────────────────────────────────────────────────────────────
const getCampaigns = async (status) => {
    let query = `
        SELECT c.id, c.title, c.goal_amount, c.raised_amount, c.status, c.created_at, c.deadline,
               c.description, c.category_id,
               np.org_name as ngo_name,
               cat.name as category_name,
               u.name as ngo_user_name
        FROM campaigns c
        LEFT JOIN ngo_profiles np ON c.ngo_id = np.id
        LEFT JOIN users u ON np.user_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
    `;
    const params = [];
    if (status && status !== 'all') {
        query += ' WHERE c.status = ?';
        params.push(status);
    }
    query += ' ORDER BY c.created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
};

const editCampaign = async (id, data) => {
    const { title, description, goal_amount, deadline, status } = data;
    await db.query(
        'UPDATE campaigns SET title=?, description=?, goal_amount=?, deadline=?, status=? WHERE id=?',
        [title, description, goal_amount, deadline, status, id]
    );
};

const deleteCampaign = async (id) => {
    await db.query('DELETE FROM campaign_gallery WHERE campaign_id = ?', [id]);
    await db.query('DELETE FROM campaigns WHERE id = ?', [id]);
};

const updateCampaignStatus = async (id, status) => {
    await db.query('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
};

// ──────────────────────────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────────────────────────
const getUsers = async () => {
    const [rows] = await db.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    return rows;
};

const updateUserStatus = async (userId, isActive) => {
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
};

// ──────────────────────────────────────────────────────────────────
// NGOs
// ──────────────────────────────────────────────────────────────────
const getNGOs = async () => {
    const [rows] = await db.query(`
        SELECT np.id, np.org_name, np.registration_number, np.documents, np.status, np.created_at,
               u.name as user_name, u.email
        FROM ngo_profiles np
        LEFT JOIN users u ON np.user_id = u.id
        ORDER BY np.created_at DESC
    `);
    return rows;
};

const updateNGOStatus = async (id, status) => {
    await db.query('UPDATE ngo_profiles SET status = ? WHERE id = ?', [status, id]);
};

// ──────────────────────────────────────────────────────────────────
// VOLUNTEERS
// ──────────────────────────────────────────────────────────────────
const getVolunteers = async () => {
    const [rows] = await db.query(`
        SELECT v.id, v.user_id, v.skills, v.availability, v.status, v.created_at,
               u.name as user_name, u.email, u.phone,
               (
                   SELECT GROUP_CONCAT(event_id)
                   FROM event_registrations
                   WHERE user_id = v.user_id
               ) as registered_events
        FROM volunteers v
        LEFT JOIN users u ON v.user_id = u.id
        ORDER BY v.created_at DESC
    `);
    return rows;
};

const updateVolunteerStatus = async (id, status) => {
    await db.query('UPDATE volunteers SET status = ? WHERE id = ?', [status, id]);
    
    // Also update users.is_active
    const [[vol]] = await db.query('SELECT user_id FROM volunteers WHERE id = ?', [id]);
    if (vol) {
        const isActive = status === 'approved' ? 1 : (status === 'pending' || status === 'rejected' ? 0 : 1);
        // Note: For pending, we might still want them to login but see "Pending" dashboard, so is_active=1 might be better.
        // Let's keep is_active = 1 unless rejected.
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [status === 'rejected' ? 0 : 1, vol.user_id]);
    }
};

const assignVolunteerToEvent = async (volunteerId, eventId) => {
    // Need user_id for event_registrations
    const [[vol]] = await db.query('SELECT user_id FROM volunteers WHERE id = ?', [volunteerId]);
    if (!vol) throw new Error('Volunteer not found');

    // Check if already registered
    const [[existing]] = await db.query('SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?', [eventId, vol.user_id]);
    if (existing) throw new Error('Volunteer is already assigned to this event');

    await db.query(
        'INSERT INTO event_registrations (event_id, user_id, role, attendance_status) VALUES (?, ?, ?, ?)',
        [eventId, vol.user_id, 'volunteer', 'pending']
    );
};

// ──────────────────────────────────────────────────────────────────
// BENEFICIARIES
// ──────────────────────────────────────────────────────────────────
const getBeneficiaryRequests = async (search) => {
    let query = `
        SELECT hr.id, hr.title, hr.description, hr.status, hr.admin_note, hr.required_amount,
               hr.assigned_ngo_id, hr.created_at,
               u.name as beneficiary_name, u.email as beneficiary_email,
               np.org_name as assigned_ngo_org
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN ngo_profiles np ON hr.assigned_ngo_id = np.id
    `;
    const params = [];
    if (search) {
        query += ' WHERE (u.name LIKE ? OR CAST(hr.id AS CHAR) LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY hr.created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
};

const updateBeneficiaryStatus = async (id, status, adminNote) => {
    // When admin approves, set to waiting_for_ngo
    const finalStatus = status === 'approved' ? 'waiting_for_ngo' : status;
    await db.query(
        'UPDATE help_requests SET status = ?, admin_note = ? WHERE id = ?',
        [finalStatus, adminNote || null, id]
    );
};

// ──────────────────────────────────────────────────────────────────
// EXCEL REPORTS
// ──────────────────────────────────────────────────────────────────
const buildExcelReport = async (title, summaryRows, columns, dataRows) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Lifeline Admin';
    const sheet = workbook.addWorksheet('Report');

    // Title
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // Generated date
    sheet.mergeCells('A2:F2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = `Generated: ${new Date().toLocaleString()}`;
    dateCell.font = { italic: true, color: { argb: 'FF6B7280' } };
    dateCell.alignment = { horizontal: 'center' };

    // Summary
    let row = 4;
    sheet.getCell(`A${row}`).value = 'Summary Statistics';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    row++;
    summaryRows.forEach(([label, value]) => {
        sheet.getCell(`A${row}`).value = label;
        sheet.getCell(`A${row}`).font = { bold: true };
        sheet.getCell(`B${row}`).value = value;
        row++;
    });

    row++;
    // Headers
    const headerRow = sheet.getRow(row);
    columns.forEach((col, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = col.header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
        cell.alignment = { horizontal: 'center' };
        sheet.getColumn(i + 1).width = col.width || 20;
    });
    row++;

    // Data rows
    dataRows.forEach((dataRow, ri) => {
        const excelRow = sheet.getRow(row + ri);
        columns.forEach((col, ci) => {
            excelRow.getCell(ci + 1).value = dataRow[col.key] ?? '';
        });
        excelRow.fill = ri % 2 === 0
            ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
            : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    });

    return workbook;
};

const generateCampaignReport = async () => {
    const campaigns = await getCampaigns();
    const [[statRow]] = await db.query('SELECT COUNT(*) as total, SUM(raised_amount) as raised FROM campaigns');
    const summary = [
        ['Total Campaigns', campaigns.length],
        ['Total Raised', `$${parseFloat(statRow.raised || 0).toFixed(2)}`],
        ['Pending', campaigns.filter(c => c.status === 'pending').length],
        ['Approved', campaigns.filter(c => c.status === 'approved').length],
        ['Rejected', campaigns.filter(c => c.status === 'rejected').length],
    ];
    const columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'NGO', key: 'ngo_name', width: 25 },
        { header: 'Category', key: 'category_name', width: 20 },
        { header: 'Goal Amount', key: 'goal_amount', width: 15 },
        { header: 'Raised Amount', key: 'raised_amount', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Created Date', key: 'created_at', width: 20 },
    ];
    const rows = campaigns.map(c => ({ ...c, created_at: new Date(c.created_at).toLocaleDateString() }));
    return buildExcelReport('Lifeline — Campaign Report', summary, columns, rows);
};

const generateDonationReport = async () => {
    const [donations] = await db.query(`
        SELECT d.id, u.name as donor_name, c.title as campaign_title,
               d.amount, d.status, d.is_anonymous, d.created_at
        FROM donations d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN campaigns c ON d.campaign_id = c.id
        ORDER BY d.created_at DESC
    `);
    const [[statRow]] = await db.query("SELECT COUNT(*) as total, SUM(amount) as raised FROM donations WHERE status='success'");
    const summary = [
        ['Total Donations', donations.length],
        ['Successful Donations', statRow.total],
        ['Total Amount Raised', `$${parseFloat(statRow.raised || 0).toFixed(2)}`],
    ];
    const columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Donor', key: 'donor_name', width: 25 },
        { header: 'Campaign', key: 'campaign_title', width: 30 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Anonymous', key: 'is_anonymous', width: 12 },
        { header: 'Date', key: 'created_at', width: 20 },
    ];
    const rows = donations.map(d => ({
        ...d,
        is_anonymous: d.is_anonymous ? 'Yes' : 'No',
        created_at: new Date(d.created_at).toLocaleDateString()
    }));
    return buildExcelReport('Lifeline — Donation Report', summary, columns, rows);
};

const generateUserReport = async () => {
    const users = await getUsers();
    const [[statRow]] = await db.query('SELECT COUNT(*) as total FROM users WHERE is_active = 1');
    const summary = [
        ['Total Users', users.length],
        ['Active Users', statRow.total],
        ['Donors', users.filter(u => u.role === 'donor').length],
        ['Volunteers', users.filter(u => u.role === 'volunteer').length],
        ['NGOs', users.filter(u => u.role === 'ngo').length],
        ['Beneficiaries', users.filter(u => u.role === 'beneficiary').length],
    ];
    const columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Status', key: 'is_active', width: 12 },
        { header: 'Joined Date', key: 'created_at', width: 20 },
    ];
    const rows = users.map(u => ({
        ...u,
        is_active: u.is_active ? 'Active' : 'Blocked',
        created_at: new Date(u.created_at).toLocaleDateString()
    }));
    return buildExcelReport('Lifeline — User Report', summary, columns, rows);
};

module.exports = {
    getSystemStats,
    getCampaigns, editCampaign, deleteCampaign, updateCampaignStatus,
    getUsers, updateUserStatus,
    getNGOs, updateNGOStatus,
    getVolunteers, updateVolunteerStatus, assignVolunteerToEvent,
    getBeneficiaryRequests, updateBeneficiaryStatus,
    generateCampaignReport, generateDonationReport, generateUserReport,
};
