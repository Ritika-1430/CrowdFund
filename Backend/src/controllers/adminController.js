const User = require('../models/User');
const Fund = require('../models/Fund');
const Donation = require('../models/Donation');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

// ──────────────────────────────────────────────────
// DASHBOARD ANALYTICS
// ──────────────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalCampaigns, totalDonationsAgg, campaignsByStatus, donationsByMonth, topCategories, recentDonations, recentUsers] = await Promise.all([
      User.countDocuments(),
      Fund.countDocuments(),
      Donation.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Fund.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Donation.aggregate([
        { $match: { paymentStatus: 'success' } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]),
      Donation.aggregate([
        { $match: { paymentStatus: 'success' } },
        {
          $lookup: {
            from: 'funds',
            localField: 'fundId',
            foreignField: '_id',
            as: 'fund'
          }
        },
        { $unwind: '$fund' },
        {
          $group: {
            _id: '$fund.category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ]),
      Donation.find({ paymentStatus: 'success' })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('fundId', 'title category'),
      User.find().sort({ createdAt: -1 }).limit(5).select('-passwordHash')
    ]);

    const donationTotals = totalDonationsAgg[0] || { total: 0, count: 0 };

    // Format campaign status breakdown
    const statusBreakdown = {};
    campaignsByStatus.forEach(s => { statusBreakdown[s._id] = s.count; });

    // Format monthly donations for chart
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyChart = donationsByMonth.reverse().map(d => ({
      label: `${monthNames[d._id.month]} ${d._id.year}`,
      amount: d.total,
      count: d.count
    }));

    // Build recent activity feed
    const activity = [];
    recentDonations.forEach(d => {
      activity.push({
        type: 'donation',
        text: `${d.donorName || 'Anonymous'} donated ₹${d.amount.toLocaleString('en-IN')} to "${d.fundId?.title || 'a campaign'}"`,
        time: d.createdAt
      });
    });
    recentUsers.forEach(u => {
      activity.push({
        type: 'user',
        text: `New user "${u.name}" registered (${u.email})`,
        time: u.createdAt
      });
    });
    activity.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      totalUsers,
      totalCampaigns,
      totalDonations: donationTotals.total,
      totalDonors: donationTotals.count,
      statusBreakdown,
      monthlyChart,
      topCategories: topCategories.map(c => ({ category: c._id, total: c.total, count: c.count })),
      recentActivity: activity.slice(0, 15)
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// ──────────────────────────────────────────────────
// USER MANAGEMENT
// ──────────────────────────────────────────────────

exports.listUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const q = {};
    if (role) q.role = role;
    if (search) {
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(q)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(q);
    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const campaigns = await Fund.find({ creatorId: req.params.id }).sort({ createdAt: -1 });
    const donations = await Donation.find({ donorId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('fundId', 'title');

    res.json({ user, campaigns, donations });
  } catch (err) {
    console.error('Admin get user error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isVerified, password } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (isVerified !== undefined) updates.isVerified = isVerified;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    // Delete user's campaigns and associated donations
    const userCampaigns = await Fund.find({ creatorId: req.params.id });
    for (const campaign of userCampaigns) {
      await Donation.deleteMany({ fundId: campaign._id });
      await Fund.findByIdAndDelete(campaign._id);
    }

    // Delete the user's own donations (as donor) — but keep donation records for fund accounting
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `User "${user.name}" and ${userCampaigns.length} campaign(s) deleted` });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// ──────────────────────────────────────────────────
// CAMPAIGN MANAGEMENT
// ──────────────────────────────────────────────────

exports.listCampaigns = async (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 20 } = req.query;
    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;
    if (search) {
      q.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const campaigns = await Fund.find(q)
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Fund.countDocuments(q);
    res.json({ campaigns, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin list campaigns error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const allowedFields = ['title', 'description', 'targetAmount', 'status', 'category', 'emergency', 'location', 'deadline'];
    const updates = {};
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const campaign = await Fund.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('creatorId', 'name email');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    res.json({ campaign });
  } catch (err) {
    console.error('Admin update campaign error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Fund.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    await Donation.deleteMany({ fundId: req.params.id });
    await Fund.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `Campaign "${campaign.title}" and its donations deleted` });
  } catch (err) {
    console.error('Admin delete campaign error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// ──────────────────────────────────────────────────
// DONATION MANAGEMENT
// ──────────────────────────────────────────────────

exports.listDonations = async (req, res) => {
  try {
    const { search, status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const q = {};
    if (status) q.paymentStatus = status;
    if (startDate || endDate) {
      q.createdAt = {};
      if (startDate) q.createdAt.$gte = new Date(startDate);
      if (endDate) q.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      q.$or = [
        { donorName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const donations = await Donation.find(q)
      .populate('fundId', 'title category')
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Donation.countDocuments(q);
    res.json({ donations, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin list donations error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    // Decrement fund amounts
    if (donation.paymentStatus === 'success') {
      await Fund.findByIdAndUpdate(donation.fundId, {
        $inc: { amountCollected: -donation.amount, donorCount: -1 }
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `Donation of ₹${donation.amount} deleted and fund totals adjusted` });
  } catch (err) {
    console.error('Admin delete donation error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// ──────────────────────────────────────────────────
// EXCEL EXPORT
// ──────────────────────────────────────────────────

const buildExcelBuffer = (data, sheetName) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-size columns based on actual content width
  if (data.length > 0) {
    const colWidths = Object.keys(data[0]).map(key => {
      const maxContentLen = Math.max(
        key.length,
        ...data.map(row => String(row[key] != null ? row[key] : '').length)
      );
      return { wch: Math.min(maxContentLen + 4, 50) };
    });
    ws['!cols'] = colWidths;
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buf);
};

exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash -__v').lean();
    const data = users.map(u => ({
      'Name': u.name,
      'Email': u.email,
      'Role': u.role,
      'Email Verified': u.isEmailVerified ? 'Yes' : 'No',
      'Aadhaar Verified': u.isVerified ? 'Yes' : 'No',
      'Aadhaar Name': u.aadhaarName || '',
      'Registered At': new Date(u.createdAt).toLocaleString('en-IN')
    }));

    if (data.length === 0) data.push({ 'Info': 'No users found' });

    const buffer = buildExcelBuffer(data, 'Users');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Aidora_Users.xlsx');
    res.end(buffer);
  } catch (err) {
    console.error('Export users error:', err);
    res.status(500).json({ error: 'Failed to export users' });
  }
};

exports.exportCampaigns = async (req, res) => {
  try {
    const campaigns = await Fund.find().populate('creatorId', 'name email').lean();
    const data = campaigns.map(c => ({
      'Title': c.title,
      'Category': c.category,
      'Status': c.status,
      'Target Amount (₹)': c.targetAmount,
      'Collected (₹)': c.amountCollected,
      'Donors': c.donorCount || 0,
      'Progress (%)': c.targetAmount ? Math.round((c.amountCollected / c.targetAmount) * 100) : 0,
      'Emergency': c.emergency ? 'Yes' : 'No',
      'Creator': c.creatorId?.name || 'Unknown',
      'Creator Email': c.creatorId?.email || '',
      'Location': c.location || '',
      'Beneficiary': c.beneficiary?.name || '',
      'Created At': new Date(c.createdAt).toLocaleString('en-IN')
    }));

    if (data.length === 0) data.push({ 'Info': 'No campaigns found' });

    const buffer = buildExcelBuffer(data, 'Campaigns');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Aidora_Campaigns.xlsx');
    res.end(buffer);
  } catch (err) {
    console.error('Export campaigns error:', err);
    res.status(500).json({ error: 'Failed to export campaigns' });
  }
};

exports.exportDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('fundId', 'title category')
      .populate('donorId', 'name email')
      .lean();
    const data = donations.map(d => ({
      'Donor Name': d.donorName || 'Anonymous',
      'Donor Email': d.email || d.donorId?.email || '',
      'Mobile': d.mobile || '',
      'Campaign': d.fundId?.title || 'Deleted Campaign',
      'Category': d.fundId?.category || '',
      'Amount (₹)': d.amount,
      'Currency': d.currency || 'INR',
      'Payment Status': d.paymentStatus,
      'Anonymous': d.isAnonymous ? 'Yes' : 'No',
      'Private Mode': d.isPrivateMode ? 'Yes' : 'No',
      '80G Claimed': d.request80G ? 'Yes' : 'No',
      'PAN Number': d.panNumber || '',
      'Payment Gateway': d.matchingPartner || 'Standard',
      'Comment': d.comment || '',
      'Date': new Date(d.createdAt).toLocaleString('en-IN')
    }));

    if (data.length === 0) data.push({ 'Info': 'No donations found' });

    const buffer = buildExcelBuffer(data, 'Donations');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Aidora_Donations.xlsx');
    res.end(buffer);
  } catch (err) {
    console.error('Export donations error:', err);
    res.status(500).json({ error: 'Failed to export donations' });
  }
};
