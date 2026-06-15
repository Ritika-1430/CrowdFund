const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const fundCtrl = require('../controllers/fundController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', authenticate,
  body('title').isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('targetAmount').isNumeric({ min: 1 }).withMessage('Target amount must be a positive number'),
  (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    next();
  },
  fundCtrl.createFund);

router.get('/', fundCtrl.listFunds);
router.get('/user/my-funds', authenticate, fundCtrl.getUserFunds);
router.get('/admin/pending', authenticate, requireAdmin, fundCtrl.listPendingFunds);
router.get('/stats/summary', fundCtrl.getStatsSummary);
router.get('/:id', fundCtrl.getFund);

router.post('/:id/status', authenticate, requireAdmin, fundCtrl.updateFundStatus);
router.post('/:id/updates', authenticate, fundCtrl.addUpdate);

// Advanced Competitive features routes
router.post('/translate', fundCtrl.translateCampaign);
router.post('/optimize', fundCtrl.optimizeCampaign);
router.post('/pre-verify', fundCtrl.preVerifyHospitalRegistry);
router.post('/:id/milestones/:milestoneId/approve', authenticate, fundCtrl.approveMilestone);

module.exports = router;
