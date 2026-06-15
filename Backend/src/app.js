const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const fundRoutes = require('./routes/funds');
const donationRoutes = require('./routes/donations');
const verifyRoutes = require('./routes/verify');
const subscriptionRoutes = require('./routes/subscriptions');
const adminRoutes = require('./routes/admin');

const app = express();

// Enable compression for fast asset/payload loading under high concurrency
app.use(compression());

// Basic DDoS and rate limiting protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'Crowdfund API is running' }));
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
