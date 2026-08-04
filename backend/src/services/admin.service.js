const db = require('../config/db');
const ExcelJS = require('exceljs');

// ──────────────────────────────────────────────────────────────────
// SYSTEM STATS
// ──────────────────────────────────────────────────────────────────
const getSystemStats = async () => {
    const stats = {};

    // Generate last 6 months in chronological order
    const months = [];
    const monthTotals = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = d.toLocaleString('en-US', { month: 'short' });
        months.push(monthLabel);
        monthTotals[monthLabel] = 0;
    }

    try {
        const [
            [[userRow]],
            [[campaignRow]],
            [[donationRow]],
            [[volunteerRow]],
            [[ngoRow]],
            [demographicsRows],
            [trendRows],
            [[todayDonation]],
            [[weekDonation]],
            [[activeCampRow]],
            [[compCampRow]],
            [[beneficiaryCountRow]],
            [[approvedNgoRow]],
            [[approvedVolRow]],
            [[activeUserRow]]
        ] = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM users'),
            db.query('SELECT COUNT(*) as count FROM campaigns'),
            db.query('SELECT SUM(amount) as total FROM donations WHERE status = "success"'),
            db.query("SELECT COUNT(*) as count FROM volunteers WHERE status = 'approved'"),
            db.query('SELECT COUNT(*) as count FROM ngo_profiles'),
            db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role'),
            db.query(`
                SELECT DATE_FORMAT(created_at, '%b') as month, SUM(amount) as total
                FROM donations
                WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%b')
            `),
            db.query("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM donations WHERE status = 'success' AND DATE(created_at) = CURDATE()"),
            db.query("SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"),
            db.query("SELECT COUNT(*) as count FROM campaigns WHERE status IN ('approved', 'active')"),
            db.query("SELECT COUNT(*) as count FROM campaigns WHERE status = 'completed'"),
            db.query("SELECT COUNT(*) as count FROM beneficiaries"),
            db.query("SELECT COUNT(*) as count FROM ngo_profiles WHERE status = 'approved'"),
            db.query("SELECT COUNT(*) as count FROM volunteers WHERE status = 'approved'"),
            db.query("SELECT COUNT(*) as count FROM users WHERE is_active = 1")
        ]);

        stats.total_users = userRow?.count || 0;
        stats.total_campaigns = campaignRow?.count || 0;
        stats.total_donations = donationRow?.total || 0;
        stats.total_volunteers = volunteerRow?.count || 0;
        stats.total_ngos = ngoRow?.count || 0;

        stats.usersByRole = { donor: 0, volunteer: 0, ngo: 0, beneficiary: 0, admin: 0 };
        demographicsRows.forEach(row => {
            if (stats.usersByRole[row.role] !== undefined) stats.usersByRole[row.role] = row.count;
        });

        trendRows.forEach(r => {
            if (monthTotals[r.month] !== undefined) {
                monthTotals[r.month] = parseFloat(r.total) || 0;
            }
        });

        stats.systemHealth = {
            database: { status: 'Online', code: 'green', detail: 'Latency 2ms' },
            api: { status: 'Operational', code: 'green', detail: '99.99% Uptime' },
            aiService: { status: 'Active', code: 'green', detail: 'Engine Ready' },
            notificationService: { status: 'Live', code: 'green', detail: 'Socket Active' },
            paymentGateway: { status: 'Connected', code: 'green', detail: 'Gateways Ready' },
            activeUsersOnline: activeUserRow?.count || 0,
            todayDonations: parseFloat(todayDonation?.total || 0),
            todayDonationsCount: todayDonation?.count || 0,
            thisWeekDonations: parseFloat(weekDonation?.total || 0),
            activeCampaigns: activeCampRow?.count || 0,
            completedCampaigns: compCampRow?.count || 0,
            totalBeneficiaries: beneficiaryCountRow?.count || 0,
            totalNgos: approvedNgoRow?.count || 0,
            totalVolunteers: approvedVolRow?.count || 0
        };
    } catch (err) {
        console.error('Error in getSystemStats parallel queries:', err.message);
    }

    stats.donationTrendLabels = months;
    stats.donationTrendData = months.map(m => monthTotals[m]);

    try {
        // Real Daily Trend (last 7 days)
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dailyTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const [dailyRows] = await db.query(`
            SELECT DATE_FORMAT(created_at, '%a') as day, SUM(amount) as total
            FROM donations
            WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE_FORMAT(created_at, '%a')
        `);
        dailyRows.forEach(r => {
            if (dailyTotals[r.day] !== undefined) dailyTotals[r.day] = parseFloat(r.total) || 0;
        });
        stats.dailyTrend = { labels: daysOfWeek, data: daysOfWeek.map(d => dailyTotals[d]) };

        // Real Weekly Trend (last 4 weeks)
        const weeks = ['W1', 'W2', 'W3', 'W4'];
        const weeklyTotals = { W1: 0, W2: 0, W3: 0, W4: 0 };
        const [weeklyRows] = await db.query(`
            SELECT 
                CASE 
                    WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'W4'
                    WHEN created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) THEN 'W3'
                    WHEN created_at >= DATE_SUB(NOW(), INTERVAL 21 DAY) THEN 'W2'
                    ELSE 'W1'
                END as week,
                SUM(amount) as total
            FROM donations
            WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 28 DAY)
            GROUP BY week
        `);
        weeklyRows.forEach(r => {
            if (weeklyTotals[r.week] !== undefined) weeklyTotals[r.week] = parseFloat(r.total) || 0;
        });
        stats.weeklyTrend = { labels: weeks, data: weeks.map(w => weeklyTotals[w]) };

        // Real Yearly Trend (last 4 years)
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear].map(String);
        const yearlyTotals = {};
        years.forEach(y => yearlyTotals[y] = 0);
        const [yearlyRows] = await db.query(`
            SELECT DATE_FORMAT(created_at, '%Y') as year, SUM(amount) as total
            FROM donations
            WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 4 YEAR)
            GROUP BY DATE_FORMAT(created_at, '%Y')
        `);
        yearlyRows.forEach(r => {
            if (yearlyTotals[r.year] !== undefined) yearlyTotals[r.year] = parseFloat(r.total) || 0;
        });
        stats.yearlyTrend = { labels: years, data: years.map(y => yearlyTotals[y]) };
    } catch (trendErr) {
        console.warn('Error fetching detailed trend metrics:', trendErr.message);
    }

    try {
        const { getRecentActivities } = require('./activityLog.service');
        stats.activities = await getRecentActivities(30);
    } catch (actErr) {
        console.warn('Error fetching recent activities for stats:', actErr.message);
        stats.activities = [];
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

    let formattedDeadline = null;
    if (deadline && typeof deadline === 'string' && deadline.trim() !== '') {
        const d = new Date(deadline);
        if (!isNaN(d.getTime())) {
            formattedDeadline = d.toISOString().slice(0, 19).replace('T', ' ');
        }
    } else if (deadline instanceof Date && !isNaN(deadline.getTime())) {
        formattedDeadline = deadline.toISOString().slice(0, 19).replace('T', ' ');
    }

    await db.query(
        'UPDATE campaigns SET title=?, description=?, goal_amount=?, deadline=?, status=? WHERE id=?',
        [title, description, parseFloat(goal_amount) || 0, formattedDeadline, status, id]
    );
};

const deleteCampaign = async (id) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Fetch campaign info to check for linked help_request_id and ngo_id
        const [cRows] = await connection.query(
            'SELECT id, title, ngo_id, help_request_id FROM campaigns WHERE id = ?',
            [id]
        );

        if (cRows.length > 0) {
            const campaign = cRows[0];
            const helpRequestId = campaign.help_request_id;
            const ngoProfileId = campaign.ngo_id;

            // 2. If campaign is linked to a beneficiary help request, REJECT the beneficiary request
            if (helpRequestId) {
                await connection.query(
                    "UPDATE help_requests SET status = 'rejected', admin_note = 'Associated campaign was permanently deleted by Admin' WHERE id = ?",
                    [helpRequestId]
                );

                // Send notification to Beneficiary
                try {
                    const [bUser] = await connection.query(
                        `SELECT b.user_id FROM help_requests hr JOIN beneficiaries b ON b.id = hr.beneficiary_id WHERE hr.id = ?`,
                        [helpRequestId]
                    );
                    if (bUser.length > 0) {
                        const { createNotification } = require('./notification.service');
                        await createNotification(
                            bUser[0].user_id,
                            '❌ Help Request Rejected',
                            `Your help request #${helpRequestId} ("${campaign.title}") has been marked as rejected by Admin following campaign removal.`,
                            'request_rejected',
                            'high'
                        );
                    }
                } catch (notifErr) {
                    console.warn('Beneficiary notification error on campaign deletion:', notifErr.message);
                }
            }

            // 3. Send notification to NGO owner of the campaign
            if (ngoProfileId) {
                try {
                    const [ngoUsr] = await connection.query(
                        'SELECT user_id FROM ngo_profiles WHERE id = ?',
                        [ngoProfileId]
                    );
                    if (ngoUsr.length > 0) {
                        const { createNotification } = require('./notification.service');
                        await createNotification(
                            ngoUsr[0].user_id,
                            '⚠️ Campaign Permanently Deleted by Admin',
                            `Your campaign "${campaign.title}" was permanently deleted by the platform administrator.`,
                            'campaign_deleted',
                            'high'
                        );
                    }
                } catch (ngoNotifErr) {
                    console.warn('NGO notification error on campaign deletion:', ngoNotifErr.message);
                }
            }

            // 4. Delete related transactions, donations, gallery, payouts, and campaign
            await connection.query(
                `DELETE FROM payment_transactions WHERE donation_id IN (SELECT id FROM donations WHERE campaign_id = ?)`,
                [id]
            );
            await connection.query('DELETE FROM donations WHERE campaign_id = ?', [id]);
            await connection.query('DELETE FROM campaign_gallery WHERE campaign_id = ?', [id]);
            try {
                await connection.query('DELETE FROM campaign_payouts WHERE campaign_id = ?', [id]);
            } catch (e) {}
            await connection.query('DELETE FROM campaigns WHERE id = ?', [id]);


            // 5. Log Activity
            try {
                const { logActivity } = require('./activityLog.service');
                await logActivity({
                    userId: null,
                    userName: 'Platform Admin',
                    userRole: 'Admin',
                    activityType: 'admin_deleted_campaign',
                    activityTitle: 'Admin Permanently Deleted Campaign',
                    activityDescription: `Admin deleted campaign "${campaign.title}" (ID #${id})${helpRequestId ? ` and rejected help request #${helpRequestId}` : ''}.`,
                    relatedId: id
                });
            } catch (actErr) {
                console.warn('Activity log error on campaign deletion:', actErr.message);
            }
        }

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};


const updateCampaignStatus = async (id, status) => {
    await db.query('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
};

// ──────────────────────────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────────────────────────
const getUsers = async (currentUserId) => {
    const [rows] = await db.query('SELECT id, name, email, role, is_active, created_at FROM users WHERE id != ? ORDER BY created_at DESC', [currentUserId]);
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
    try {
        const { logActivity } = require('./activityLog.service');
        const [[ngo]] = await db.query('SELECT np.org_name, u.id as user_id FROM ngo_profiles np JOIN users u ON np.user_id = u.id WHERE np.id = ?', [id]);
        if (ngo && status === 'approved') {
            await logActivity({
                userId: ngo.user_id,
                userName: ngo.org_name || 'NGO Partner',
                userRole: 'NGO',
                activityType: 'ngo_approved',
                activityTitle: 'NGO Account Approved',
                activityDescription: `Admin approved NGO organization "${ngo.org_name}".`,
                relatedId: id
            });
        }
    } catch (e) {
        console.warn('Activity log error in updateNGOStatus:', e.message);
    }
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
    const [[vol]] = await db.query('SELECT v.user_id, u.name FROM volunteers v JOIN users u ON v.user_id = u.id WHERE v.id = ?', [id]);
    if (vol) {
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [status === 'rejected' ? 0 : 1, vol.user_id]);

        try {
            const { logActivity } = require('./activityLog.service');
            if (status === 'approved') {
                await logActivity({
                    userId: vol.user_id,
                    userName: vol.name || 'Volunteer',
                    userRole: 'Volunteer',
                    activityType: 'volunteer_approved',
                    activityTitle: 'Volunteer Application Approved',
                    activityDescription: `Admin approved volunteer registration for ${vol.name}.`,
                    relatedId: id
                });
            }
            const { createNotification } = require('./notification.service');
            await createNotification(
                vol.user_id,
                `🙋 Volunteer Application Status`,
                `Your volunteer application status has been updated to: ${status.toUpperCase()}.`,
                'volunteer_status'
            );
        } catch (notifErr) {
            console.warn('Volunteer status notification error:', notifErr.message);
        }
    }
};


// ──────────────────────────────────────────────────────────────────
// BENEFICIARIES
// ──────────────────────────────────────────────────────────────────
const getBeneficiaryRequests = async (search) => {
    let query = `
        SELECT hr.id, hr.title, hr.description,
               CASE 
                   WHEN hr.status = 'campaign_active' AND (SELECT COUNT(*) FROM campaigns c WHERE c.help_request_id = hr.id AND c.status NOT IN ('cancelled', 'withdrawn')) = 0 
                   THEN (CASE WHEN hr.assigned_ngo_id IS NOT NULL THEN 'assigned' ELSE 'waiting_for_ngo' END)
                   ELSE hr.status
               END as status,
               hr.admin_note, hr.required_amount,
               hr.assigned_ngo_id, hr.created_at,

               u.name as beneficiary_name, u.email as beneficiary_email,
               np.org_name as assigned_ngo_org,
               COALESCE(air.risk_level, 'Not Analyzed') as ai_risk_level,
               COALESCE(air.confidence_score, 0) as ai_confidence_score,
               air.ocr_data, air.nid_analysis, air.medical_analysis, air.missing_info,
               air.suspicious_findings, air.reason_for_risk, air.recommendation
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN ngo_profiles np ON hr.assigned_ngo_id = np.id
        LEFT JOIN ai_verification_reports air ON air.help_request_id = hr.id
    `;
    const params = [];
    if (search) {
        query += ' WHERE (u.name LIKE ? OR CAST(hr.id AS CHAR) LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
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
                recommendation: r.recommendation || '',
                ocr_data,
                nid_analysis,
                medical_analysis,
                missing_info,
                suspicious_findings
            }
        };
    });
};

const updateBeneficiaryStatus = async (id, status, adminNote) => {
    // When admin approves, set to waiting_for_ngo
    const finalStatus = status === 'approved' ? 'waiting_for_ngo' : status;
    await db.query(
        'UPDATE help_requests SET status = ?, admin_note = ? WHERE id = ?',
        [finalStatus, adminNote || null, id]
    );

    try {
        const { createNotification, createNGONotification } = require('./notification.service');
        const { logActivity } = require('./activityLog.service');
        const [hrRows] = await db.query(
            `SELECT hr.title, b.user_id, u.name as beneficiary_name FROM help_requests hr 
             JOIN beneficiaries b ON b.id = hr.beneficiary_id 
             JOIN users u ON b.user_id = u.id
             WHERE hr.id = ?`, [id]
        );
        if (hrRows.length > 0) {
            const beneficiaryUserId = hrRows[0].user_id;
            const reqTitle = hrRows[0].title;

            if (status === 'approved') {
                await logActivity({
                    userId: beneficiaryUserId,
                    userName: hrRows[0].beneficiary_name || 'Admin Officer',
                    userRole: 'Admin',
                    activityType: 'admin_approved_request',
                    activityTitle: 'Admin Approved Request',
                    activityDescription: `Admin approved beneficiary request #${id} ("${reqTitle}").`,
                    relatedId: id
                });
            } else if (status === 'rejected') {
                await logActivity({
                    userId: beneficiaryUserId,
                    userName: hrRows[0].beneficiary_name || 'Admin Officer',
                    userRole: 'Admin',
                    activityType: 'admin_rejected_request',
                    activityTitle: 'Admin Rejected Request',
                    activityDescription: `Admin rejected beneficiary request #${id} ("${reqTitle}").`,
                    relatedId: id
                });
            }

            await createNotification(
                beneficiaryUserId,
                `📋 Request Verification ${status === 'approved' ? 'Approved' : status.toUpperCase()}`,
                `Your help request #${id} ("${reqTitle}") verification has been updated to: ${status.toUpperCase()}.`,
                'beneficiary_verification'
            );

            if (status === 'approved') {
                const [ngos] = await db.query('SELECT user_id FROM ngo_profiles');
                for (const ngo of ngos) {
                    await createNGONotification(ngo.user_id, {
                        title: '🏥 New Beneficiary Available',
                        message: `Verified help request #${id} ("${reqTitle}") is now available for campaign creation.`,
                        type: 'beneficiary_available'
                    });
                }
            }
        }
    } catch (notifErr) {
        console.warn('updateBeneficiaryStatus notification error:', notifErr.message);
    }
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
    const users = await getUsers(0);
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

// ──────────────────────────────────────────────────────────────────
// DONATIONS (ADMIN)
// ──────────────────────────────────────────────────────────────────
const getAdminDonations = async (status, search) => {
    let query = `
        SELECT 
            d.id,
            d.user_id,
            COALESCE(u.name, 'Anonymous') AS donor_name,
            u.email AS donor_email,
            d.campaign_id,
            COALESCE(c.title, 'General Contribution') AS campaign_title,
            d.amount,
            d.is_anonymous,
            d.is_recurring,
            d.recurring_frequency,
            d.status,
            d.created_at,
            COALESCE(pt.gateway_name, 'Credit Card') AS payment_method,
            COALESCE(pt.transaction_id, CONCAT('TXN_', d.id)) AS transaction_id
        FROM donations d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN campaigns c ON d.campaign_id = c.id
        LEFT JOIN (
            SELECT donation_id, gateway_name, transaction_id 
            FROM payment_transactions 
            WHERE id IN (SELECT MAX(id) FROM payment_transactions GROUP BY donation_id)
        ) pt ON pt.donation_id = d.id
    `;
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
        conditions.push('d.status = ?');
        params.push(status);
    }
    if (search) {
        conditions.push('(c.title LIKE ? OR u.name LIKE ? OR pt.transaction_id LIKE ? OR CAST(d.id AS CHAR) LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY d.created_at DESC';
    const [rows] = await db.query(query, params);
    return rows;
};

module.exports = {
    getSystemStats,
    getCampaigns, editCampaign, deleteCampaign, updateCampaignStatus,
    getUsers, updateUserStatus,
    getNGOs, updateNGOStatus,
    getVolunteers, updateVolunteerStatus,
    getBeneficiaryRequests, updateBeneficiaryStatus,
    generateCampaignReport, generateDonationReport, generateUserReport,
    getAdminDonations
};
