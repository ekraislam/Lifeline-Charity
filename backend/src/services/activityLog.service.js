const db = require('../config/db');
const { getIo } = require('../sockets/socket');

const ICON_MAP = {
    user_registered: '👤',
    user_login: '🔑',
    beneficiary_submitted: '📋',
    beneficiary_updated: '📝',
    documents_uploaded: '📁',
    ai_verification_completed: '🤖',
    admin_approved_request: '✅',
    admin_rejected_request: '❌',
    ngo_registered: '🏢',
    ngo_approved: '✅',
    ngo_created_campaign: '📢',
    campaign_updated: '📝',
    campaign_published: '🚀',
    campaign_completed: '🎉',
    campaign_closed: '🔒',
    donation_success: '💳',
    anonymous_donation: '🎁',
    volunteer_registered: '🙋',
    volunteer_approved: '✅',
    volunteer_assigned: '📅',
    event_created: '📅',
    event_updated: '✏️',
    event_completed: '🏆',
    payout_completed: '💸',
    admin_action: '⚡',
    profile_updated: '⚙️'
};

const COLOR_TYPE_MAP = {
    admin_approved_request: 'success',
    ngo_approved: 'success',
    campaign_published: 'success',
    campaign_completed: 'success',
    donation_success: 'success',
    anonymous_donation: 'success',
    volunteer_approved: 'success',
    event_completed: 'success',
    payout_completed: 'success',

    beneficiary_submitted: 'warning',
    campaign_updated: 'warning',
    ngo_created_campaign: 'warning',
    admin_action: 'warning',

    admin_rejected_request: 'critical',
    campaign_closed: 'critical'
};

const logActivity = async ({
    userId = null,
    userName = 'System User',
    userRole = 'User',
    activityType = 'system_event',
    activityTitle,
    activityDescription = '',
    relatedId = null
}) => {
    try {
        const [result] = await db.query(
            `INSERT INTO activity_logs (user_id, user_name, user_role, activity_type, activity_title, activity_description, related_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, userName, userRole, activityType, activityTitle, activityDescription, relatedId]
        );

        const activityRecord = {
            id: result.insertId,
            user_id: userId,
            user: userName,
            role: userRole,
            type: COLOR_TYPE_MAP[activityType] || 'info',
            icon: ICON_MAP[activityType] || '📌',
            activity_type: activityType,
            title: activityTitle,
            description: activityDescription,
            related_id: relatedId,
            timestamp: new Date()
        };

        try {
            const io = getIo();
            if (io) {
                io.emit('activity_logged', activityRecord);
            }
        } catch (e) {
            // Ignore if socket not ready
        }

        return activityRecord;
    } catch (error) {
        console.error('Failed to insert activity log:', error.message);
        return null;
    }
};

const getRecentActivities = async (limit = 30) => {
    try {
        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
        const [rows] = await db.query(
            `SELECT id, user_id, user_name as user, user_role as role, activity_type, 
                    activity_title as title, activity_description as description, 
                    related_id, created_at as timestamp
             FROM activity_logs
             ORDER BY created_at DESC
             LIMIT ${safeLimit}`
        );


        return rows.map(r => ({
            ...r,
            icon: ICON_MAP[r.activity_type] || '📌',
            type: COLOR_TYPE_MAP[r.activity_type] || 'info'
        }));
    } catch (error) {
        console.error('Failed to fetch activity logs:', error.message);
        return [];
    }
};

module.exports = {
    logActivity,
    getRecentActivities
};
