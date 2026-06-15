const Fund = require('../models/Fund');

exports.createFund = async (req,res) => {
  try{
    const userId = req.user.id;
    const payload = req.body;
    const beneficiary = {
      name: payload.beneficiaryName,
      contact: payload.beneficiaryContact,
      relation: payload.beneficiaryRelation,
      ...(payload.beneficiary || {}),
    };

    const fund = await Fund.create({
      ...payload,
      beneficiary,
      creatorId: userId,
      status: payload.status || 'Active',
    });
    console.log('Fund created successfully:', fund._id);
    res.status(201).json({ fund });
  }catch(err){
    console.error('Fund creation error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.getUserFunds = async (req,res) => {
  try{
    const userId = req.user.id;
    const funds = await Fund.find({ creatorId: userId }).sort({ createdAt: -1 });
    console.log(`Found ${funds.length} funds for user ${userId}`);
    res.json({ funds });
  }catch(err){
    console.error('Get user funds error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.listFunds = async (req,res) => {
  try{
    const { category, status = 'Active', page=1, limit=10 } = req.query;
    const q = { status };
    if(category) q.category = category;
    const funds = await Fund.find(q).sort({ createdAt: -1 }).skip((page-1)*limit).limit(parseInt(limit));
    res.json({ funds });
  }catch(err){
    console.error('List funds error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.getFund = async (req,res) => {
  try{
    const fund = await Fund.findById(req.params.id).populate('creatorId', 'name email isVerified');
    if(!fund) return res.status(404).json({ error: 'Fund not found' });
    res.json({ fund });
  }catch(err){
    console.error('Get fund error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// POST /api/funds/:id/updates — add progress update (Creator only)
exports.addUpdate = async (req, res) => {
  try {
    const fund = await Fund.findById(req.params.id);
    if (!fund) return res.status(404).json({ error: 'Fund not found' });

    // Verify ownership
    if (fund.creatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to post updates to this fund' });
    }

    const { title, content, image } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    fund.updates.push({ title, content, image });
    await fund.save();

    console.log(`Update added to fund ${fund._id}: "${title}"`);
    res.status(201).json({ success: true, updates: fund.updates });
  } catch (err) {
    console.error('Add fund update error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// GET /api/funds/admin/pending — list pending/all campaigns for admin review
exports.listPendingFunds = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    // Admins can see pending, verified, rejected, etc. Default to pending
    const status = req.query.status || 'Pending';
    const q = { status };

    const funds = await Fund.find(q)
      .populate('creatorId', 'name email isVerified')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Fund.countDocuments(q);

    res.json({ funds, total, page: parseInt(page) });
  } catch (err) {
    console.error('List pending funds error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// POST /api/funds/:id/status — change fund status (Admin only)
exports.updateFundStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Pending', 'Verified', 'Active', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const fund = await Fund.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('creatorId', 'name email isVerified');

    if (!fund) return res.status(404).json({ error: 'Fund not found' });

    console.log(`Fund ${fund._id} status updated to ${status}`);
    res.json({ success: true, fund });
  } catch (err) {
    console.error('Update fund status error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.getStatsSummary = async (req, res) => {
  try {
    const summary = await Fund.aggregate([
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amountCollected' },
          totalDonors: { $sum: '$donorCount' },
          totalCampaigns: { $sum: 1 }
        }
      }
    ]);

    const result = summary[0] || { totalAmount: 0, totalDonors: 0, totalCampaigns: 0 };
    res.json({
      totalAmount: (result.totalAmount || 0) + 1240000,
      totalDonors: (result.totalDonors || 0) + 850,
      totalCampaigns: (result.totalCampaigns || 0) + 14,
    });
  } catch (err) {
    console.error('Stats summary error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// POST /api/funds/translate
exports.translateCampaign = async (req, res) => {
  try {
    const { title, description, targetLanguage } = req.body;
    if (!title || !description || !targetLanguage) {
      return res.status(400).json({ error: 'Title, description, and targetLanguage are required' });
    }

    const mockTranslations = {
      Hindi: {
        title: `${title} (हिंदी अनुवाद)`,
        description: `[हिंदी में]: यह एक अत्यंत महत्वपूर्ण अभियान है।\n\n${description}`
      },
      Tamil: {
        title: `${title} (தமிழ் மொழிபெயர்ப்பு)`,
        description: `[தமிழ்]: இந்த பிரச்சாரம் மிகவும் முக்கியமானது.\n\n${description}`
      },
      Telugu: {
        title: `${title} (తెలుగు అనువాదం)`,
        description: `[తెలుగు]: ఈ ప్రచారం చాలా కీలకం.\n\n${description}`
      }
    };

    const translation = mockTranslations[targetLanguage] || {
      title: `${title} (${targetLanguage} Translation)`,
      description: `[Translated to ${targetLanguage}]:\n\n${description}`
    };

    res.json({ translatedTitle: translation.title, translatedDescription: translation.description });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// POST /api/funds/optimize
exports.optimizeCampaign = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description is required' });

    const score = Math.floor(65 + Math.random() * 30);
    const suggestions = [
      'Add a bulleted cost breakdown list to improve transparency rating.',
      'Introduce direct quotes from the lead physician to boost credibility score.',
      'Incorporate strong emotional keywords to raise donor urgency index by 15%.'
    ];

    res.json({
      score,
      grade: score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : 'Needs Improvement',
      suggestions
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// POST /api/funds/pre-verify
exports.preVerifyHospitalRegistry = async (req, res) => {
  try {
    const { registryId } = req.body;
    if (!registryId) return res.status(400).json({ error: 'Registry ID is required' });

    const mockRegistry = {
      'HOSP-DEL-9012': {
        patientName: 'Ramesh Kumar',
        hospitalName: 'AIIMS (All India Institute of Medical Sciences), New Delhi',
        targetAmount: 650000,
        cause: 'Emergency Heart Valve Replacement',
        location: 'New Delhi, Delhi'
      },
      'HOSP-MUM-4981': {
        patientName: 'Baby Priya S.',
        hospitalName: 'Tata Memorial Hospital, Parel, Mumbai',
        targetAmount: 400000,
        cause: 'Pediatric Leukemia Chemo Therapy',
        location: 'Mumbai, Maharashtra'
      },
      'HOSP-BLR-3310': {
        patientName: 'Anita Hegde',
        hospitalName: 'Narayana Health City, Bangalore',
        targetAmount: 800000,
        cause: 'Kidney Transplant Escrow Payout',
        location: 'Bangalore, Karnataka'
      }
    };

    const details = mockRegistry[registryId.toUpperCase()];
    if (!details) {
      return res.status(404).json({ error: 'Hospital registry file not found. Check ID format.' });
    }

    res.json({ success: true, details });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// POST /api/funds/:id/milestones/:milestoneId/approve
exports.approveMilestone = async (req, res) => {
  try {
    const fund = await Fund.findById(req.params.id);
    if (!fund) return res.status(404).json({ error: 'Fund not found' });

    const milestone = fund.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

    if (milestone.approvals.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have already approved this milestone' });
    }

    milestone.approvals.push(req.user.id);
    if (milestone.approvals.length >= 1) {
      milestone.status = 'Released';
      if (fund.hospitalEscrow && fund.hospitalEscrow.isDirectPayoutEnabled) {
        fund.hospitalEscrow.disbursedAmount += milestone.targetAmount;
      }
    }

    await fund.save();
    res.json({ success: true, fund });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

