const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Verification = require('../models/Verification');
const { sendMail } = require('../utils/mailer');

// POST /api/verify/aadhaar/send-otp
router.post('/aadhaar/send-otp',
  authenticate,
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).isNumeric().withMessage('Aadhaar number must be exactly 12 digits'),
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').isLength({ min: 10 }).withMessage('Phone must be a valid contact number'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { aadhaarNumber, name, phone } = req.body;
      const userId = req.user.id;

      // Find user to obtain registered email address
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Generate a random 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Set expiry to 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Save verification session (overwrite if exists for user)
      await Verification.deleteMany({ userId });
      const verification = new Verification({
        userId,
        aadhaarNumber,
        aadhaarName: name,
        phone,
        otp,
        expiresAt
      });
      await verification.save();

      // Log simulated OTP code
      console.log(`\n==================================================`);
      console.log(`[AADHAAR OTP SIMULATION]`);
      console.log(`User: ${userId} (${name})`);
      console.log(`Email: ${user.email}`);
      console.log(`Linked Phone: ${phone}`);
      console.log(`Generated OTP Code: ${otp}`);
      console.log(`Expires At: ${expiresAt.toLocaleTimeString()}`);
      console.log(`==================================================\n`);

      // Send the OTP code to the registered email address
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;">
          <h2 style="color: #1e2d3d; margin-bottom: 8px;">Aadhaar Identity Verification</h2>
          <p style="color: #6b6560; font-size: 14px; margin-top: 0;">Secured with Multi-Factor Authentication</p>
          <div style="border-bottom: 1px solid #e2e8f0; margin: 20px 0;"></div>
          <p style="text-align: left; color: #1e2d3d; font-size: 14px;">Dear ${name},</p>
          <p style="text-align: left; color: #6b6560; font-size: 14px; line-height: 1.5;">
            You have requested a secure Aadhaar identity verification link for your Aidora profile account. Please use the following 6-digit One-Time Password (OTP) to approve and finalize this process:
          </p>
          <div style="background-color: #faf0e6; border: 1px solid #d4c3b3; border-radius: 8px; padding: 16px 24px; margin: 24px auto; display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 0.25em; color: #e86b4a; font-family: monospace;">
            ${otp}
          </div>
          <p style="text-align: left; color: #6b6560; font-size: 11px; line-height: 1.5; margin-top: 24px;">
            * This OTP code is valid for 5 minutes. Do not share this OTP with anyone. If you did not request this verification, please secure your account immediately.
          </p>
        </div>
      `;

      await sendMail({
        to: user.email,
        subject: 'Aadhaar Verification OTP - Aidora',
        html: emailHtml
      });
      console.log(`Aadhaar OTP email dispatched successfully to ${user.email}`);

      res.json({
        success: true,
        verificationId: verification._id,
        message: `OTP sent successfully to registered email id: ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}.`
      });
    } catch (err) {
      console.error('Send OTP error:', err);
      res.status(500).json({ error: 'Failed to send OTP due to server error' });
    }
  }
);

// POST /api/verify/aadhaar/verify-otp
router.post('/aadhaar/verify-otp',
  authenticate,
  body('verificationId').notEmpty().withMessage('Verification reference ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be exactly 6 digits'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { verificationId, otp } = req.body;
      const userId = req.user.id;

      // Find verification record
      const verification = await Verification.findOne({ _id: verificationId, userId });
      if (!verification) {
        return res.status(400).json({ error: 'Verification session expired or invalid.' });
      }

      // Check OTP code
      if (verification.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP code. Please try again.' });
      }

      // Check expiry
      if (new Date() > verification.expiresAt) {
        await Verification.findByIdAndDelete(verificationId);
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      // Complete identity verification
      const maskedAadhaar = `XXXX-XXXX-${verification.aadhaarNumber.slice(-4)}`;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          isVerified: true,
          aadhaarNumber: maskedAadhaar,
          aadhaarName: verification.aadhaarName
        },
        { new: true }
      ).select('-passwordHash');

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Cleanup verification record
      await Verification.findByIdAndDelete(verificationId);

      console.log(`User ${userId} identity verified via Aadhaar OTP successfully.`);
      res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error('Verify OTP error:', err);
      res.status(500).json({ error: 'Verification failed due to server error' });
    }
  }
);

// POST /api/verify/aadhaar
router.post('/aadhaar',
  authenticate,
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).isNumeric().withMessage('Aadhaar number must be exactly 12 digits'),
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').isLength({ min: 10 }).withMessage('Phone must be a valid contact number'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { aadhaarNumber, name } = req.body;
      const userId = req.user.id;

      const maskedAadhaar = `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          isVerified: true,
          aadhaarNumber: maskedAadhaar,
          aadhaarName: name
        },
        { new: true }
      ).select('-passwordHash');

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`User ${userId} verified with Aadhaar (OCR Direct) successfully.`);
      res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error('Aadhaar verification error:', err);
      res.status(500).json({ error: 'Verification failed due to server error' });
    }
  }
);

module.exports = router;
