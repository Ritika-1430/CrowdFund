const Donation = require('../models/Donation');
const Fund = require('../models/Fund');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');

// POST /api/donations — donate to a fund
exports.createDonation = async (req, res) => {
  try {
    const { fundId, donorName, amount, comment, isAnonymous, request80G, panNumber, isPrivateMode, matchingPartner, email, mobile } = req.body;
    if (!fundId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'fundId and valid amount are required' });
    }
    const fund = await Fund.findById(fundId);
    if (!fund) return res.status(404).json({ error: 'Fund not found' });

    // Handle anonymity and privacy logic
    const finalDonorName = isPrivateMode ? 'Private Mode' : (isAnonymous ? 'Anonymous' : (donorName || (req.user ? 'Verified Donor' : 'Anonymous')));

    const donation = await Donation.create({
      fundId,
      donorId: req.user ? req.user.id : null,
      donorName: finalDonorName,
      amount,
      currency: 'INR',
      paymentStatus: 'success',
      comment: comment || '',
      isAnonymous: !!isAnonymous,
      isPrivateMode: !!isPrivateMode,
      matchingPartner: matchingPartner || '',
      request80G: !!request80G,
      panNumber: panNumber || '',
      email: email || '',
      mobile: mobile || '',
    });

    // Increment amountCollected and donorCount in Fund model
    await Fund.findByIdAndUpdate(fundId, { $inc: { amountCollected: amount, donorCount: 1 } });
    console.log(`Donation ₹${amount} recorded for fund ${fundId} (${finalDonorName})`);

    // If 80G requested, send automated tax receipt email
    if (request80G) {
      let recipientEmail = 'donor@example.com';
      if (req.user) {
        const user = await User.findById(req.user.id);
        if (user && user.email) recipientEmail = user.email;
      }

      const receiptNo = `CF-80G-${Math.floor(100000 + Math.random() * 900000)}`;
      const deductionAmount = amount * 0.5;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #dd6b20; text-align: center; border-bottom: 2px solid #dd6b20; padding-bottom: 12px;">Section 80G Tax Exemption Certificate</h2>
          <p>Dear ${finalDonorName},</p>
          <p>Thank you for your generous contribution of <strong>₹${amount.toLocaleString('en-IN')}</strong> to the campaign: <em>"${fund.title}"</em>.</p>
          <div style="background-color: #f7fafc; border: 1px dashed #cbd5e0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #4a5568;">Receipt Number:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right;">${receiptNo}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4a5568;">PAN Number matching receipt:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right; text-transform: uppercase;">${panNumber || 'XXXXX1234X'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4a5568;">Donation Amount:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #dd6b20;">₹${amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4a5568;">Tax Exemption Allowed (50%):</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #38a169;">₹${deductionAmount.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 12px; color: #718096; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 20px;">
            * This is an automated receipt certificate issued under Section 80G of the Indian Income Tax Act. Please keep this copy for your tax filing.
          </p>
        </div>
      `;

      try {
        await sendMail({
          to: recipientEmail,
          subject: 'Your 80G Tax Exemption Receipt',
          html: emailHtml
        });
        console.log(`80G Exemption Receipt sent successfully to ${recipientEmail}`);
      } catch (err) {
        console.error('Failed to send 80G mail:', err);
      }
    }

    res.status(201).json({ donation });
  } catch (err) {
    console.error('Donation error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// GET /api/donations/:fundId — list donations for a fund
exports.getFundDonations = async (req, res) => {
  try {
    const { fundId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const donations = await Donation.find({ fundId, paymentStatus: 'success' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Donation.countDocuments({ fundId, paymentStatus: 'success' });
    res.json({ donations, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// GET /api/donations/my — logged in user's donations
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('fundId', 'title category');
    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// GET /api/donations/recent/global
exports.getRecentGlobalDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ paymentStatus: 'success' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('fundId', 'title');
    res.json({ donations });
  } catch (err) {
    console.error('Recent global donations error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// GET /api/donations/leaderboard/top
exports.getTopDonors = async (req, res) => {
  try {
    const leaderboard = await Donation.aggregate([
      { $match: { paymentStatus: 'success', isAnonymous: false } },
      {
        $group: {
          _id: '$donorName',
          totalDonated: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalDonated: -1 } },
      { $limit: 5 }
    ]);
    // Format response to be user friendly
    const formatted = leaderboard.map(item => ({
      donorName: item._id || 'Generous Donor',
      totalDonated: item.totalDonated,
      count: item.count
    }));
    res.json({ leaderboard: formatted });
  } catch (err) {
    console.error('Top donors leaderboard error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const crypto = require('crypto');

exports.initiateSecurePay = async (req, res) => {
  try {
    const { fundId, amount } = req.body;
    
    // Generate Order ID & Timestamp
    const orderId = `CFSP_ORD_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const timestamp = Date.now().toString();

    // Create SHA256 HMAC signature using JWT_SECRET
    const secret = process.env.JWT_SECRET || 'strong_jwt_secret_fallback';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${fundId}|${amount}|${timestamp}|${orderId}`);
    const signature = hmac.digest('hex');

    res.json({
      orderId,
      signature,
      timestamp
    });
  } catch (err) {
    console.error('SecurePay initiation error:', err);
    res.status(500).json({ error: 'Failed to initiate secure checkout session' });
  }
};

exports.verifySecurePay = async (req, res) => {
  try {
    const { 
      fundId, 
      amount, 
      orderId, 
      signature, 
      timestamp,
      donorName,
      comment,
      isAnonymous,
      isPrivateMode,
      matchingPartner,
      request80G,
      panNumber,
      email,
      mobile
    } = req.body;

    // Verify signature integrity
    const secret = process.env.JWT_SECRET || 'strong_jwt_secret_fallback';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${fundId}|${amount}|${timestamp}|${orderId}`);
    const recomputedSignature = hmac.digest('hex');

    if (recomputedSignature !== signature) {
      return res.status(400).json({ error: 'Cryptographic signature verification failed. Tampering detected!' });
    }

    const fund = await Fund.findById(fundId);
    if (!fund) return res.status(404).json({ error: 'Fund not found' });

    // Handle anonymity and privacy logic
    const finalDonorName = isPrivateMode ? 'Private Mode' : (isAnonymous ? 'Anonymous' : (donorName || (req.user ? 'Verified Donor' : 'Anonymous')));

    // Determine target receiver bank account details to write to metadata/matchingPartner
    let recipientAccountStr = '';
    if (fund.hospitalEscrow && fund.hospitalEscrow.accountNumber) {
      recipientAccountStr = `${fund.hospitalEscrow.hospitalName || 'Escrow Hospital'} (A/C: ...${fund.hospitalEscrow.accountNumber.slice(-4)})`;
    } else {
      recipientAccountStr = `Campaign Creator Beneficiary Payout A/C (HDFC Trust A/C: ...5821)`;
    }

    const donation = await Donation.create({
      fundId,
      donorId: req.user ? req.user.id : null,
      donorName: finalDonorName,
      amount,
      currency: 'INR',
      paymentStatus: 'success',
      comment: comment || '',
      isAnonymous: !!isAnonymous,
      isPrivateMode: !!isPrivateMode,
      matchingPartner: matchingPartner || `SecurePay Escrow Gateway`,
      request80G: !!request80G,
      panNumber: panNumber || '',
      email: email || '',
      mobile: mobile || '',
      metadata: {
        securepayOrderId: orderId,
        securepayTxSignature: signature,
        verificationTimestamp: timestamp,
        recipientAccountDetails: recipientAccountStr,
        cryptographicProofHash: crypto.createHash('sha256').update(`${orderId}|${signature}|${finalDonorName}`).digest('hex')
      }
    });

    // Increment amountCollected and donorCount in Fund model
    await Fund.findByIdAndUpdate(fundId, { $inc: { amountCollected: amount, donorCount: 1 } });
    console.log(`[SecurePay Verified] Donation ₹${amount} recorded for fund ${fundId} (${finalDonorName})`);

    // If 80G requested, send automated tax receipt email
    if (request80G) {
      let recipientEmail = email || 'donor@example.com';
      if (req.user && !email) {
        const user = await User.findById(req.user.id);
        if (user && user.email) recipientEmail = user.email;
      }

      const receiptNo = `CF-80G-${Math.floor(100000 + Math.random() * 900000)}`;
      const deductionAmount = amount * 0.5;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #0d9488; text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px;">Section 80G Tax Exemption Certificate</h2>
          <p>Dear ${finalDonorName},</p>
          <p>Thank you for your generous contribution of <strong>₹${amount.toLocaleString('en-IN')}</strong> to the campaign: <em>"${fund.title}"</em>. Your donation has been cryptographically signed and secured via SecurePay gateway.</p>
          <div style="background-color: #f7fafc; border: 1px dashed #cbd5e0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #4a5568;">Receipt Number:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right;">${receiptNo}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4a5568;">PAN Number:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right; text-transform: uppercase;">${panNumber || 'XXXXX1234X'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4a5568;">Exemption Amount (50%):</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0d9488;">₹${deductionAmount.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 11px; color: #718096; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 20px;">
            * SecurePay Escrow Hub is digital ledger signed. Transaction Reference: ${orderId}.
          </p>
        </div>
      `;

      try {
        const { sendMail } = require('../utils/mailer');
        await sendMail({
          to: recipientEmail,
          subject: 'Your 80G Tax Exemption Receipt (SecurePay Gateway)',
          html: emailHtml
        });
      } catch (err) {
        console.error('Failed to send 80G mail:', err);
      }
    }

    res.status(201).json({ donation });
  } catch (err) {
    console.error('SecurePay verification error:', err);
    res.status(500).json({ error: err.message || 'Server verification error' });
  }
};

