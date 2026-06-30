/**
 * One-time script to seed an admin user into the deployed MongoDB Atlas database.
 * Run with:  node seed-admin.js
 *
 * Admin credentials after running:
 *   Email:    admin@aidora.com
 *   Password: Admin@123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Uses the same Atlas URI as the deployed server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ritikasoni222006_db_user:ritika222006@contactapp.ozcjh94.mongodb.net/?appName=contactapp';

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@aidora.com';
const ADMIN_PASSWORD = 'Admin@123';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB Atlas');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('✓ Existing user promoted to admin role.');
      } else {
        // Re-hash the password to ensure it works
        const salt = await bcrypt.genSalt(10);
        existing.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);
        await existing.save();
        console.log('✓ Admin already exists — password has been reset.');
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash: hash,
        role: 'admin',
        isEmailVerified: true,
      });
      console.log('✓ Admin user created successfully!');
    }

    console.log('\n========================================');
    console.log('  ADMIN CREDENTIALS');
    console.log('========================================');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('========================================\n');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
