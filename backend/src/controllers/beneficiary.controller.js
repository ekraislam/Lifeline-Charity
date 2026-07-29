const beneficiaryService = require('../services/beneficiary.service');

const submitHelpRequest = async (req, res) => {
    try {
        const requestId = await beneficiaryService.submitHelpRequest(req.user.id, req.body);
        
        // Handle document uploads if files are present
        if (req.files && req.files.length > 0) {
            const documentUrls = req.files.map(file => `/uploads/${file.filename}`);
            await beneficiaryService.uploadDocuments(requestId, documentUrls);
        }
        
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
        const requests = await beneficiaryService.getWaitingRequests();
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// NGO: accept/claim a request
const acceptRequest = async (req, res) => {
    try {
        await beneficiaryService.acceptRequest(req.params.id, req.user.id);
        res.json({ message: 'Request accepted successfully. Beneficiary is now assigned to your NGO.' });
    } catch (error) {
        console.error(error);
        if (error.message.includes('already been assigned') || error.message.includes('not found') || error.message.includes('not approved')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
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

module.exports = {
    submitHelpRequest,
    uploadDocuments,
    getAllRequests,
    getRequestById,
    updateRequestStatus,
    getWaitingRequests,
    acceptRequest,
    getMyAssigned
};
