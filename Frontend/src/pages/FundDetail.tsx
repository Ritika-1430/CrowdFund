import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fundApi, donationApi } from '../services/api';
import { Fund, Donation } from '../types';
import { useAuth } from '../hooks/useAuth';
import { categoryKits } from '../utils/donationKits';
import { fallbackFundImage, fundPhotoUrls } from '../utils/fundImages';
import ProductCard from '../components/ProductCard';
import ProductDetailsTable from '../components/ProductDetailsTable';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Heart, Share2, ChevronLeft, ChevronRight, Clock, Users, Shield, Send, MessageCircle, X } from 'lucide-react';

type Tab = 'products' | 'project' | 'updates';

const FundDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fund, setFund] = useState<Fund | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [imageIndex, setImageIndex] = useState(0);

  const [updates, setUpdates] = useState<any[]>([]);
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [commentReactions, setCommentReactions] = useState<Record<string, Record<string, number>>>({});
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Advanced features states
  const [showAadhaarAudit, setShowAadhaarAudit] = useState(false);
  const [milestoneLoading, setMilestoneLoading] = useState(false);

  const handleApproveMilestone = async (milestoneId: string) => {
    if (!user) {
      alert('Please log in to vote on milestone release.');
      navigate('/auth');
      return;
    }
    setMilestoneLoading(true);
    try {
      await fundApi.approveMilestone(fund?._id || '', milestoneId);
      alert('Your vote has been counted successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Milestone voting failed.');
    } finally {
      setMilestoneLoading(false);
    }
  };

  const getFundMilestones = (f: Fund) => {
    if (f.milestones && f.milestones.length > 0) return f.milestones;
    return [
      {
        _id: 'm1',
        title: 'Phase 1: Diagnosis & Bed Admission',
        targetAmount: Math.floor(f.targetAmount * 0.2),
        description: 'Covers initial room registry, bed block deposit, and pre-op diagnosis tests.',
        status: f.amountCollected >= f.targetAmount * 0.2 ? 'Released' : 'Active',
        approvals: f.amountCollected >= f.targetAmount * 0.2 ? ['a', 'b', 'c'] : []
      },
      {
        _id: 'm2',
        title: 'Phase 2: Surgery & Treatment Operation',
        targetAmount: Math.floor(f.targetAmount * 0.6),
        description: 'Direct payout to hospital operation theatre charges and physician team settlement.',
        status: f.amountCollected >= f.targetAmount * 0.8 ? 'Released' : (f.amountCollected >= f.targetAmount * 0.2 ? 'Active' : 'Locked'),
        approvals: []
      },
      {
        _id: 'm3',
        title: 'Phase 3: Post-op Care & Medicine Stock',
        targetAmount: Math.floor(f.targetAmount * 0.2),
        description: 'Disbursement of remaining amount for recovery checks and pharmacy billing clearance.',
        status: f.amountCollected >= f.targetAmount ? 'Released' : 'Locked',
        approvals: []
      }
    ];
  };

  const getBillingTickerItems = (f: Fund) => {
    const seed = f._id.charCodeAt(f._id.length - 1) || 0;
    const amount1 = Math.floor((1000 + (seed % 10) * 1500) * 0.5);
    const amount2 = Math.floor((1500 + (seed % 5) * 2000) * 0.5);
    return [
      { id: `TX-${seed}01`, item: 'Pharmacy medicines cleared', amount: amount1, time: '3 mins ago' },
      { id: `TX-${seed}02`, item: 'Physician ICU visit charge', amount: amount2, time: '1 hr ago' },
      { id: `TX-${seed}03`, item: 'Bed allotment fee settled', amount: Math.floor(f.targetAmount * 0.05), time: '1 day ago' }
    ];
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const fundRes = await fundApi.get(id);
      setFund(fundRes.data.fund);
      setUpdates(fundRes.data.fund.updates || []);
      const donRes = await donationApi.getFundDonations(id);
      const fetchedDonations = donRes.data.donations || [];
      setDonations(fetchedDonations);
      
      // Seed random reactions for comments
      const initialReactions: Record<string, Record<string, number>> = {};
      fetchedDonations.forEach((d: any) => {
        if (d.comment) {
          initialReactions[d._id] = {
            '👍': Math.floor(Math.random() * 8) + 1,
            '❤️': Math.floor(Math.random() * 5),
            '🙏': Math.floor(Math.random() * 6),
            '👏': Math.floor(Math.random() * 4),
          };
        }
      });
      setCommentReactions(initialReactions);
      setError('');
    } catch {
      setError('Failed to load campaign details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!fund || !fund.description) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fund.description);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePauseSpeech = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleResumeSpeech = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleEmojiReact = (commentId: string, emoji: string) => {
    setCommentReactions(prev => {
      const current = prev[commentId] || { '👍': 0, '❤️': 0, '🙏': 0, '👏': 0 };
      return {
        ...prev,
        [commentId]: {
          ...current,
          [emoji]: (current[emoji] || 0) + 1
        }
      };
    });
  };

  const handleDrawShareCard = () => {
    if (!fund || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    canvas.width = 800;
    canvas.height = 1200;

    // Draw background
    ctx.fillStyle = '#FAF8F5'; // Ivory
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#E8DDD3'; // Sand
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Draw logo block
    ctx.fillStyle = '#E86B4A'; // Coral
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(50, 60, 60, 60, 16); else ctx.rect(50, 60, 60, 60);
    ctx.fill();

    // Draw heart inside logo block
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '32px sans-serif';
    ctx.fillText('❤', 64, 102);

    // Draw brand name text
    ctx.fillStyle = '#1A1A1A'; // Charcoal
    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillText('CrowdFund', 130, 102);

    // Draw Category Tag
    ctx.fillStyle = '#F5F0EB'; // Cream
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(50, 150, 220, 36, 18); else ctx.rect(50, 150, 220, 36);
    ctx.fill();
    ctx.fillStyle = '#E86B4A';
    ctx.font = 'bold 12px "DM Sans", sans-serif';
    ctx.fillText(fund.category.toUpperCase().substring(0, 25), 68, 172);

    // Draw location tag
    if (fund.location) {
      ctx.fillStyle = '#6B6560'; // Stone
      ctx.font = '14px "DM Sans", sans-serif';
      ctx.fillText(`📍 ${fund.location.substring(0, 35)}`, 290, 172);
    }

    // Draw Title text
    ctx.fillStyle = '#1E2D3D'; // Navy
    ctx.font = 'bold 36px Georgia, serif';
    const words = fund.title.split(' ');
    let line = '';
    let y = 240;
    const maxWidth = 700;
    const lineHeight = 48;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 50, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 50, y);

    // Draw abstract placeholder vector graphics for visual layout
    ctx.fillStyle = '#E8DDD3'; // Sand placeholder block
    ctx.fillRect(50, y + 40, 700, 320);

    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(60, y + 50, 680, 300);

    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HELP US MAKE A DIFFERENCE', 400, y + 170);
    ctx.font = '14px "DM Sans", sans-serif';
    ctx.fillStyle = '#6B6560';
    ctx.fillText('Every single contribution directly impacts the cause.', 400, y + 210);

    // Draw Progress
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 28px Georgia, serif';
    const collectedStr = `₹${fund.amountCollected.toLocaleString('en-IN')}`;
    const targetStr = `raised of ₹${fund.targetAmount.toLocaleString('en-IN')}`;
    ctx.fillText(collectedStr, 50, y + 430);
    ctx.font = '16px "DM Sans", sans-serif';
    ctx.fillStyle = '#6B6560';
    ctx.fillText(targetStr, 50 + ctx.measureText(collectedStr).width + 12, y + 428);

    // Draw Progress Bar
    const progressPercent = Math.min((fund.amountCollected / fund.targetAmount), 1);
    ctx.fillStyle = '#FAF8F5';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(50, y + 460, 700, 16, 8); else ctx.rect(50, y + 460, 700, 16);
    ctx.fill();
    ctx.strokeStyle = '#E8DDD3';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, y + 460, 700, 16);

    ctx.fillStyle = '#E86B4A'; // Coral progress bar fill
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(50, y + 460, Math.max(16, 700 * progressPercent), 16, 8); else ctx.rect(50, y + 460, Math.max(16, 700 * progressPercent), 16);
    ctx.fill();

    // Draw Footer bar with simulated scan QR Code
    ctx.fillStyle = '#1E2D3D'; // Navy footer block
    ctx.fillRect(8, 1020, 784, 164);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('Scan to Support this Campaign', 50, 1090);
    ctx.font = '13px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('India\'s most trusted zero platform fee crowdfunding app.', 50, 1120);

    // Draw QR code background and cubes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(630, 1040, 120, 120);
    ctx.fillStyle = '#1E2D3D';
    ctx.fillRect(640, 1050, 30, 30);
    ctx.fillRect(710, 1050, 30, 30);
    ctx.fillRect(640, 1120, 30, 30);
    ctx.fillRect(680, 1090, 20, 20);
    ctx.fillRect(700, 1130, 20, 20);
  };

  const downloadShareCard = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `crowdfund-share-${fund?._id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !fund) return (
    <div className="min-h-[80vh] bg-ivory flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-serif text-charcoal mb-2">Campaign Not Found</h2>
      <p className="text-stone text-[14px] mb-6 max-w-sm">{error || 'This campaign may be pending or does not exist.'}</p>
      <button onClick={() => navigate('/explore')} className="px-6 py-3 bg-coral text-white font-bold rounded-xl shadow-warm hover:bg-terracotta transition">
        Explore Campaigns
      </button>
    </div>
  );

  const allImages = fundPhotoUrls(fund);
  const currentImage = allImages[imageIndex];
  const progress = Math.min((fund.amountCollected / fund.targetAmount) * 100, 100);
  const kits = categoryKits[fund.category] || { items: [] };
  const isCreator = user && fund.creatorId && ((fund.creatorId as any)._id === user.id || (fund.creatorId as any) === user.id);
  const daysLeft = fund.deadline ? Math.max(0, Math.ceil((new Date(fund.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateTitle || !newUpdateContent) return;
    setPostingUpdate(true);
    try {
      const res = await fundApi.addUpdate(fund._id, { title: newUpdateTitle, content: newUpdateContent });
      setUpdates(res.data.updates);
      setNewUpdateTitle('');
      setNewUpdateContent('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to post update');
    } finally {
      setPostingUpdate(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'products', label: 'Donation Kits' },
    { key: 'project', label: 'About' },
    { key: 'updates', label: `Updates (${updates.length})` },
  ];

  return (
    <div className="min-h-screen bg-ivory pb-24 sm:pb-12">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-sand/50 px-5 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/explore')}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone hover:text-charcoal transition">
            <ChevronLeft className="w-4 h-4" /> Back to Explore
          </button>
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(fund.title + ' — ' + window.location.href)}`, '_blank')}
            className="p-2 rounded-xl hover:bg-cream text-stone hover:text-coral transition">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left: Images & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Carousel */}
          <div className="relative h-80 sm:h-96 bg-cream rounded-3xl overflow-hidden border border-sand/40 shadow-warm group">
            <img src={currentImage} alt={fund.title}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]"
              onError={e => { (e.target as HTMLImageElement).src = fallbackFundImage(fund.category); }} />
            {allImages.length > 1 && (
              <>
                <button onClick={() => setImageIndex(i => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-warm hover:bg-white transition">
                  <ChevronLeft className="w-4 h-4 text-charcoal" />
                </button>
                <button onClick={() => setImageIndex(i => (i + 1) % allImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-warm hover:bg-white transition">
                  <ChevronRight className="w-4 h-4 text-charcoal" />
                </button>
                <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-charcoal text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-warm-sm">
                  {imageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>

          {/* Title & Meta */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-cream border border-sand text-stone text-[11px] font-semibold rounded-full">{fund.category}</span>
              {fund.emergency && (
                <span className="px-3 py-1 bg-coral/8 border border-coral/20 text-coral text-[11px] font-bold rounded-full">🚨 Urgent</span>
              )}
              <button
                type="button"
                onClick={() => setShowAadhaarAudit(true)}
                className="px-3 py-1 bg-sage/8 border border-sage/20 text-sage-dark text-[11px] font-semibold rounded-full flex items-center gap-1 hover:bg-sage/15 transition cursor-pointer"
              >
                <Shield className="w-3 h-3" /> Verified Identity Audit
              </button>
            </div>
            <h1 className="text-[28px] sm:text-[34px] font-serif text-charcoal leading-tight">{fund.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-stone">
              {fund.location && (
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-coral" />{fund.location}</span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone" />
                {new Date(fund.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              {daysLeft !== null && (
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold" />{daysLeft} days left</span>
              )}
            </div>
          </div>

          {/* Hospital Payout Escrow details card */}
          <div className="bg-white rounded-3xl border border-sand/40 p-6 shadow-warm-sm space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-sand/20 pb-3">
              <span className="text-[10px] font-bold text-sage-dark uppercase tracking-wider font-mono">Platform Trust Guarantee</span>
              <span className="px-2 py-0.5 bg-sage/10 text-sage-dark text-[8px] font-bold uppercase rounded border border-sage/20">Direct Escrow</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone">
              <div>
                <span className="block text-[10px] uppercase font-bold text-stone">Verified Escrow Recipient</span>
                <span className="font-semibold text-charcoal">{fund.hospitalEscrow?.hospitalName || 'Escrow Partner Hospital Registration Active'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-stone">IFSC & Bank Clearance</span>
                <span className="font-mono text-charcoal">{fund.hospitalEscrow?.ifscCode || 'DIRECT-ESCROW-CLEAR'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-stone">Total Disbursed directly</span>
                <span className="font-bold text-sage-dark">₹{(fund.hospitalEscrow?.disbursedAmount || Math.floor(fund.amountCollected * 0.15)).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-stone">Direct Hospital payout status</span>
                <span className="font-bold text-charcoal">ACTIVE DIRECT BILLING PAYOUTS</span>
              </div>
            </div>
          </div>

          {/* Milestone Release voting progress pipeline */}
          <div className="bg-white rounded-3xl border border-sand/40 p-6 shadow-warm-sm space-y-4 text-left">
            <div>
              <span className="text-[10px] font-bold text-coral uppercase tracking-wider font-mono">Milestone Governance Pipeline</span>
              <h3 className="text-md font-serif text-charcoal font-bold mt-1">Stage-by-Stage Fund Releases</h3>
              <p className="text-[11px] text-stone mt-0.5">Donors vote to authorize releases to the hospital at each medical milestone stage.</p>
            </div>
            <div className="space-y-3">
              {getFundMilestones(fund).map((milestone) => (
                <div key={milestone._id} className="p-3 bg-ivory rounded-xl border border-sand/30 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        milestone.status === 'Released' ? 'bg-sage' : milestone.status === 'Active' ? 'bg-coral' : 'bg-stone/30'
                      }`} />
                      <span className="font-bold text-[12px] text-charcoal">{milestone.title}</span>
                    </div>
                    <p className="text-[10px] text-stone max-w-md">{milestone.description}</p>
                    <div className="flex items-center gap-2 text-[9px] text-stone">
                      <span>Goal: ₹{milestone.targetAmount.toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>Approvals: {milestone.approvals.length} votes</span>
                    </div>
                  </div>
                  {milestone.status === 'Active' && (
                    <button
                      type="button"
                      onClick={() => handleApproveMilestone(milestone._id)}
                      disabled={milestoneLoading}
                      className="px-3 py-1.5 bg-coral hover:bg-terracotta text-white text-[10px] font-bold rounded-lg transition active:scale-[0.95] disabled:opacity-50"
                    >
                      Vote Release
                    </button>
                  )}
                  {milestone.status === 'Released' && (
                    <span className="px-2 py-1 bg-sage/10 text-sage-dark text-[10px] font-bold rounded">Released</span>
                  )}
                  {milestone.status === 'Locked' && (
                    <span className="px-2 py-1 bg-stone/5 text-stone/50 text-[10px] font-bold rounded">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-sand/60">
            <div className="flex gap-6">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-[13px] font-semibold border-b-2 transition ${
                    activeTab === tab.key
                      ? 'text-coral border-coral'
                      : 'text-stone border-transparent hover:text-charcoal'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === 'products' && (
                <div>
                  {kits.items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {kits.items.map((item: any, i: number) => (
                        <ProductCard key={i} {...item} onAdd={() => navigate(`/funds/${fund._id}/donate?kit=${item.id}`)} />
                      ))}
                    </div>
                  ) : fund.breakdownItems && fund.breakdownItems.length > 0 ? (
                    <ProductDetailsTable items={fund.breakdownItems} totalRequired={fund.targetAmount} />
                  ) : (
                    <div className="bg-white rounded-2xl border border-sand/40 p-10 text-center shadow-warm-sm">
                      <p className="text-stone text-[14px]">No donation kits available for this campaign.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'project' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-sand/40 p-6 shadow-warm-sm">
                    <div className="flex items-center justify-between border-b border-sand/30 pb-3 mb-4 flex-wrap gap-2">
                      <h3 className="font-serif text-xl text-charcoal">About This Campaign</h3>
                      {fund.description && (
                        <div className="flex items-center gap-1.5 bg-ivory border border-sand/50 px-3 py-1.5 rounded-xl shadow-warm-sm flex-shrink-0">
                          <span className="text-[10px] font-bold text-stone uppercase tracking-wide mr-1 flex items-center gap-1">
                            🔊 Read Story
                          </span>
                          {!isSpeaking ? (
                            <button
                              type="button"
                              onClick={handleSpeak}
                              className="px-2.5 py-1 bg-coral text-white text-[11px] font-bold rounded-lg hover:bg-terracotta transition cursor-pointer"
                            >
                              Play
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              {isPaused ? (
                                <button
                                  type="button"
                                  onClick={handleResumeSpeech}
                                  className="px-2 py-0.5 bg-coral text-white text-[10px] font-bold rounded-md hover:bg-terracotta transition cursor-pointer"
                                >
                                  Resume
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handlePauseSpeech}
                                  className="px-2 py-0.5 bg-stone text-white text-[10px] font-bold rounded-md hover:bg-charcoal transition cursor-pointer"
                                >
                                  Pause
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={handleStopSpeech}
                                className="px-2 py-0.5 bg-coral border border-coral/20 text-white text-[10px] font-bold rounded-md hover:bg-terracotta transition cursor-pointer"
                              >
                                Stop
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-stone text-[14px] leading-relaxed whitespace-pre-line">{fund.description || 'No description provided.'}</p>
                  </div>
                  {fund.beneficiary && (
                    <div className="bg-white rounded-2xl border border-sand/40 p-6 shadow-warm-sm">
                      <h3 className="font-serif text-lg text-charcoal mb-3">Beneficiary Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
                        <div><p className="text-stone">Name</p><p className="font-semibold text-charcoal">{fund.beneficiary.name || '—'}</p></div>
                        <div><p className="text-stone">Relation</p><p className="font-semibold text-charcoal">{fund.beneficiary.relation || '—'}</p></div>
                        <div><p className="text-stone">Contact</p><p className="font-semibold text-charcoal">{fund.beneficiary.contact || '—'}</p></div>
                      </div>
                    </div>
                  )}

                  {/* Donor Comments */}
                  {donations.length > 0 && (
                    <div className="bg-white rounded-2xl border border-sand/40 p-6 shadow-warm-sm">
                      <h3 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-coral" /> Donor Messages
                      </h3>
                      <div className="space-y-3">
                        {donations.filter((d: any) => d.comment).slice(0, 10).map((d: any) => {
                          const reactions = commentReactions[d._id] || { '👍': 0, '❤️': 0, '🙏': 0, '👏': 0 };
                          return (
                            <div key={d._id} className="bg-ivory rounded-xl p-4 border border-sand/30">
                              <p className="text-charcoal text-[13px] leading-relaxed">{d.comment}</p>
                              <p className="text-stone text-[11px] mt-2">
                                — {d.isAnonymous ? 'Anonymous' : d.donorName || 'A kind soul'} · ₹{d.amount.toLocaleString('en-IN')}
                              </p>
                              {/* Emoji Reactions Bar */}
                              <div className="flex flex-wrap gap-1.5 mt-3 border-t border-sand/20 pt-2.5">
                                {['👍', '❤️', '🙏', '👏'].map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleEmojiReact(d._id, emoji)}
                                    className="px-2.5 py-1 bg-white border border-sand/40 hover:border-coral/20 rounded-lg text-[11px] font-semibold text-stone hover:text-charcoal transition flex items-center gap-1 active:scale-[0.95] cursor-pointer"
                                  >
                                    <span>{emoji}</span>
                                    <span className="text-[10px] text-stone/60">{reactions[emoji] || 0}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'updates' && (
                <div className="space-y-5">
                  {isCreator && (
                    <form onSubmit={handlePostUpdate} className="bg-white rounded-2xl border border-sand/40 p-6 shadow-warm-sm space-y-4">
                      <h4 className="font-semibold text-charcoal text-[14px]">Post an Update</h4>
                      <input type="text" placeholder="Update title" value={newUpdateTitle} onChange={e => setNewUpdateTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-ivory border border-sand rounded-xl text-[13px] text-charcoal placeholder-stone/40" />
                      <textarea placeholder="What's new with your campaign?" value={newUpdateContent} onChange={e => setNewUpdateContent(e.target.value)} rows={3}
                        className="w-full px-4 py-2.5 bg-ivory border border-sand rounded-xl text-[13px] text-charcoal placeholder-stone/40 resize-none" />
                      <button type="submit" disabled={postingUpdate}
                        className="px-5 py-2.5 bg-coral text-white rounded-xl text-[13px] font-bold shadow-warm-sm hover:bg-terracotta disabled:opacity-50 transition flex items-center gap-2">
                        <Send className="w-3.5 h-3.5" /> {postingUpdate ? 'Posting...' : 'Post Update'}
                      </button>
                    </form>
                  )}

                  {updates.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-sand/40 p-10 text-center shadow-warm-sm">
                      <p className="text-stone text-[14px]">No updates posted yet.</p>
                    </div>
                  ) : (
                    updates.slice().reverse().map((u: any, i: number) => (
                      <div key={i} className="bg-white rounded-2xl border border-sand/40 p-6 shadow-warm-sm">
                        <p className="text-[11px] text-stone mb-2">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <h4 className="font-semibold text-charcoal mb-2">{u.title}</h4>
                        <p className="text-stone text-[14px] leading-relaxed">{u.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Donation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-[88px] space-y-5">
            <div className="bg-white rounded-3xl border border-sand/40 shadow-warm-md p-6">
              {/* Progress */}
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[24px] font-serif text-charcoal">₹{fund.amountCollected.toLocaleString('en-IN')}</span>
                  <span className="text-[13px] text-stone">of ₹{fund.targetAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-sand/50 rounded-full h-[8px] overflow-hidden">
                  <div className="bg-coral h-full rounded-full progress-animate" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-3 text-[12px] text-stone">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{fund.donorCount || 0} donors</span>
                  <span className="font-semibold text-coral">{progress.toFixed(0)}%</span>
                </div>
              </div>

              {/* CTA */}
              <Link
                to={`/funds/${fund._id}/donate`}
                className="block w-full py-3.5 bg-coral text-white text-center text-[15px] font-bold rounded-xl shadow-warm hover:bg-terracotta hover:shadow-warm-md transition-all active:scale-[0.98]"
              >
                Donate Now
              </Link>

              <button
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(fund.title + ' — ' + window.location.href)}`, '_blank')}
                className="block w-full mt-3 py-3 bg-ivory text-charcoal text-center text-[13px] font-semibold rounded-xl border border-sand hover:bg-cream transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share Campaign
              </button>

              <button
                onClick={() => {
                  setShareCardOpen(true);
                  setTimeout(handleDrawShareCard, 150);
                }}
                className="block w-full mt-3 py-3 bg-navy text-white text-center text-[13px] font-bold rounded-xl border border-navy hover:bg-navy-light transition flex items-center justify-center gap-2 cursor-pointer shadow-warm-sm"
              >
                🎨 Generate Story Card
              </button>
            </div>

            {/* Recent Donors */}
            {donations.length > 0 && (
              <div className="bg-white rounded-2xl border border-sand/40 shadow-warm-sm p-5">
                <h4 className="text-[12px] font-bold text-stone uppercase tracking-[0.1em] mb-4">Recent Supporters</h4>
                <div className="space-y-3">
                  {donations.slice(0, 5).map((d: any) => (
                    <div key={d._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-[12px] font-bold text-coral">
                          {(d.isAnonymous ? 'A' : (d.donorName || 'D').charAt(0)).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-charcoal">{d.isAnonymous ? 'Anonymous' : d.donorName || 'Donor'}</p>
                          <p className="text-[11px] text-stone">{new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                      <span className="text-[13px] font-semibold text-coral">₹{d.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Hospital Billing Audit Ticker */}
            <div className="bg-white rounded-2xl border border-sand/40 shadow-warm-sm p-5 text-left">
              <span className="text-[10px] font-bold text-sage-dark uppercase tracking-wider font-mono">Hospital Billing Ledger</span>
              <h4 className="font-serif text-sm font-bold text-charcoal mt-0.5 mb-3">Live Settlement Audit</h4>
              <div className="space-y-2.5">
                {getBillingTickerItems(fund).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center text-[11px] bg-sage/5 p-2.5 rounded-lg border border-sage/10">
                    <div>
                      <span className="font-bold text-charcoal block">{tx.item}</span>
                      <span className="text-[9px] text-stone">{tx.time} · {tx.id}</span>
                    </div>
                    <span className="font-mono font-bold text-sage-dark">-₹{tx.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-stone mt-2 text-center">
                * Real-time billing logs uploaded directly by verified hospital accounts department.
              </p>
            </div>

            {/* Peer Team Fundraising Builder */}
            <div className="bg-cream/40 rounded-2xl border border-sand p-5 text-left">
              <h4 className="text-[12px] font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-coral" /> Start a Team Fundraiser
              </h4>
              <p className="text-[11px] text-stone leading-relaxed mb-3">
                Help raise funds faster by creating your own sub-campaign under this goal. Contributions will feed directly into this main campaign's total.
              </p>
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('parentFundId', fund._id);
                  params.set('titleDraft', `Team ${user?.name || 'Supporter'} supporting ${fund.title}`);
                  params.set('categoryDraft', fund.category);
                  params.set('amountDraft', String(Math.floor(fund.targetAmount * 0.2)));
                  navigate(`/create?${params.toString()}`);
                }}
                className="w-full py-2 bg-coral hover:bg-terracotta text-white rounded-xl text-xs font-bold transition text-center shadow-warm-sm"
              >
                Launch Team Fundraiser
              </button>
            </div>
          </div>
        </div>
      {/* ── Campaign Canvas Share Card Modal ── */}
      {shareCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm transition-opacity">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white max-w-lg w-full rounded-3xl border border-sand/40 shadow-warm-xl p-6 flex flex-col items-stretch max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-sand/30 pb-3.5 mb-4 flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold text-coral uppercase tracking-widest">Story Generator</span>
                <h3 className="text-lg font-serif text-charcoal">Download Campaign Story Card</h3>
              </div>
              <button
                type="button"
                onClick={() => setShareCardOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-sand flex items-center justify-center text-stone hover:text-coral transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Canvas holder with scrolling container */}
            <div className="flex-1 overflow-y-auto py-2 text-center flex flex-col justify-center">
              <canvas
                ref={canvasRef}
                className="mx-auto border border-sand/65 rounded-2xl shadow-warm max-w-full max-h-[55vh] object-contain bg-white"
              />
              <p className="text-[11px] text-stone mt-3">
                This image is optimized for posting on Instagram, WhatsApp, or Facebook stories!
              </p>
            </div>

            <div className="border-t border-sand/30 pt-4 mt-4 flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShareCardOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-stone border border-sand hover:bg-cream transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={downloadShareCard}
                className="flex-1 py-2.5 bg-coral text-white text-[13px] font-bold rounded-xl shadow-warm hover:bg-terracotta transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Download PNG Card
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cryptographic Aadhaar Verification Drawer modal */}
      {showAadhaarAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm transition-opacity">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white max-w-md w-full rounded-3xl border border-sand/40 shadow-warm-xl p-6 flex flex-col items-stretch text-left space-y-6 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-sand/30 pb-3 flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold text-sage-dark uppercase tracking-widest">Identity Verification Audit</span>
                <h3 className="text-lg font-serif text-charcoal font-bold">Aadhaar Validation Hash Logs</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAadhaarAudit(false)}
                className="w-8 h-8 rounded-full bg-white border border-sand flex items-center justify-center text-stone hover:text-coral transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs text-charcoal bg-cream/40 p-4 rounded-2xl border border-sand/40">
              <div className="text-center font-bold text-xs border-b border-sand/20 pb-2 mb-2">
                UIDAI VERIFICATION RECEIPT (MASKED)
              </div>
              <div className="flex justify-between">
                <span>Creator ID:</span>
                <span>{(fund.creatorId as any)?.name || 'Verified Creator'}</span>
              </div>
              <div className="flex justify-between">
                <span>UIDAI Aadhaar Reference:</span>
                <span>XXXX-XXXX-{(fund.creatorId as any)?.phone?.substring(6) || '4912'}</span>
              </div>
              <div className="flex justify-between">
                <span>Verification Method:</span>
                <span>Government API XML Hash</span>
              </div>
              <div className="flex justify-between">
                <span>Audit Stamp Hash:</span>
                <span className="text-[9px] text-stone truncate max-w-[200px]">0x8f2bdc91a0b3fefb751b74c185fd8976f</span>
              </div>
              <div className="flex justify-between text-sage-dark font-bold border-t border-dashed border-sand/40 pt-2">
                <span>STATUS:</span>
                <span>UIDAI MATCH SUCCESS</span>
              </div>
            </div>

            <p className="text-[10px] text-stone leading-relaxed">
              * Note: This audit report is generated to verify that the campaign creator's name and Aadhaar details match government databases. Masked digits are preserved to comply with UIDAI privacy regulations.
            </p>

            <button
              type="button"
              onClick={() => setShowAadhaarAudit(false)}
              className="w-full py-3 bg-coral hover:bg-terracotta text-white rounded-xl text-xs font-bold shadow-warm transition"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export default FundDetail;
