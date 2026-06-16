/**
 * One-time script to seed an admin user into the database.
 * Run with:  node seed-admin.js
 *
 * Admin credentials after running:
 *   Email:    admin@crowdfund.com
 *   Password: Admin@123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ritikasoni222006_db_user:ritika222006@contactapp.ozcjh94.mongodb.net/?appName=contactapp';

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@crowdfund.com';
const ADMIN_PASSWORD = 'Admin@123';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('Existing user promoted to admin role.');
      } else {
        console.log('Admin user already exists. No changes made.');
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
      console.log('Admin user created successfully!');
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
