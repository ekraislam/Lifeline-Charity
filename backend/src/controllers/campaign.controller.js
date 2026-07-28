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
        res.json(campaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createCampaign = async (req, res) => {
    try {
        const campaignId = await campaignService.createCampaign(req.body, req.user.id);
        res.status(201).json({ message: 'Campaign created successfully', campaignId });
    } catch (error) {
        console.error(error);
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
