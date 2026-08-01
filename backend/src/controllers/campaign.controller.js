const campaignService = require('../services/campaign.service');

const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await campaignService.getCampaigns();
        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getCampaignById = async (req, res) => {
    try {
        const campaign = await campaignService.getCampaignById(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        // Public statuses — anyone can view these campaigns
        const publicStatuses = ['approved', 'completed', 'target_reached'];

        if (!publicStatuses.includes(campaign.status)) {
            // Non-public campaign — only admin or the NGO owner can view
            const authHeader = req.headers.authorization;
            let isAdminOrOwner = false;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const { verifyAccessToken } = require('../utils/jwt.util');
                    const decoded = verifyAccessToken(token);
                    if (decoded.role === 'admin' || (decoded.role === 'ngo' && campaign.ngo_id === decoded.ngo_id)) {
                        isAdminOrOwner = true;
                    }
                } catch (e) {
                    // Ignore token errors
                }
            }
            if (!isAdminOrOwner) {
                return res.status(403).json({ message: 'This campaign is not active or approved' });
            }
        }

        res.json(campaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createCampaign = async (req, res) => {
    try {
        const campaignId = await campaignService.createCampaign(req.body, req.user.id);
        
        // Trigger Admin Notification
        const { createAdminNotification } = require('../services/notification.service');
        await createAdminNotification({
            title: 'New Campaign Submitted',
            message: `Campaign "${req.body.title}" was submitted for approval. Goal: $${req.body.goal_amount}.`,
            type: 'campaign_approval',
            priority: 'high'
        });

        res.status(201).json({ message: 'Campaign created successfully', campaignId });
    } catch (error) {
        console.error(error);
        if (error.message.includes('not found') || error.message.includes('not assigned') || error.message.includes('not in the correct status') || error.message.includes('already exists')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateCampaign = async (req, res) => {
    try {
        await campaignService.updateCampaign(req.params.id, req.body);
        res.json({ message: 'Campaign updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteCampaign = async (req, res) => {
    try {
        await campaignService.deleteCampaign(req.params.id);
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const approveRejectCampaign = async (req, res) => {
    try {
        await campaignService.updateCampaignStatus(req.params.id, req.body.status);

        const { createAdminNotification, createNGONotification } = require('../services/notification.service');

        // Notify admins
        await createAdminNotification({
            title: `Campaign ${req.body.status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`,
            message: `Campaign ID #${req.params.id} has been marked as ${req.body.status}.`,
            type: 'campaign_status',
            priority: 'normal'
        });

        // Notify the NGO that owns this campaign
        try {
            const db = require('../config/db');
            const [rows] = await db.query(
                `SELECT np.user_id FROM campaigns c
                 JOIN ngo_profiles np ON np.id = c.ngo_id
                 WHERE c.id = ?`, [req.params.id]
            );
            if (rows.length > 0) {
                const ngoUserId = rows[0].user_id;
                const isApproved = req.body.status === 'approved';
                await createNGONotification(ngoUserId, {
                    title: isApproved ? '✅ Campaign Approved!' : '❌ Campaign Rejected',
                    message: isApproved
                        ? `Great news! Your campaign #${req.params.id} has been approved and is now live.`
                        : `Your campaign #${req.params.id} was rejected. Please review and resubmit.`,
                    type: isApproved ? 'campaign_approved' : 'campaign_rejected',
                    priority: 'high'
                });
            }
        } catch (ngoErr) {
            console.error('NGO campaign notification error:', ngoErr.message);
        }

        res.json({ message: `Campaign ${req.body.status} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const uploadGallery = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        await campaignService.addCampaignGallery(req.params.id, imageUrls);
        res.json({ message: 'Gallery updated successfully', imageUrls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    approveRejectCampaign,
    uploadGallery
};
