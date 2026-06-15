const express = require('express');
const router = express.Router();
const subscriptionCtrl = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, subscriptionCtrl.createSubscription);
router.get('/my', authenticate, subscriptionCtrl.getMySubscriptions);
router.put('/:id', authenticate, subscriptionCtrl.toggleSubscriptionStatus);

module.exports = router;
