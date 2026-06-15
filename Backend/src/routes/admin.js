const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Dashboard analytics
router.get('/stats', adminCtrl.getStats);

// User management
router.get('/users', adminCtrl.listUsers);
router.get('/users/:id', adminCtrl.getUser);
router.put('/users/:id', adminCtrl.updateUser);
router.delete('/users/:id', adminCtrl.deleteUser);

// Campaign management
router.get('/campaigns', adminCtrl.listCampaigns);
router.put('/campaigns/:id', adminCtrl.updateCampaign);
router.delete('/campaigns/:id', adminCtrl.deleteCampaign);

// Donation management
router.get('/donations', adminCtrl.listDonations);
router.delete('/donations/:id', adminCtrl.deleteDonation);

// Excel export
router.get('/export/users', adminCtrl.exportUsers);
router.get('/export/campaigns', adminCtrl.exportCampaigns);
router.get('/export/donations', adminCtrl.exportDonations);

module.exports = router;
