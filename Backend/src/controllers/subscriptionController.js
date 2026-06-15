const Subscription = require('../models/Subscription');

// POST /api/subscriptions
exports.createSubscription = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid subscription amount is required' });
    }
    const subscription = await Subscription.create({
      userId: req.user.id,
      amount
    });
    res.status(201).json({ subscription });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// GET /api/subscriptions/my
exports.getMySubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// PUT /api/subscriptions/:id
exports.toggleSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Paused', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid subscription status' });
    }
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ subscription });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};
