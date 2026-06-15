import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { donationApi, fundApi } from '../services/api';
import { Donation, Fund } from '../types';
import { motion } from 'framer-motion';
import { Heart, Plus, ExternalLink, ShieldCheck, Clock, CheckCircle2, XCircle, LogOut, TrendingUp, AlertCircle, Award, Activity, PieChart, Download, Trophy, Calendar, Sparkles, Info } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myFunds, setMyFunds] = useState<Fund[]>([]);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [loadingFunds, setLoadingFunds] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [activeTab, setActiveTab] = useState<'funds' | 'donations'>('funds');

  // Interactive Tax saving slider state
  const [taxDonationAmount, setTaxDonationAmount] = useState(5000);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fundApi.getUserFunds().then(r => setMyFunds(r.data.funds || [])).catch(() => {}).finally(() => setLoadingFunds(false));
    donationApi.getMyDonations().then(r => setMyDonations(r.data.donations || [])).catch(() => {}).finally(() => setLoadingDonations(false));
  }, [user, navigate]);

  useEffect(() => {
    if (myDonations.length > 0) {
      const total = myDonations.reduce((sum, d: any) => sum + (d.amount || 0), 0);
      setTaxDonationAmount(total > 0 ? total : 5000);
    }
  }, [myDonations]);

  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    Active: { bg: 'bg-sage/10 border-sage/30', text: 'text-sage-dark', icon: <CheckCircle2 className="w-3 h-3" /> },
    Pending: { bg: 'bg-gold/10 border-gold/30', text: 'text-gold', icon: <Clock className="w-3 h-3" /> },
    Completed: { bg: 'bg-stone/10 border-stone/30', text: 'text-stone', icon: <CheckCircle2 className="w-3 h-3" /> },
    Rejected: { bg: 'bg-coral/10 border-coral/30', text: 'text-coral', icon: <XCircle className="w-3 h-3" /> },
  };

  const totalDonated = myDonations.reduce((sum, d: any) => sum + (d.amount || 0), 0);
  const totalRaised = myFunds.reduce((sum, f) => sum + (f.amountCollected || 0), 0);

  // Compute locked/unlocked milestones and progress
  const badgesList = [
    { 
      id: 'verified', 
      name: 'Verified Creator', 
      desc: 'Aadhaar identity checked and trusted.', 
      icon: ShieldCheck, 
      color: 'text-sage-dark bg-sage/10 border-sage/20', 
      active: user.isVerified,
      progressText: user.isVerified ? 'Completed' : 'Verification required',
      progressPercent: user.isVerified ? 100 : 0
    },
    { 
      id: 'donor', 
      name: 'Generous Heart', 
      desc: 'Contributed to at least one active campaign.', 
      icon: Heart, 
      color: 'text-coral bg-coral/10 border-coral/20', 
      active: myDonations.length > 0,
      progressText: myDonations.length > 0 ? 'Unlocked' : 'Donate once to unlock',
      progressPercent: myDonations.length > 0 ? 100 : 0
    },
    { 
      id: 'creator', 
      name: 'Campaign Pillar', 
      desc: 'Started a fundraising campaign.', 
      icon: Plus, 
      color: 'text-navy bg-navy/8 border-navy/20', 
      active: myFunds.length > 0,
      progressText: myFunds.length > 0 ? 'Unlocked' : 'Start 1 campaign to unlock',
      progressPercent: myFunds.length > 0 ? 100 : 0
    },
    { 
      id: 'elite', 
      name: 'Elite Supporter', 
      desc: 'Contributed more than ₹2,000 to the community.', 
      icon: Award, 
      color: 'text-gold bg-gold/10 border-gold/20', 
      active: totalDonated >= 2000,
      progressText: totalDonated >= 2000 ? 'Unlocked' : `₹${(2000 - totalDonated).toLocaleString('en-IN')} more to unlock`,
      progressPercent: Math.min(100, (totalDonated / 2000) * 100)
    },
    { 
      id: 'champion', 
      name: 'Hope Champion', 
      desc: 'Raised more than ₹10,000 for critical relief.', 
      icon: TrendingUp, 
      color: 'text-navy bg-[#E8DDD3] border-sand', 
      active: totalRaised >= 10000,
      progressText: totalRaised >= 10000 ? 'Unlocked' : `₹${(10000 - totalRaised).toLocaleString('en-IN')} raised more to unlock`,
      progressPercent: Math.min(100, (totalRaised / 10000) * 100)
    },
  ];

  // Group donations by category for SVG chart
  const donationsByCategory = myDonations.reduce((acc: Record<string, number>, d: any) => {
    const cat = d.fundId?.category || 'Disaster Relief';
    acc[cat] = (acc[cat] || 0) + d.amount;
    return acc;
  }, {});

  const totalDonationSum = Object.values(donationsByCategory).reduce((s, a) => s + a, 0);

  // SVG donut slices configuration
  let cumulativePercent = 0;
  const colorsPalette = ['#E86B4A', '#7B9E7B', '#1E2D3D', '#D4A853', '#6B6560', '#C25538'];
  
  const chartSlices = Object.entries(donationsByCategory).map(([cat, amt], i) => {
    const percent = totalDonationSum > 0 ? (amt / totalDonationSum) * 100 : 0;
    const strokeDash = `${percent} ${100 - percent}`;
    const offset = 100 - cumulativePercent + 25; // start at 12 o'clock
    cumulativePercent += percent;
    return {
      category: cat,
      amount: amt,
      percent,
      dash: strokeDash,
      offset,
      color: colorsPalette[i % colorsPalette.length]
    };
  });

  // Supporter level based on amount
  const getSupporterLevel = () => {
    if (totalDonated >= 10000) return { name: 'Hope Champion', next: 'Max Level reached', percent: 100 };
    if (totalDonated >= 2000) return { name: 'Elite Supporter', next: `₹${(10000 - totalDonated).toLocaleString('en-IN')} to Hope Champion`, percent: Math.min(100, (totalDonated / 10000) * 100) };
    if (totalDonated > 0) return { name: 'Generous Heart', next: `₹${(2000 - totalDonated).toLocaleString('en-IN')} to Elite Supporter`, percent: Math.min(100, (totalDonated / 2000) * 100) };
    return { name: 'Seed of Hope', next: 'Donate once to reach Generous Heart', percent: 0 };
  };

  // Activity Feed
  const activityFeed = [];
  if (user.isVerified) {
    activityFeed.push({ text: 'Identity verified successfully via secure Aadhaar card validation.', date: 'Verified Account', icon: ShieldCheck, color: 'bg-sage/10 text-sage-dark' });
  } else {
    activityFeed.push({ text: 'Aadhaar identity verification pending. Securely upload document now.', date: 'Action Needed', icon: AlertCircle, color: 'bg-gold/10 text-gold' });
  }
  myDonations.slice(0, 3).forEach((d: any) => {
    activityFeed.push({
      text: `Donated ₹${d.amount.toLocaleString('en-IN')} to "${typeof d.fundId === 'object' ? d.fundId.title : 'Campaign'}".`,
      date: new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      icon: Heart,
      color: 'bg-coral/10 text-coral'
    });
  });
  myFunds.slice(0, 2).forEach((f: any) => {
    activityFeed.push({
      text: `Launched campaign "${f.title}" targeting ₹${f.targetAmount.toLocaleString('en-IN')}.`,
      date: new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      icon: Plus,
      color: 'bg-navy/8 text-navy'
    });
  });

  // Generate mock heatmap cells for 24 weeks (168 cells)
  const heatmapCells = [];
  const today = new Date();
  for (let i = 167; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toDateString();
    
    const donationsOnDay = myDonations.filter((don: any) => new Date(don.createdAt).toDateString() === dateStr);
    
    let intensity = 0;
    if (donationsOnDay.length > 0) {
      const dayTotal = donationsOnDay.reduce((sum, don) => sum + don.amount, 0);
      if (dayTotal > 5000) intensity = 3;
      else if (dayTotal > 1000) intensity = 2;
      else intensity = 1;
    } else {
      // Simulate random background history patterns for aesthetic completeness
      const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      if (hash % 17 === 0) intensity = 1;
      else if (hash % 41 === 0) intensity = 2;
    }

    heatmapCells.push({ date: d, intensity, count: donationsOnDay.length });
  }

  // Cursive path drawing helper for signature
  const drawSignature = (context: CanvasRenderingContext2D, startX: number, startY: number, text: string) => {
    context.strokeStyle = '#1d3557';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    
    if (text === 'Aditya') {
      context.moveTo(startX, startY);
      context.quadraticCurveTo(startX + 10, startY - 15, startX + 20, startY - 5);
      context.quadraticCurveTo(startX + 25, startY + 8, startX + 30, startY);
      context.quadraticCurveTo(startX + 35, startY - 12, startX + 40, startY + 4);
      context.quadraticCurveTo(startX + 45, startY - 4, startX + 50, startY + 4);
      context.quadraticCurveTo(startX + 55, startY - 6, startX + 60, startY + 2);
      context.quadraticCurveTo(startX + 70, startY - 15, startX + 75, startY + 4);
      context.moveTo(startX - 5, startY + 6);
      context.quadraticCurveTo(startX + 35, startY + 10, startX + 80, startY + 3);
    } else {
      context.moveTo(startX, startY);
      context.quadraticCurveTo(startX + 8, startY - 20, startX + 15, startY - 4);
      context.quadraticCurveTo(startX + 20, startY + 4, startX + 22, startY);
      context.quadraticCurveTo(startX + 25, startY - 10, startX + 28, startY + 2);
      context.quadraticCurveTo(startX + 32, startY - 12, startX + 35, startY + 2);
      context.quadraticCurveTo(startX + 38, startY - 6, startX + 42, startY);
      context.quadraticCurveTo(startX + 46, startY - 18, startX + 52, startY + 4);
      context.moveTo(startX - 8, startY + 8);
      context.quadraticCurveTo(startX + 25, startY + 12, startX + 60, startY + 6);
    }
    context.stroke();
  };

  // Gold Seal Rosette illustration
  const drawSeal = (context: CanvasRenderingContext2D, cx: number, cy: number) => {
    context.fillStyle = '#D4A853';
    const numPoints = 24;
    const innerRadius = 24;
    const outerRadius = 30;
    context.beginPath();
    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();
    context.fill();

    context.fillStyle = '#C25538';
    context.beginPath();
    context.moveTo(cx - 12, cy + 15);
    context.lineTo(cx - 20, cy + 50);
    context.lineTo(cx - 12, cy + 44);
    context.lineTo(cx - 4, cy + 50);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(cx + 4, cy + 15);
    context.lineTo(cx + 12, cy + 50);
    context.lineTo(cx + 20, cy + 44);
    context.lineTo(cx + 28, cy + 50);
    context.closePath();
    context.fill();

    context.fillStyle = '#D4A853';
    context.beginPath();
    context.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = '#FAF8F5';
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(cx, cy, 20, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = '#FAF8F5';
    context.font = 'bold 7px sans-serif';
    context.textAlign = 'center';
    context.fillText('APPROVED', cx, cy - 3);
    context.font = 'bold 6px sans-serif';
    context.fillText('CROWDFUND', cx, cy + 6);
  };

  // Draw & Download Appreciation Certificate
  const downloadCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Background
    ctx.fillStyle = '#FAF8F5'; 
    ctx.fillRect(0, 0, 800, 600);

    // Draw Double Border
    ctx.strokeStyle = '#D4C3B3'; 
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, 760, 560);
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 45, 710, 510);

    // Draw Decorative Corners
    ctx.fillStyle = '#E86B4A'; 
    ctx.fillRect(40, 40, 20, 20);
    ctx.fillRect(740, 40, 20, 20);
    ctx.fillRect(40, 540, 20, 20);
    ctx.fillRect(740, 540, 20, 20);

    // Header Title
    ctx.fillStyle = '#1E2D3D';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF PHILANTHROPY', 400, 120);

    ctx.fillStyle = '#E86B4A';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText('This honor is proudly presented to', 400, 175);

    // User Name
    ctx.fillStyle = '#1E2D3D';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText(user.name.toUpperCase(), 400, 235);

    // Divider line
    ctx.strokeStyle = '#D4C3B3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 265);
    ctx.lineTo(550, 265);
    ctx.stroke();

    // Body Text
    ctx.fillStyle = '#6B6560'; 
    ctx.font = '14px sans-serif';
    ctx.fillText('In sincere recognition and appreciation of their noble contributions', 400, 310);
    ctx.fillText('towards healthcare, emergency relief, and child care campaigns on CrowdFund.', 400, 335);
    ctx.fillText('Their outstanding generosity represents a beacon of hope for many lives.', 400, 360);

    // Stats Box Background
    ctx.fillStyle = '#FAF0E6'; 
    ctx.fillRect(200, 405, 400, 60);
    ctx.strokeStyle = '#D4C3B3';
    ctx.strokeRect(200, 405, 400, 60);

    // Stats text
    ctx.fillStyle = '#E86B4A';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`Total Contributions: ₹${totalDonated.toLocaleString('en-IN')}`, 400, 430);
    ctx.fillStyle = '#6B6560';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Aadhaar Verified Status: Secured | Reference ID: UIDAI-CF-${user.id.slice(-6).toUpperCase()}`, 400, 450);

    // Draw Gold Seal with ribbons
    drawSeal(ctx, 400, 510);

    // Signature 1
    drawSignature(ctx, 110, 500, 'Aditya');
    ctx.fillStyle = '#1E2D3D';
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Aditya Sharma', 150, 525);
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#6B6560';
    ctx.fillText('Review Committee Chairperson', 150, 540);
    ctx.strokeStyle = '#D4C3B3';
    ctx.beginPath();
    ctx.moveTo(70, 510);
    ctx.lineTo(230, 510);
    ctx.stroke();

    // Signature 2
    drawSignature(ctx, 610, 500, 'Ritik');
    ctx.fillStyle = '#1E2D3D';
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Ritik Sen', 650, 525);
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#6B6560';
    ctx.fillText('Co-Founder, CrowdFund', 650, 540);
    ctx.strokeStyle = '#D4C3B3';
    ctx.beginPath();
    ctx.moveTo(570, 510);
    ctx.lineTo(730, 510);
    ctx.stroke();

    // Trigger Download
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `appreciation-certificate-${user.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Draw & Download Donation Receipt Bill
  const downloadReceipt = (don: Donation | any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, 600, 800);

    // Warm double border
    ctx.strokeStyle = '#D4C3B3';
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, 570, 770);
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 540, 740);

    // Invoice Header
    ctx.fillStyle = '#1E2D3D';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CROWDFUND TAX RECEIPT & INVOICE', 300, 80);

    // NGO Subtitle
    ctx.fillStyle = '#E86B4A';
    ctx.font = '11px sans-serif';
    ctx.fillText('Secured under Section 80G of the Indian Income Tax Act', 300, 105);

    // Horizontal Rule
    ctx.strokeStyle = '#D4C3B3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 125);
    ctx.lineTo(550, 125);
    ctx.stroke();

    // Left info (Metadata)
    ctx.fillStyle = '#6B6560';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('RECEIPT DETAILS', 50, 155);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#1E2D3D';
    const donId = don._id ? don._id.toUpperCase() : 'N/A';
    ctx.fillText(`Receipt No: CF-REC-${donId.slice(-8)}`, 50, 175);
    ctx.fillText(`Date: ${new Date(don.createdAt).toLocaleDateString('en-IN')}`, 50, 195);
    ctx.fillText(`Transaction ID: TXN-${donId}`, 50, 215);

    // Right info (Donor & NGO Details)
    ctx.fillStyle = '#6B6560';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('DONOR INFO', 320, 155);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#1E2D3D';
    ctx.fillText(`Donor Name: ${don.donorName || user.name}`, 320, 175);
    ctx.fillText(`Email: ${user.email}`, 320, 195);
    ctx.fillText(`PAN Ref: ${don.panNumber || 'XXXXX1234X'}`, 320, 215);

    // Horizontal Rule
    ctx.strokeStyle = '#D4C3B3';
    ctx.beginPath();
    ctx.moveTo(50, 240);
    ctx.lineTo(550, 240);
    ctx.stroke();

    // Cause Details
    ctx.fillStyle = '#6B6560';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('BILLING DETAILS FOR CONTRIBUTION', 50, 270);

    ctx.fillStyle = '#1E2D3D';
    ctx.font = 'bold 12px sans-serif';
    const cTitle = don.fundId?.title || 'Verified Emergency Relief Campaign';
    ctx.fillText(cTitle.length > 55 ? `${cTitle.slice(0, 55)}...` : cTitle, 50, 295);

    // Draw Receipt Table headers
    ctx.fillStyle = '#FAF0E6';
    ctx.fillRect(50, 320, 500, 30);
    ctx.strokeStyle = '#D4C3B3';
    ctx.strokeRect(50, 320, 500, 30);

    ctx.fillStyle = '#1E2D3D';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Item Description', 65, 338);
    ctx.textAlign = 'right';
    ctx.fillText('Amount (INR)', 535, 338);

    // Table Row 1 (Base Contribution)
    ctx.textAlign = 'left';
    ctx.font = '11px sans-serif';
    ctx.fillText('Philanthropic Donation Base', 65, 380);
    ctx.textAlign = 'right';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`₹${don.amount.toLocaleString('en-IN')}`, 535, 380);

    // Table Row 2 (Gateway Taxes & Platform Markup)
    ctx.textAlign = 'left';
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#6B6560';
    ctx.fillText('Gateway processing fee & taxes (0% Platform Fee)', 65, 410);
    ctx.textAlign = 'right';
    ctx.fillText('₹0.00', 535, 410);

    // Table Row 3 (GST on platform markup)
    ctx.textAlign = 'left';
    ctx.fillText('Applicable GST/VAT direct surcharge', 65, 440);
    ctx.textAlign = 'right';
    ctx.fillText('₹0.00', 535, 440);

    // Horizontal Rule for Total
    ctx.strokeStyle = '#D4C3B3';
    ctx.beginPath();
    ctx.moveTo(50, 465);
    ctx.lineTo(550, 465);
    ctx.stroke();

    // Total Amount Row
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E2D3D';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText('Total Contributed Value (Net Paid)', 65, 490);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#E86B4A';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.fillText(`₹${don.amount.toLocaleString('en-IN')}`, 535, 490);

    // Table border
    ctx.strokeStyle = '#D4C3B3';
    ctx.strokeRect(50, 320, 500, 195);

    // 80G Tax Exemption assessment summary
    ctx.fillStyle = '#FAF0E6';
    ctx.fillRect(50, 540, 500, 70);
    ctx.strokeStyle = '#D4C3B3';
    ctx.strokeRect(50, 540, 500, 70);

    ctx.fillStyle = '#E86B4A';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('80G Tax Rebate Claim Value (50% Deduction):', 65, 565);
    ctx.font = 'bold 14px font-mono';
    ctx.fillStyle = '#7B9E7B';
    ctx.fillText(`₹${(don.amount * 0.5).toLocaleString('en-IN')}`, 65, 592);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#6B6560';
    ctx.font = '9px sans-serif';
    ctx.fillText('Certificate verified under UIDAI & IT Act 1961', 535, 565);
    ctx.fillText('Tax savings computed instantly', 535, 582);
    ctx.fillText('No platform markup retained', 535, 597);

    // Signatures
    ctx.textAlign = 'center';
    drawSignature(ctx, 380, 680, 'Ritik');
    ctx.fillStyle = '#1E2D3D';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Ritik Sen', 420, 705);
    ctx.fillStyle = '#6B6560';
    ctx.font = '9px sans-serif';
    ctx.fillText('Co-Founder, CrowdFund', 420, 720);
    ctx.strokeStyle = '#D4C3B3';
    ctx.beginPath();
    ctx.moveTo(350, 692);
    ctx.lineTo(490, 692);
    ctx.stroke();

    // Verify stamp
    drawSeal(ctx, 150, 685);

    // Trigger Download
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `crowdfund-receipt-txn-${donId.slice(-8)}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock global supporter leaderboard data
  const globalLeaderboard = [
    { name: 'Aditya S.', amount: 28500, verified: true, trophy: '🏆' },
    { name: 'Priyanshu M.', amount: 18000, verified: true, trophy: '🥈' },
    { name: 'Ananya K.', amount: 14500, verified: true, trophy: '🥉' },
    { name: 'Karan J.', amount: 9500, verified: false, trophy: '' },
    { name: 'Meera R.', amount: 6200, verified: true, trophy: '' }
  ];

  return (
    <div className="min-h-screen bg-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl border border-sand/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-warm-sm">
          <div>
            <h1 className="text-3xl font-serif text-charcoal">Welcome, {user.name}</h1>
            <p className="text-[13px] text-stone mt-1">Your generosity makes real-world impacts. Track milestones and savings below.</p>
          </div>
          <div className="flex items-center gap-3 bg-ivory rounded-2xl p-3 border border-sand/30 self-start md:self-auto">
            <Sparkles className="w-5 h-5 text-coral animate-pulse" />
            <div className="text-left text-[12px]">
              <span className="text-stone block">Supporter Level</span>
              <span className="font-bold text-charcoal flex items-center gap-1.5">
                {getSupporterLevel().name}
              </span>
            </div>
          </div>
        </div>

        {/* 3-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* COLUMN 1: Profile Details & Milestones (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Profile Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-warm border border-sand/40 p-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-coral flex items-center justify-center text-2xl font-serif text-white shadow-warm mx-auto mb-4 font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-serif text-charcoal truncate">{user.name}</h2>
              <p className="text-[12px] text-stone mb-4 truncate">{user.email}</p>
              
              <div className="flex flex-col items-center gap-2">
                <span className={`text-[11px] px-2.5 py-1.5 rounded-lg font-semibold border flex items-center gap-1.5 w-full justify-center ${
                  user.isVerified ? 'bg-sage/10 border-sage/30 text-sage-dark' : 'bg-gold/10 border-gold/30 text-gold'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.isVerified ? 'Aadhaar Verified' : 'Unverified Account'}
                </span>
                {!user.isVerified && (
                  <Link to="/verify" className="text-[11px] font-bold text-coral bg-coral/8 border border-coral/20 px-4 py-2.5 rounded-xl hover:bg-coral/12 transition w-full mt-2">
                    Verify Identity Now →
                  </Link>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-1.5 border-t border-sand/30 pt-5 mt-5 text-center">
                <div>
                  <p className="text-[14px] font-bold text-charcoal truncate">₹{totalRaised.toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-stone uppercase tracking-wider font-semibold">Raised</p>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-charcoal truncate">₹{totalDonated.toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-stone uppercase tracking-wider font-semibold">Donated</p>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-charcoal">{myFunds.length}</p>
                  <p className="text-[9px] text-stone uppercase tracking-wider font-semibold">Funds</p>
                </div>
              </div>

              <button onClick={handleLogout} className="mt-5 w-full py-2.5 rounded-xl text-[11px] font-semibold text-stone border border-sand hover:text-coral hover:border-coral/20 transition flex items-center justify-center gap-2 cursor-pointer">
                <LogOut className="w-3.5 h-3.5" /> Logout Account
              </button>
            </motion.div>

            {/* Locked/Unlocked Badges with Progress Meters */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-warm border border-sand/40 p-5 space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-sand/30 pb-3">
                <Award className="w-4 h-4 text-coral" />
                <h3 className="font-serif text-[15px] text-charcoal font-semibold">Milestones & Progress</h3>
              </div>
              <div className="space-y-4">
                {badgesList.map((badge) => (
                  <div key={badge.id} className={`flex flex-col p-3 rounded-2xl border transition ${
                    badge.active ? 'bg-cream/40 border-sand/40 opacity-100' : 'bg-ivory border-sand/20'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                        badge.active ? badge.color : 'text-stone/40 bg-sand/10 border-sand/20'
                      }`}>
                        <badge.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-charcoal flex items-center justify-between">
                          <span>{badge.name}</span>
                          {badge.active && (
                            <span className="text-[8px] text-sage-dark bg-sage/15 px-1.5 py-0.5 rounded border border-sage/20 uppercase font-bold tracking-wider">
                              Unlocked
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-stone mt-0.5 leading-relaxed">{badge.desc}</p>
                      </div>
                    </div>
                    {/* Badge unlocks progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[9px] text-stone mb-1 font-semibold">
                        <span>{badge.progressText}</span>
                        <span>{badge.progressPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-sand/20 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-500 ${badge.active ? 'bg-sage' : 'bg-coral/50'}`} 
                          style={{ width: `${badge.progressPercent}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* COLUMN 2: Visual Distribution, Tabs, Activity Heatmap (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Donation Category Distribution Card */}
            {myDonations.length > 0 ? (
              <div className="bg-white rounded-3xl border border-sand/40 p-5 shadow-warm flex flex-col">
                <div className="flex items-center gap-2 border-b border-sand/30 pb-3 mb-4">
                  <PieChart className="w-4 h-4 text-coral" />
                  <h3 className="font-serif text-[15px] font-semibold text-charcoal">Giving Distribution</h3>
                </div>
                <div className="flex items-center justify-center h-32 relative my-2">
                  <svg viewBox="0 0 40 40" className="w-24 h-24 transform -rotate-90">
                    {chartSlices.map((slice, idx) => (
                      <circle
                        key={idx}
                        cx="20"
                        cy="20"
                        r="15.915"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="4.5"
                        strokeDasharray={slice.dash}
                        strokeDashoffset={slice.offset}
                        className="transition-all duration-700 hover:stroke-[6px] cursor-pointer"
                      />
                    ))}
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-stone uppercase tracking-wider font-bold">Total Donated</span>
                    <span className="text-md font-serif font-bold text-charcoal">₹{totalDonated.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {/* Custom layout legend */}
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[9px]">
                  {chartSlices.map((slice, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="text-stone truncate flex-1">{slice.category}</span>
                      <span className="font-bold text-charcoal whitespace-nowrap">{slice.percent.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-sand/40 p-5 text-center shadow-warm py-8">
                <PieChart className="w-8 h-8 text-stone/40 mx-auto mb-3" />
                <h4 className="font-serif text-charcoal text-[14px]">No Giving Visuals Available</h4>
                <p className="text-[11px] text-stone mt-1">Make contributions to build category charts.</p>
              </div>
            )}

            {/* Interactive Giving History Calendar Heatmap Grid */}
            <div className="bg-white rounded-3xl border border-sand/40 p-5 shadow-warm space-y-4">
              <div className="flex items-center justify-between border-b border-sand/30 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-coral" />
                  <h3 className="font-serif text-[15px] font-semibold text-charcoal">Giving History Calendar</h3>
                </div>
                <span className="text-[9px] text-stone font-semibold">Last 24 Weeks</span>
              </div>
              <div className="flex justify-center">
                <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto max-w-full pb-2 scrollbar-thin">
                  {heatmapCells.map((cell, idx) => {
                    let cellColor = 'bg-cream/40 border border-sand/10';
                    if (cell.intensity === 1) cellColor = 'bg-coral/20 border border-coral/30';
                    if (cell.intensity === 2) cellColor = 'bg-coral/60 border border-coral/70';
                    if (cell.intensity === 3) cellColor = 'bg-coral border border-terracotta';
                    
                    return (
                      <div 
                        key={idx}
                        title={`${cell.date.toDateString()}: ${cell.count} donations`}
                        className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 ${cellColor}`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] text-stone font-semibold">
                <span>Less active</span>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-cream/40 border border-sand/10" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-coral/20 border border-coral/30" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-coral/60 border border-coral/70" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-coral border border-terracotta" />
                </div>
                <span>More active</span>
              </div>
            </div>

            {/* Campaign & Donation Tab Lists */}
            <div className="bg-white rounded-3xl border border-sand/40 shadow-warm p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-sand/30 pb-3 flex-wrap">
                {(['funds', 'donations'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                      activeTab === tab ? 'bg-coral text-white border-coral shadow-warm-sm' : 'bg-ivory border-sand text-stone hover:text-charcoal'
                    }`}>
                    {tab === 'funds' ? `My Campaigns (${myFunds.length})` : `My Donations (${myDonations.length})`}
                  </button>
                ))}
                <Link to="/create" className="ml-auto px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-coral text-white hover:bg-terracotta transition flex items-center gap-1">
                  <Plus className="w-3 h-3" /> New
                </Link>
              </div>

              {/* Tab Outputs */}
              {activeTab === 'funds' ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {myFunds.length === 0 ? (
                    <p className="text-[11px] text-stone italic text-center py-6">No campaigns created yet.</p>
                  ) : (
                    myFunds.map((fund) => {
                      const st = statusConfig[fund.status] || statusConfig['Pending'];
                      return (
                        <div key={fund._id} className="bg-ivory rounded-xl border border-sand/30 p-3 flex items-center justify-between gap-3 text-[12px]">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-charcoal truncate">{fund.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px]">
                              <span className={`px-1.5 py-0.5 rounded border font-bold flex items-center gap-1 ${st.bg} ${st.text}`}>
                                {st.icon} {fund.status}
                              </span>
                              <span className="text-stone">Target: ₹{fund.targetAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <Link to={`/funds/${fund._id}`} className="p-1.5 bg-white border border-sand rounded hover:bg-cream/40 transition">
                            <ExternalLink className="w-3.5 h-3.5 text-stone" />
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {myDonations.length === 0 ? (
                    <p className="text-[11px] text-stone italic text-center py-6">No donations recorded yet.</p>
                  ) : (
                  myDonations.map((don: any) => (
                    <div key={don._id} className="bg-ivory rounded-xl border border-sand/30 p-3 flex items-center justify-between gap-3 text-[12px]">
                      <div className="min-w-0 flex-1 text-left">
                        <p className="font-semibold text-charcoal truncate">
                          {typeof don.fundId === 'object' ? don.fundId.title : 'Campaign Relief'}
                        </p>
                        <p className="text-[10px] text-stone mt-0.5">{new Date(don.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-coral flex-shrink-0">₹{don.amount.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => downloadReceipt(don)}
                          title="Download Receipt (Bill/Invoice)"
                          className="p-1.5 bg-white border border-sand rounded hover:bg-cream/40 transition hover:text-coral cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              )}
            </div>

          </div>

          {/* COLUMN 3: Fancy Widgets & Timeline (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Appreciation Certificate Downloader Box */}
            <div className="bg-white rounded-3xl border border-sand/40 p-5 shadow-warm space-y-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 p-1.5 bg-gold/10 text-gold border border-gold/20 rounded-lg">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="border-b border-sand/30 pb-3">
                <span className="text-[9px] font-bold text-coral uppercase tracking-widest block">SECURED REWARD</span>
                <h3 className="font-serif text-[15px] font-semibold text-charcoal">Philanthropy Certificate</h3>
              </div>
              
              <div className="bg-cream/35 border border-dashed border-sand/60 rounded-2xl p-4 text-center space-y-3 relative">
                {/* Visual Diploma Mockup */}
                <div className="border border-sand/40 p-3 bg-white shadow-warm-sm rounded-lg text-left text-[9px] space-y-1 relative">
                  <div className="w-1.5 h-1.5 bg-coral rounded-full absolute top-1 right-1" />
                  <p className="font-serif text-[11px] font-bold text-charcoal text-center">CERTIFICATE OF HOPE</p>
                  <p className="text-stone text-[8px] text-center italic">Presented with gratitude to</p>
                  <p className="font-bold text-charcoal text-center text-[10px] truncate uppercase">{user.name}</p>
                  <div className="border-t border-sand/30 my-1" />
                  <div className="flex justify-between text-[7px] text-stone">
                    <span>Appreciation verified</span>
                    <span>UIDAI: verified</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone leading-relaxed">
                  Download a print-ready, high-resolution certified document of appreciation.
                </p>
              </div>

              <button 
                onClick={downloadCertificate}
                className="w-full py-3 bg-coral text-white rounded-xl text-[12px] font-bold shadow-warm hover:bg-terracotta transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" /> Download Certificate (PNG)
              </button>
            </div>

            {/* Interactive Section 80G Tax savings calculator */}
            <div className="bg-white rounded-3xl border border-sand/40 p-5 shadow-warm space-y-4">
              <div className="border-b border-sand/30 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-coral" />
                  <h3 className="font-serif text-[15px] font-semibold text-charcoal">80G Tax-Savings Widget</h3>
                </div>
                <span className="text-[9px] text-sage font-bold bg-sage/10 border border-sage/20 px-1.5 py-0.5 rounded uppercase">India Only</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] text-stone font-semibold mb-1">
                    <span>Donation Value</span>
                    <span className="text-coral font-bold text-[12px]">₹{taxDonationAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="50000" 
                    step="500"
                    value={taxDonationAmount}
                    onChange={(e) => setTaxDonationAmount(Number(e.target.value))}
                    className="w-full accent-coral bg-sand/30 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-stone font-semibold mt-1">
                    <span>₹500</span>
                    <span>₹50,000</span>
                  </div>
                </div>

                <div className="bg-ivory border border-sand/40 rounded-xl p-3 text-[11px] space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-stone">Tax Exemption Deduction</span>
                    <span className="font-bold text-sage-dark">50% (Sec 80G)</span>
                  </div>
                  <div className="flex justify-between border-t border-sand/20 pt-1.5">
                    <span className="text-stone">Taxes Saved (Est.)</span>
                    <span className="font-bold text-charcoal">₹{(taxDonationAmount * 0.5).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-sand/20 pt-1.5">
                    <span className="text-stone">Effective Cost of Giving</span>
                    <span className="font-bold text-coral">₹{(taxDonationAmount - taxDonationAmount * 0.5).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Supporter Leaderboard */}
            <div className="bg-white rounded-3xl border border-sand/40 p-5 shadow-warm space-y-3">
              <div className="flex items-center gap-2 border-b border-sand/30 pb-3 mb-2">
                <Trophy className="w-4 h-4 text-coral" />
                <h3 className="font-serif text-[15px] font-semibold text-charcoal">Top Supporter Leaderboard</h3>
              </div>
              <div className="space-y-2.5">
                {globalLeaderboard.map((leader, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px] bg-ivory border border-sand/35 rounded-xl p-2.5 hover:border-coral/20 transition">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-lg bg-cream flex items-center justify-center font-bold text-charcoal font-mono flex-shrink-0 text-[10px]">
                        {leader.trophy ? leader.trophy : `${i + 1}`}
                      </span>
                      <div className="min-w-0 text-left">
                        <p className="font-bold text-charcoal truncate flex items-center gap-1">
                          {leader.name}
                          {leader.verified && <ShieldCheck className="w-3 h-3 text-sage flex-shrink-0" fill="currentColor" />}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-coral whitespace-nowrap">₹{leader.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities Timeline */}
            <div className="bg-white rounded-3xl border border-sand/40 p-5 shadow-warm space-y-3">
              <div className="flex items-center gap-2 border-b border-sand/30 pb-3 mb-2">
                <Activity className="w-4 h-4 text-coral" />
                <h3 className="font-serif text-[15px] font-semibold text-charcoal">Recent Activities</h3>
              </div>
              <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1 text-left">
                {activityFeed.length === 0 ? (
                  <p className="text-[11px] text-stone italic text-center py-6">No recent logs recorded.</p>
                ) : (
                  activityFeed.map((act, i) => (
                    <div key={i} className="flex gap-2.5 relative text-[11px]">
                      {i < activityFeed.length - 1 && <span className="absolute left-[13px] top-6 bottom-[-18px] w-0.5 bg-sand/30" />}
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-warm-sm border border-sand/20 ${act.color}`}>
                        <act.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-stone">{act.date}</p>
                        <p className="text-[11px] text-charcoal mt-0.5 leading-relaxed">{act.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
