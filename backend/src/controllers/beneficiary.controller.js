const beneficiaryService = require('../services/beneficiary.service');

const submitHelpRequest = async (req, res) => {
    try {
        const requestId = await beneficiaryService.submitHelpRequest(req.user.id, req.body);
        
        // Handle document uploads if files are present
        if (req.files && req.files.length > 0) {
            const documentUrls = req.files.map(file => `/uploads/${file.filename}`);
            await beneficiaryService.uploadDocuments(requestId, documentUrls);
        }
        
        // Trigger Admin Notification
        const { createAdminNotification } = require('../services/notification.service');
        await createAdminNotification({
            title: 'New Beneficiary Help Request',
            message: `Beneficiary "${req.user.name || 'User'}" submitted a help request: "${req.body.title}".`,
            type: 'beneficiary_request',
            priority: 'high'
        });

        res.status(201).json({ message: 'Help request submitted successfully', requestId });
    } catch (error) {
        console.error(error);
        if (error.message === 'Beneficiary profile not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

const uploadDocuments = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No documents uploaded' });
        }
        const documentUrls = req.files.map(file => `/uploads/${file.filename}`);
        await beneficiaryService.uploadDocuments(req.params.id, documentUrls);
        res.json({ message: 'Documents uploaded successfully', documentUrls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllRequests = async (req, res) => {
    try {
        const requests = await beneficiaryService.getHelpRequests({
            userId: req.user.id,
            role: req.user.role
        });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getRequestById = async (req, res) => {
    try {
        const request = await beneficiaryService.getHelpRequestById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        res.json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        await beneficiaryService.updateRequestStatus(req.params.id, req.body.status, req.user.id);
        res.json({ message: `Request status updated to ${req.body.status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// NGO: get waiting_for_ngo requests
const getWaitingRequests = async (req, res) => {
    try {
        const requests = await beneficiaryService.getWaitingRequests(req.user.id);
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// NGO: accept/claim a request
const acceptRequest = async (req, res) => {
    try {
        const result = await beneficiaryService.acceptRequest(req.params.id, req.user.id);
        res.json({ message: 'Request accepted successfully. Beneficiary is now assigned to your NGO.', result });
    } catch (error) {
        console.error("acceptRequest controller error:", error);
        res.status(400).json({ message: error.message || 'Failed to accept help request' });
    }
};

// NGO: decline a request
const declineRequest = async (req, res) => {
    try {
        const { reason, custom_reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: 'Decline reason is required' });
        }
        await beneficiaryService.declineRequest(req.params.id, req.user.id, { reason, custom_reason });
        res.json({ message: 'Help request declined successfully.' });
    } catch (error) {
        console.error("declineRequest controller error:", error);
        res.status(400).json({ message: error.message || 'Failed to decline help request' });
    }
};


// NGO: get my assigned beneficiaries
const getMyAssigned = async (req, res) => {
    try {
        const assigned = await beneficiaryService.getMyAssignedBeneficiaries(req.user.id);
        res.json(assigned);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteHelpRequest = async (req, res) => {
    try {
        await beneficiaryService.deleteHelpRequest(req.params.id, req.user.id);
        res.json({ message: 'Help request deleted successfully' });
    } catch (error) {
        console.error("deleteHelpRequest controller error:", error);
        res.status(400).json({ message: error.message || 'Failed to delete help request' });
    }
};

module.exports = {
    submitHelpRequest,
    uploadDocuments,
    getAllRequests,
    getRequestById,
    updateRequestStatus,
    getWaitingRequests,
    acceptRequest,
    declineRequest,
    getMyAssigned,
    deleteHelpRequest
};


