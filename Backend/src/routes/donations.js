const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const donationCtrl = require('../controllers/donationController');
const { authenticate } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Optional auth middleware
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return next();
  try {
    const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'secret');
    req.user = { id: payload.id };
  } catch (_) {}
  next();
};

// POST /api/donations
router.post('/',
  body('fundId').notEmpty().withMessage('fundId is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    next();
  },
  optionalAuth,
  donationCtrl.createDonation
);

// GET /api/donations/my — MUST be before /:fundId
router.get('/my', authenticate, donationCtrl.getMyDonations);

router.get('/recent/global', donationCtrl.getRecentGlobalDonations);
router.get('/leaderboard/top', donationCtrl.getTopDonors);

// GET /api/donations/:fundId
router.get('/:fundId', donationCtrl.getFundDonations);

// POST /api/donations/securepay/initiate
router.post('/securepay/initiate',
  body('fundId').notEmpty(),
  body('amount').isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'fundId and amount are required' });
    next();
  },
  optionalAuth,
  donationCtrl.initiateSecurePay
);

// POST /api/donations/securepay/verify
router.post('/securepay/verify',
  body('fundId').notEmpty(),
  body('amount').isNumeric(),
  body('orderId').notEmpty(),
  body('signature').notEmpty(),
  body('timestamp').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'All security verification tokens are required' });
    next();
  },
  optionalAuth,
  donationCtrl.verifySecurePay
);

module.exports = router;
