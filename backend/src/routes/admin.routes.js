const express = require('express');
const router = express.Router();
const c = require('../controllers/admin.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Stats & Activities
router.get('/stats', c.getSystemStats);
router.get('/activities', c.getActivityLogs);


// Campaigns
router.get('/campaigns', c.getCampaigns);
router.put('/campaigns/:id', c.editCampaign);
router.delete('/campaigns/:id', c.deleteCampaign);
router.put('/campaigns/:id/status', c.updateCampaignStatus);

// Users
router.get('/users', c.getUsers);
router.put('/users/:id/status', c.updateUserStatus);

// NGOs
router.get('/ngos', c.getNGOs);
router.put('/ngos/:id/status', c.updateNGOStatus);

// Volunteers
router.get('/volunteers', c.getVolunteers);
router.put('/volunteers/:id/status', c.updateVolunteerStatus);

// Beneficiaries
router.get('/beneficiaries', c.getBeneficiaryRequests);
router.get('/beneficiaries/:id', c.getBeneficiaryById);
router.put('/beneficiaries/:id/status', c.updateBeneficiaryStatus);
router.post('/beneficiaries/:id/re-analyze', c.reAnalyzeBeneficiary);

// Donations
router.get('/donations', c.getDonations);

// Excel Exports
router.get('/export/campaigns', c.exportCampaigns);
router.get('/export/donations', c.exportDonations);
router.get('/export/users', c.exportUsers);

module.exports = router;
