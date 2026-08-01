const adminService = require('../services/admin.service');

// ── Stats ──────────────────────────────────────────────────────────
const getSystemStats = async (req, res) => {
    try { res.json(await adminService.getSystemStats()); }
    catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

// ── Campaigns ──────────────────────────────────────────────────────
const getCampaigns = async (req, res) => {
    try { res.json({ campaigns: await adminService.getCampaigns(req.query.status) }); }
    catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const editCampaign = async (req, res) => {
    try { await adminService.editCampaign(req.params.id, req.body); res.json({ message: 'Campaign updated' }); }
    catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const deleteCampaign = async (req, res) => {
    try { await adminService.deleteCampaign(req.params.id); res.json({ message: 'Campaign deleted' }); }
    catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const updateCampaignStatus = async (req, res) => {
    try { await adminService.updateCampaignStatus(req.params.id, req.body.status); res.json({ message: 'Status updated' }); }
    catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

// ── Users ──────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
    try { res.json(await adminService.getUsers(req.user.id)); }
    catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const updateUserStatus = async (req, res) => {
    try {
        await adminService.updateUserStatus(req.params.id, req.body.isActive);
        res.json({ message: 'User status updated' });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

// ── NGOs ───────────────────────────────────────────────────────────
const getNGOs = async (req, res) => {
    try { res.json(await adminService.getNGOs()); }
    catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const updateNGOStatus = async (req, res) => {
    try {
        await adminService.updateNGOStatus(req.params.id, req.body.status);
        res.json({ message: 'NGO status updated' });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

// ── Volunteers ─────────────────────────────────────────────────────
const getVolunteers = async (req, res) => {
    try { res.json(await adminService.getVolunteers()); }
    catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const updateVolunteerStatus = async (req, res) => {
    try {
        await adminService.updateVolunteerStatus(req.params.id, req.body.status);
        res.json({ message: 'Volunteer status updated' });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

// ── Beneficiaries ──────────────────────────────────────────────────
const getBeneficiaryRequests = async (req, res) => {
    try { res.json(await adminService.getBeneficiaryRequests(req.query.search)); }
    catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const getBeneficiaryById = async (req, res) => {
    try {
        const beneficiaryService = require('../services/beneficiary.service');
        const request = await beneficiaryService.getHelpRequestById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        res.json(request);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const updateBeneficiaryStatus = async (req, res) => {
    try {
        await adminService.updateBeneficiaryStatus(req.params.id, req.body.status, req.body.adminNote);
        res.json({ message: 'Beneficiary request status updated' });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const reAnalyzeBeneficiary = async (req, res) => {
    try {
        const aiVerificationService = require('../services/aiVerification.service');
        const report = await aiVerificationService.analyzeHelpRequest(req.params.id);
        res.json({ message: 'AI re-analysis completed successfully', report });
    } catch (e) { console.error(e); res.status(500).json({ message: 'Failed to run AI re-analysis' }); }
};

// ── Excel Exports ──────────────────────────────────────────────────
const exportCampaigns = async (req, res) => {
    try {
        const wb = await adminService.generateCampaignReport();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=campaigns_report.xlsx');
        await wb.xlsx.write(res);
        res.end();
    } catch (e) { console.error(e); res.status(500).json({ message: 'Export failed' }); }
};

const exportDonations = async (req, res) => {
    try {
        const wb = await adminService.generateDonationReport();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=donations_report.xlsx');
        await wb.xlsx.write(res);
        res.end();
    } catch (e) { console.error(e); res.status(500).json({ message: 'Export failed' }); }
};

const exportUsers = async (req, res) => {
    try {
        const wb = await adminService.generateUserReport();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users_report.xlsx');
        await wb.xlsx.write(res);
        res.end();
    } catch (e) { console.error(e); res.status(500).json({ message: 'Export failed' }); }
};

// ── Donations ──────────────────────────────────────────────────────
const getDonations = async (req, res) => {
    try {
        const donations = await adminService.getAdminDonations(req.query.status, req.query.search);
        res.json(donations);
    } catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

module.exports = {
    getSystemStats,
    getCampaigns, editCampaign, deleteCampaign, updateCampaignStatus,
    getUsers, updateUserStatus,
    getNGOs, updateNGOStatus,
    getVolunteers, updateVolunteerStatus,
    getBeneficiaryRequests, getBeneficiaryById, updateBeneficiaryStatus, reAnalyzeBeneficiary,
    exportCampaigns, exportDonations, exportUsers,
    getDonations,
};
