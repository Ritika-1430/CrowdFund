import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { fundApi, donationApi } from '../services/api';
import { Fund } from '../types';
import { useAuth } from '../hooks/useAuth';
import { categoryKits, kitImageSrc } from '../utils/donationKits';
import { fundPhotoUrls, fallbackFundImage } from '../utils/fundImages';
import { motion } from 'framer-motion';
import { Heart, ChevronLeft, Shield, Download, ArrowRight, MessageCircle, Plus, Minus, Copy, Check, Share2, Award, Search, X } from 'lucide-react';
import { kitCustomizableItems } from '../utils/kitCustomizerData';
import confetti from 'canvas-confetti';

const getDonationImpact = (amount: number, category: string): { text: string; detail: string } => {
  if (amount <= 0) return { text: "Kind Supporter", detail: "Every single rupee counts towards making a difference." };
  
  const cat = category.toLowerCase();
  if (cat.includes('orphanage') || cat.includes('child')) {
    if (amount < 500) return { text: "Daily Healthy Nutrition", detail: `covers daily fresh fruits and warm healthy snacks for 1 orphan child.` };
    if (amount < 1500) return { text: "Weekly Full Meals", detail: `provides full nutritious meals for 2 orphan children for an entire week.` };
    if (amount < 4000) return { text: "School Education Kit", detail: `supplies comprehensive education kits (school bags, books, uniforms) for 3 children.` };
    return { text: "6-Month Sponsorship", detail: `fully sponsors educational materials & primary healthcare for a child for 6 months.` };
  }
  if (cat.includes('old age') || cat.includes('elder')) {
    if (amount < 500) return { text: "Elder Care Toiletries", detail: `buys essential daily hygiene kits, soaps, and soft pillows for an elderly resident.` };
    if (amount < 1500) return { text: "Medical Health Checkups", detail: `covers primary diagnostic tests, specialist consultations, and monthly medicines for 2 senior citizens.` };
    if (amount < 4000) return { text: "Winter Warmth Packet", detail: `supplies heavy winter blankets, thermal wear, and sweaters for 4 elders.` };
    return { text: "3-Month Eldercare Support", detail: `sponsors comprehensive daily nutritious diet and medical care for an elder for 3 months.` };
  }
  if (cat.includes('medical') || cat.includes('healthcare')) {
    if (amount < 500) return { text: "Basic Medical Supplies", detail: `covers sterile bandages, sanitizers, and initial symptom checks.` };
    if (amount < 1500) return { text: "Post-op Medications", detail: `purchases essential post-surgery medications and pain relievers.` };
    if (amount < 4000) return { text: "Specialist Diagnostics", detail: `covers critical MRI/CT scans or professional pediatric consultations.` };
    return { text: "Critical ICU Support", detail: `directly funds critical intensive care unit (ICU) support and emergency procedures.` };
  }
  if (cat.includes('disability') || cat.includes('physical')) {
    if (amount < 500) return { text: "Custom Support Braces", detail: `provides wrist/arm supports, orthotic braces, or pair of crutches.` };
    if (amount < 1500) return { text: "Mobility Assistance Kit", detail: `covers customized helper kits for blind or hearing impaired beneficiaries.` };
    if (amount < 4000) return { text: "Folding Wheelchair", detail: `purchases a high-quality, lightweight folding wheelchair for mobility.` };
    return { text: "Prosthetic Fitment & Rehab", detail: `funds custom prosthetic limb adjustments and rehabilitation physical therapy.` };
  }
  if (cat.includes('women') || cat.includes('maternity')) {
    if (amount < 500) return { text: "Hygiene & Vitamin Kits", detail: `supplies sanitary kits and critical maternal prenatal vitamins.` };
    if (amount < 1500) return { text: "Prenatal Consultations", detail: `covers critical prenatal ultrasound scans and specialized consultations.` };
    if (amount < 4000) return { text: "Safe Maternal Delivery Kit", detail: `provides hygienic delivery kits and critical newborn care setups.` };
    return { text: "Complete Maternity Coverage", detail: `fully covers safe delivery costs and post-natal care for the mother and child.` };
  }
  // Default/Disaster & Emergency Relief
  if (amount < 500) return { text: "Clean Water & Rations", detail: `provides clean drinking water bottles and dry grains for a family.` };
  if (amount < 1500) return { text: "Family Hygiene Package", detail: `covers a family hygiene kit containing soap, sanitizers, and antiseptic.` };
  if (amount < 4000) return { text: "Emergency Shelter Tarps", detail: `supplies heavy-duty waterproof tarpaulins and blankets for shelter.` };
  return { text: "Family Relief Toolkit", detail: `supplies complete clothing, food rations, and medical relief pack for 2 families.` };
};

const Donate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [fund, setFund] = useState<Fund | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [donorName, setDonorName] = useState(user?.name || '');
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [request80G, setRequest80G] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [panError, setPanError] = useState('');
  const [copiedShareText, setCopiedShareText] = useState(false);

  // Advanced features states
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'card' | 'web3'>('card');
  const [web3Address, setWeb3Address] = useState('');
  const [connectingWeb3, setConnectingWeb3] = useState(false);

  // UPI Payment states
  const [selectedSubMethod, setSelectedSubMethod] = useState<'card' | 'upi'>('card');
  const [upiProvider, setUpiProvider] = useState<'phonepe' | 'gpay' | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [upiMessage, setUpiMessage] = useState('');

  // Credit/Debit Card states
  const [cardPayerName, setCardPayerName] = useState(user?.name || '');
  const [cardEmail, setCardEmail] = useState(user?.email || '');
  const [cardMobile, setCardMobile] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // SecurePay simulated states
  const [showSecurePayCheckout, setShowSecurePayCheckout] = useState(false);
  const [securePayTxId, setSecurePayTxId] = useState('');
  const [securePayOrderId, setSecurePayOrderId] = useState('');
  const [showBillModal, setShowBillModal] = useState(false);
  const [securePayLoading, setSecurePayLoading] = useState(false);
  const [securePaySignature, setSecurePaySignature] = useState('');
  const [securePayTimestamp, setSecurePayTimestamp] = useState('');
  const [securePayVerifyStatus, setSecurePayVerifyStatus] = useState('');

  const handleConnectWeb3 = () => {
    setConnectingWeb3(true);
    setTimeout(() => {
      setWeb3Address('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
      setConnectingWeb3(false);
      confetti({ particleCount: 40, spread: 40 });
    }, 1000);
  };

  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customizingKitId, setCustomizingKitId] = useState<string | null>(null);
  const [customizingKitName, setCustomizingKitName] = useState('');
  const [customizingKitItems, setCustomizingKitItems] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [customizerSearch, setCustomizerSearch] = useState('');
  const [customKits, setCustomKits] = useState<Record<string, { basePrice: number; addedItems: { name: string; price: number; qty: number }[] }>>({});

  useEffect(() => {
    if (id) {
      fundApi.get(id).then(r => setFund(r.data.fund)).catch(() => navigate('/explore')).finally(() => setLoading(false));
    }
  }, [id, navigate]);

  useEffect(() => {
    const kit = searchParams.get('kit');
    if (kit) { setCart({ [kit]: 1 }); setCustomAmount(''); }
  }, [searchParams]);

  if (loading) return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!fund) return null;

  const kits = categoryKits[fund.category] || { items: [], bannerQuery: fund.title };
  const fundImage = fundPhotoUrls(fund)[0];

  const addToCart = (kitId: string) => { setCustomAmount(''); setCart(prev => ({ ...prev, [kitId]: (prev[kitId] || 0) + 1 })); };
  const removeFromCart = (kitId: string) => {
    setCart(prev => { const n = { ...prev }; if (n[kitId] > 1) n[kitId]--; else delete n[kitId]; return n; });
  };

  const kitTotal = Object.entries(cart).reduce((sum, [kitId, qty]) => {
    const kit = kits.items.find((i: any) => i.id === kitId);
    if (!kit) return sum;
    const customInfo = customKits[kitId];
    const unitPrice = customInfo ? customInfo.basePrice + customInfo.addedItems.reduce((s, item) => s + item.price * item.qty, 0) : kit.unitPrice;
    return sum + unitPrice * qty;
  }, 0);

  const totalAmount = customAmount ? parseInt(customAmount) : kitTotal;

  const validatePAN = (pan: string) => {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan) return 'PAN Card number is required for 80G tax benefits';
    if (!regex.test(pan.toUpperCase())) return 'Invalid PAN Card format (expected e.g. ABCDE1234F)';
    return '';
  };

  const handleDonate = async () => {
    if (!id || totalAmount <= 0) return;
    if (request80G) {
      const err = validatePAN(panNumber);
      if (err) {
        setPanError(err);
        return;
      }
    }

    if (paymentMode === 'card') {
      if (selectedSubMethod === 'card') {
        if (!cardPayerName.trim()) {
          setError('Payer Name is required for card payments');
          return;
        }
        if (!cardEmail.trim()) {
          setError('Email ID is required for card payments');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardEmail)) {
          setError('Please enter a valid email address');
          return;
        }
        if (!cardMobile.trim()) {
          setError('Mobile Number is required for card payments');
          return;
        }
        if (!/^\d{10}$/.test(cardMobile.replace(/[-\s]/g, ''))) {
          setError('Please enter a valid 10-digit mobile number');
          return;
        }
        if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
          setError('Please enter a valid 16-digit card number');
          return;
        }
        if (!cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
          setError('Please enter card expiry in MM/YY format');
          return;
        }
        if (!cardCvv.trim() || cardCvv.length < 3) {
          setError('Please enter a valid 3-digit CVV');
          return;
        }
      } else if (selectedSubMethod === 'upi') {
        if (!upiProvider) {
          setError('Please select a UPI app (PhonePe or GPay) to continue');
          return;
        }
      }

      setError('');
      setSecurePayLoading(true);
      setShowSecurePayCheckout(true);

      try {
        // Call backend API to initiate custom secure transaction token signature
        const response = await donationApi.initiateSecurePay({
          fundId: id,
          amount: totalAmount,
        });

        const { orderId, signature, timestamp } = response.data;
        setSecurePayOrderId(orderId);
        setSecurePaySignature(signature);
        setSecurePayTimestamp(timestamp);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to initiate secure checkout session');
        setShowSecurePayCheckout(false);
      } finally {
        setSecurePayLoading(false);
      }
    } else {
      setSubmitting(true);
      setError('');
      try {
        await donationApi.donate({
          fundId: id,
          donorName: isPrivateMode ? 'Private Mode' : (isAnonymous ? 'Anonymous' : (donorName || 'Anonymous')),
          amount: totalAmount,
          comment,
          isAnonymous,
          isPrivateMode,
          matchingPartner: 'Web3 Escrow Partner',
          request80G,
          panNumber: request80G ? panNumber.toUpperCase() : undefined,
        });
        setSuccess(true);
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#E86B4A', '#D4A853', '#7B9E7B'] });
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Donation failed, please try again');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const executeSecurePayPayment = async () => {
    setSecurePayLoading(true);
    setSecurePayVerifyStatus('Initiating secure escrow channel...');
    setError('');

    try {
      // Step 1: Simulated escrow channel verification delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setSecurePayVerifyStatus('Verifying cryptographic server signature...');

      // Step 2: Simulated signature validation delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setSecurePayVerifyStatus('Settling direct bank ledger transfer...');

      // Step 3: Call backend verify endpoint with client payloads
      const finalDonorName = isPrivateMode ? 'Private Mode' : (isAnonymous ? 'Anonymous' : (selectedSubMethod === 'card' ? cardPayerName : (donorName || 'Anonymous')));
      const finalEmail = selectedSubMethod === 'card' ? cardEmail : (user?.email || '');
      const finalMobile = selectedSubMethod === 'card' ? cardMobile : '';

      const verificationPayload = {
        fundId: id!,
        amount: totalAmount,
        orderId: securePayOrderId,
        signature: securePaySignature,
        timestamp: securePayTimestamp,
        donorName: finalDonorName,
        comment,
        isAnonymous,
        isPrivateMode,
        matchingPartner: `SecurePay (${selectedSubMethod === 'upi' ? `UPI: ${upiProvider === 'gpay' ? 'GPay' : 'PhonePe'}` : 'Card'}; Tx: ${securePayOrderId})`,
        request80G,
        panNumber: request80G ? panNumber.toUpperCase() : undefined,
        email: finalEmail || undefined,
        mobile: finalMobile || undefined,
      };

      const response = await donationApi.verifySecurePay(verificationPayload);
      const { donation } = response.data;
      setSecurePayTxId(donation.metadata?.cryptographicProofHash?.substring(0, 16).toUpperCase() || 'TX_UNKNOWN');

      // Step 4: Complete flow
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowSecurePayCheckout(false);
      setSuccess(true);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#E86B4A', '#D4A853', '#7B9E7B'] });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'SecurePay verification session failed');
      setShowSecurePayCheckout(false);
    } finally {
      setSecurePayLoading(false);
      setSecurePayVerifyStatus('');
    }
  };





  const openCustomizer = (kitId: string, kitName: string, basePrice: number) => {
    setCustomizingKitId(kitId);
    setCustomizingKitName(kitName);
    const existing = customKits[kitId];
    if (existing) {
      setCustomizingKitItems(existing.addedItems);
    } else {
      setCustomizingKitItems([]);
    }
    setCustomizerSearch('');
    setCustomizerOpen(true);
  };

  const addItemToCustomization = (name: string, price: number) => {
    setCustomizingKitItems(prev => {
      const idx = prev.findIndex(item => item.name === name);
      if (idx > -1) {
        const n = [...prev];
        n[idx] = { ...n[idx], qty: n[idx].qty + 1 };
        return n;
      }
      return [...prev, { name, price, qty: 1 }];
    });
  };

  const removeCustomizationItem = (name: string) => {
    setCustomizingKitItems(prev => {
      const idx = prev.findIndex(item => item.name === name);
      if (idx > -1) {
        const n = [...prev];
        if (n[idx].qty > 1) {
          n[idx] = { ...n[idx], qty: n[idx].qty - 1 };
          return n;
        } else {
          return n.filter(item => item.name !== name);
        }
      }
      return prev;
    });
  };

  const saveCustomization = (basePrice: number) => {
    if (!customizingKitId) return;
    setCustomKits(prev => ({
      ...prev,
      [customizingKitId]: {
        basePrice,
        addedItems: customizingKitItems
      }
    }));
    setCart(prev => {
      if (!prev[customizingKitId]) {
        return { ...prev, [customizingKitId]: 1 };
      }
      return prev;
    });
    setCustomizerOpen(false);
  };

  const downloadReceipt = () => {
    const taxExemptionBlock = request80G ? `
--------------------------------------------------
TAX EXEMPTION BENEFIT: CLAIMED (SECTION 80G)
Donor PAN: ${panNumber}
Eligible Deduction: 50% of Donation amount under 80G.
This document serves as temporary proof of donation.
CrowdFund 80G Registration: AAATC8472MDF20234
` : '';

    const text = `
==================================================
               CROWDFUND DONATION RECEIPT
==================================================
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
Transaction ID: CF-${Math.floor(10000000 + Math.random() * 90000000)}
Status: SUCCESSFUL
--------------------------------------------------
Campaign: ${fund.title}
Category: ${fund.category}
Donor: ${isAnonymous ? 'Anonymous' : (donorName || 'Kind Supporter')}
Amount: INR ${totalAmount.toLocaleString('en-IN')}
Message: "${comment || 'No message'}"${taxExemptionBlock}
--------------------------------------------------
Thank you for your generosity!
==================================================`.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crowdfund-receipt-${fund._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Success State
  if (success) {
    const sharePitch = `I just supported the campaign "${fund.title}" on CrowdFund. Every contribution counts! Join me in making a difference: ${window.location.origin}/funds/${fund._id}`;

    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white border border-sand/40 rounded-3xl shadow-warm-lg p-8 text-center">
          <div className="w-16 h-16 bg-sage/10 rounded-2xl flex items-center justify-center text-sage-dark mx-auto mb-6 border border-sage/20">
            <Heart className="w-8 h-8" fill="currentColor" />
          </div>
          <h2 className="text-[28px] font-serif text-charcoal mb-2">Thank You!</h2>
          <p className="text-stone text-[14px] leading-relaxed mb-2">
            Your generous contribution of <span className="font-bold text-coral text-[16px]">₹{totalAmount.toLocaleString('en-IN')}</span> has been recorded.
          </p>
          <p className="text-stone text-[13px] mb-6">Campaign: <span className="font-medium text-charcoal">{fund.title}</span></p>

          <div className="bg-ivory rounded-2xl border border-sand/40 p-4 text-left text-[12px] space-y-1.5 mb-6">
            <div className="flex justify-between"><span className="text-stone">Donor</span><span className="text-charcoal font-medium">{isAnonymous ? 'Anonymous' : donorName}</span></div>
            <div className="flex justify-between"><span className="text-stone">Amount</span><span className="text-coral font-bold">₹{totalAmount.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-stone">Date</span><span className="text-charcoal">{new Date().toLocaleDateString('en-IN')}</span></div>
            {request80G && (
              <div className="flex justify-between border-t border-sand/30 pt-1.5 mt-1">
                <span className="text-sage font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> 80G Exemption
                </span>
                <span className="text-charcoal font-semibold">{panNumber}</span>
              </div>
            )}
          </div>

          {/* Share Toolkit */}
          <div className="bg-cream rounded-2xl border border-sand/40 p-5 text-left mb-6 space-y-4">
            <h3 className="text-[12px] font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-coral" />
              Spread the Word
            </h3>
            <p className="text-[11px] text-stone">Sharing this campaign can double the support it receives!</p>
            <div className="flex gap-2">
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(sharePitch)}`} target="_blank" rel="noreferrer"
                className="flex-1 py-2 bg-[#25D366] text-white text-[11px] font-bold rounded-lg text-center shadow-warm-sm hover:opacity-90 transition">
                WhatsApp
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(sharePitch)}`} target="_blank" rel="noreferrer"
                className="flex-1 py-2 bg-[#1DA1F2] text-white text-[11px] font-bold rounded-lg text-center shadow-warm-sm hover:opacity-90 transition">
                Twitter / X
              </a>
              <a href={`mailto:?subject=${encodeURIComponent(`Supporting: ${fund.title}`)}&body=${encodeURIComponent(sharePitch)}`}
                className="flex-1 py-2 bg-stone text-white text-[11px] font-bold rounded-lg text-center shadow-warm-sm hover:opacity-90 transition">
                Email
              </a>
            </div>
            <button onClick={() => {
              navigator.clipboard.writeText(sharePitch);
              setCopiedShareText(true);
              setTimeout(() => setCopiedShareText(false), 2000);
            }} className="w-full py-2 bg-white border border-sand text-charcoal rounded-lg font-semibold text-[11px] hover:bg-cream transition flex items-center justify-center gap-1.5">
              {copiedShareText ? (
                <><Check className="w-3.5 h-3.5 text-sage-dark" /> Copied link!</>
              ) : (
                <><Copy className="w-3.5 h-3.5 text-stone" /> Copy Pitch & Link</>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <button onClick={() => setShowBillModal(true)}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-[14px] shadow-warm flex items-center justify-center gap-2 transition active:scale-[0.98]">
              <Award className="w-4.5 h-4.5" /> View SecurePay Bill / Receipt
            </button>
            <button onClick={downloadReceipt}
              className="w-full py-3 bg-ivory border border-sand text-charcoal rounded-xl font-semibold text-[13px] hover:bg-cream transition flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Text Receipt
            </button>
            <button onClick={() => navigate('/explore')}
              className="w-full py-3.5 bg-coral text-white rounded-xl font-bold text-[14px] shadow-warm hover:bg-terracotta transition flex items-center justify-center gap-2">
              Explore More Campaigns <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ── Designed SecurePay Bill / Receipt Modal (Rendered inside early success block) ── */}
        {showBillModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white text-charcoal w-full max-w-2xl rounded-3xl shadow-warm-2xl border border-sand/40 p-6 sm:p-8 flex flex-col relative my-8"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowBillModal(false)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-ivory border border-sand flex items-center justify-center text-stone hover:text-coral transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Invoice Header */}
              <div className="border-b border-sand/50 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                <div>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-extrabold px-2.5 py-0.5 rounded tracking-wide uppercase border border-teal-200">SecurePay Ledger Success</span>
                  <h2 className="text-2xl font-serif text-charcoal mt-2 font-black">Escrow Payment Receipt</h2>
                  <p className="text-[11px] text-stone mt-0.5">Audited & signed by SecurePay Direct Ledger Node</p>
                </div>
                <div className="text-left sm:text-right text-[12px] text-stone">
                  <div><span className="font-bold text-charcoal">Order Ref:</span> {securePayOrderId || 'N/A'}</div>
                  <div><span className="font-bold text-charcoal">Checksum Signature:</span> <span className="font-mono text-[10px] bg-ivory p-0.5 border border-sand/30 rounded text-stone">{securePaySignature?.substring(0, 16) || 'N/A'}...</span></div>
                  <div><span className="font-bold text-charcoal">Payment Lock ID:</span> LP-{securePayTxId || 'N/A'}</div>
                  <div><span className="font-bold text-charcoal">Timestamp:</span> {new Date(parseInt(securePayTimestamp) || Date.now()).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Payout Routing Visual Grid */}
              <div className="mb-6 text-left">
                <span className="text-[10px] font-bold text-stone uppercase tracking-wider block mb-2">Fund Routing Verification Path</span>
                <div className="bg-ivory border border-sand/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="text-center sm:text-left bg-white px-3 py-2 rounded-xl border border-sand/20 flex-1 w-full">
                    <span className="text-[9px] text-stone font-bold uppercase tracking-wider">Source (Donor Account)</span>
                    <p className="font-semibold text-charcoal truncate mt-0.5">{selectedSubMethod === 'card' ? cardPayerName : donorName || 'Kind Supporter'}</p>
                  </div>
                  
                  <div className="text-teal-600 font-bold flex flex-col items-center flex-shrink-0">
                    <Shield className="w-5 h-5 animate-pulse" />
                    <span className="text-[8px] uppercase tracking-widest mt-0.5">SecurePay Hub</span>
                  </div>

                  <div className="text-center sm:text-right bg-white px-3 py-2 rounded-xl border border-sand/20 flex-1 w-full">
                    <span className="text-[9px] text-teal-600 font-bold uppercase tracking-wider">Destination Payout Route</span>
                    <p className="font-semibold text-teal-900 truncate mt-0.5">
                      {fund.hospitalEscrow && fund.hospitalEscrow.accountNumber
                        ? `${fund.hospitalEscrow.hospitalName} (A/C: ...${fund.hospitalEscrow.accountNumber.slice(-4)})`
                        : `${fund.beneficiary?.name || 'Creator'} (A/C: ...5821)`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing breakdown table */}
              <div className="text-left space-y-4">
                <span className="text-[11px] font-bold text-stone uppercase tracking-wider block">Billing Summary</span>
                <div className="border border-sand/40 rounded-2xl overflow-hidden bg-ivory/50">
                  <table className="w-full text-[12px] border-collapse">
                    <thead>
                      <tr className="bg-cream/70 border-b border-sand/30 text-[10px] font-bold text-stone uppercase tracking-wider">
                        <th className="py-3 px-4 text-left">Item Description</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand/20">
                      <tr>
                        <td className="py-4.5 px-4 font-semibold text-charcoal max-w-[250px] truncate">
                          Donation to campaign: "{fund.title}"
                        </td>
                        <td className="py-4.5 px-4 text-center text-stone">1</td>
                        <td className="py-4.5 px-4 text-right font-medium">₹{totalAmount.toLocaleString('en-IN')}</td>
                        <td className="py-4.5 px-4 text-right font-bold text-charcoal">₹{totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-stone italic">SecurePay Network Payout Cost</td>
                        <td className="py-3 px-4 text-center text-stone">-</td>
                        <td className="py-3 px-4 text-right text-stone">₹0.00</td>
                        <td className="py-3 px-4 text-right text-stone font-medium">₹0.00</td>
                      </tr>
                      <tr className="bg-cream/20">
                        <td className="py-3.5 px-4 text-stone font-medium">Platform Charges (0% Fee)</td>
                        <td className="py-3.5 px-4 text-center text-stone">-</td>
                        <td className="py-3.5 px-4 text-right text-stone">₹0.00</td>
                        <td className="py-3.5 px-4 text-right text-stone font-medium">₹0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Total Calculation Grid */}
                <div className="flex justify-end pt-2">
                  <div className="w-full sm:w-[250px] space-y-2 text-[12px] bg-cream/35 border border-sand/30 p-4.5 rounded-2xl">
                    <div className="flex justify-between"><span className="text-stone">Subtotal</span><span className="font-semibold text-charcoal">₹{totalAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-stone">GST / Service Tax</span><span className="font-semibold text-charcoal">₹0.00</span></div>
                    <div className="border-t border-sand/40 my-2 pt-2 flex justify-between font-bold text-coral text-base">
                      <span>Net Amount Paid</span>
                      <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payer and Tax Exemption Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-sand/40 pt-6 mt-6 text-left">
                <div>
                  <span className="text-[11px] font-bold text-stone uppercase tracking-wider block mb-2">Payer Info</span>
                  <div className="text-[12px] text-stone space-y-1.5 bg-ivory/40 p-4 rounded-2xl border border-sand/20">
                    <div><span className="font-medium text-charcoal">Payer Name:</span> {selectedSubMethod === 'card' ? cardPayerName : donorName || 'Kind Supporter'}</div>
                    <div><span className="font-medium text-charcoal">Email ID:</span> {selectedSubMethod === 'card' ? cardEmail : (user?.email || 'N/A')}</div>
                    <div><span className="font-medium text-charcoal">Mobile:</span> {selectedSubMethod === 'card' ? cardMobile : 'N/A'}</div>
                    <div><span className="font-medium text-charcoal">Payment Mode:</span> {selectedSubMethod === 'upi' ? `SecurePay UPI Direct` : 'SecurePay Card Direct'}</div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone uppercase tracking-wider block mb-2">Tax Exemption Summary</span>
                  <div className="text-[12px] text-stone space-y-1.5 bg-ivory/40 p-4 rounded-2xl border border-sand/20">
                    <div><span className="font-medium text-charcoal">Exemption Eligible:</span> {request80G ? 'Yes (Section 80G)' : 'No'}</div>
                    {request80G ? (
                      <>
                        <div><span className="font-medium text-charcoal">Donor PAN:</span> <span className="uppercase font-semibold text-charcoal">{panNumber}</span></div>
                        <div><span className="font-medium text-charcoal">Exemption Allowed (50%):</span> <span className="font-bold text-sage-dark">₹{(totalAmount * 0.5).toLocaleString('en-IN')}</span></div>
                      </>
                    ) : (
                      <div className="text-stone italic text-[11px] leading-relaxed">Tax exemption benefit (80G deduction) was not claimed for this transaction.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer compliance & printing buttons */}
              <div className="border-t border-sand/40 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-stone text-center sm:text-left">
                  <Shield className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 animate-pulse" />
                  <span>Digitally signed ledger receipt. Cryptographic verification hash: {securePayTxId}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-charcoal hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Print Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBillModal(false)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-ivory border border-sand text-charcoal text-xs font-bold rounded-xl hover:bg-cream transition cursor-pointer"
                  >
                    Close Bill
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  const presetAmounts = [100, 500, 1000, 2500, 5000];

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Back Bar */}
      <div className="bg-white border-b border-sand/50 px-5 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(`/funds/${id}`)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone hover:text-charcoal transition">
            <ChevronLeft className="w-4 h-4" /> Back to Campaign
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left — Campaign Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-sand/40 shadow-warm-sm overflow-hidden sticky top-[88px]">
              <img src={fundImage} alt={fund.title} className="w-full h-40 object-cover"
                onError={e => { (e.target as HTMLImageElement).src = fallbackFundImage(fund.category); }} />
              <div className="p-5">
                <h3 className="font-serif text-lg text-charcoal mb-1">{fund.title}</h3>
                <p className="text-[12px] text-stone mb-3">{fund.category}</p>
                <div className="w-full bg-sand/40 rounded-full h-1.5 mb-2">
                  <div className="bg-coral h-1.5 rounded-full" style={{ width: `${Math.min(100, (fund.amountCollected / fund.targetAmount) * 100)}%` }} />
                </div>
                <p className="text-[12px] text-stone">₹{fund.amountCollected.toLocaleString('en-IN')} raised of ₹{fund.targetAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Right — Donation Form */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-[28px] font-serif text-charcoal mb-1">Make a Donation</h1>
              <p className="text-stone text-[14px]">Choose an amount or select a donation kit below.</p>
            </div>

            {/* Quick Amount Presets */}
            <div className="bg-white rounded-2xl border border-sand/40 shadow-warm-sm p-6">
              <h3 className="text-[13px] font-semibold text-charcoal mb-4">Choose Amount</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {presetAmounts.map(amt => (
                  <button key={amt} onClick={() => { setCustomAmount(String(amt)); setCart({}); }}
                    className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition ${
                      customAmount === String(amt) ? 'bg-coral text-white border-coral shadow-warm-sm' : 'bg-ivory border-sand text-charcoal hover:border-coral/30'
                    }`}>
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-semibold text-charcoal">₹</span>
                <input type="number" placeholder="Enter custom amount" value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setCart({}); }}
                  className="flex-1 px-4 py-3 bg-ivory border border-sand rounded-xl text-[14px] text-charcoal placeholder-stone/40 transition" />
              </div>

              {/* Payment Gateway Mode Selector */}
              <div className="border-t border-sand/30 pt-4 mt-4 space-y-3">
                <span className="block text-[12px] font-semibold text-charcoal text-left">Select Payment Network</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setPaymentMode('card'); setSelectedSubMethod('card'); }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      paymentMode === 'card'
                        ? 'bg-coral text-white border-coral shadow-warm-sm'
                        : 'bg-white border-sand text-stone hover:border-coral/20'
                    }`}
                  >
                    UPI / Cards (INR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('web3')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      paymentMode === 'web3'
                        ? 'bg-coral text-white border-coral shadow-warm-sm'
                        : 'bg-white border-sand text-stone hover:border-coral/20'
                    }`}
                  >
                    Web3 Wallet (USDC/ETH)
                  </button>
                </div>

                {paymentMode === 'card' && (
                  <div className="mt-4 pt-3 border-t border-sand/20 text-left space-y-3 animate-fade-in">
                    <span className="block text-[12px] font-semibold text-charcoal">Select Payment Method</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => { setSelectedSubMethod('card'); setUpiProvider(null); }}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                          selectedSubMethod === 'card'
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-white border-sand text-stone hover:border-charcoal/20'
                        }`}
                      >
                        Credit / Debit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubMethod('upi')}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                          selectedSubMethod === 'upi'
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-white border-sand text-stone hover:border-charcoal/20'
                        }`}
                      >
                        UPI (Instant QR)
                      </button>
                    </div>

                    {selectedSubMethod === 'card' && (
                      <div className="mt-4 pt-3 border-t border-sand/20 space-y-3 animate-fade-in text-left">
                        <span className="block text-[11px] font-bold text-stone uppercase tracking-wider">Cardholder & Contact Details</span>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-charcoal mb-1">Payer Name</label>
                            <input
                              type="text"
                              placeholder="Name of Payer"
                              value={cardPayerName}
                              onChange={e => setCardPayerName(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-ivory border border-sand rounded-xl text-xs text-charcoal placeholder-stone/40 transition focus:border-coral focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-charcoal mb-1">Email ID</label>
                              <input
                                type="email"
                                placeholder="email@example.com"
                                value={cardEmail}
                                onChange={e => setCardEmail(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-ivory border border-sand rounded-xl text-xs text-charcoal placeholder-stone/40 transition focus:border-coral focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-charcoal mb-1">Mobile Number</label>
                              <input
                                type="tel"
                                placeholder="10-digit mobile number"
                                value={cardMobile}
                                onChange={e => setCardMobile(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-ivory border border-sand rounded-xl text-xs text-charcoal placeholder-stone/40 transition focus:border-coral focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <span className="block text-[11px] font-bold text-stone uppercase tracking-wider pt-2">Card Details</span>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-charcoal mb-1">Card Number</label>
                            <input
                              type="text"
                              maxLength={19}
                              placeholder="4111 2222 3333 4444"
                              value={cardNumber}
                              onChange={e => {
                                const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                const matches = v.match(/\d{4,16}/g);
                                const match = (matches && matches[0]) || '';
                                const parts = [];
                                for (let i = 0, len = match.length; i < len; i += 4) {
                                  parts.push(match.substring(i, i + 4));
                                }
                                if (parts.length > 0) {
                                  setCardNumber(parts.join(' '));
                                } else {
                                  setCardNumber(v);
                                }
                              }}
                              className="w-full px-3.5 py-2.5 bg-ivory border border-sand rounded-xl text-xs font-mono text-charcoal placeholder-stone/40 transition focus:border-coral focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-charcoal mb-1">Expiry Date</label>
                              <input
                                type="text"
                                maxLength={5}
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={e => {
                                  const v = e.target.value.replace(/[^0-9]/g, '');
                                  if (v.length >= 2) {
                                    setCardExpiry(v.substring(0, 2) + '/' + v.substring(2, 4));
                                  } else {
                                    setCardExpiry(v);
                                  }
                                }}
                                className="w-full px-3.5 py-2.5 bg-ivory border border-sand rounded-xl text-xs font-mono text-charcoal placeholder-stone/40 transition focus:border-coral focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-charcoal mb-1">CVV</label>
                              <input
                                type="password"
                                maxLength={3}
                                placeholder="***"
                                value={cardCvv}
                                onChange={e => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full px-3.5 py-2.5 bg-ivory border border-sand rounded-xl text-xs font-mono text-charcoal placeholder-stone/40 transition focus:border-coral focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedSubMethod === 'upi' && (
                      <div className="mt-4 pt-3 border-t border-sand/20 space-y-3 animate-fade-in">
                        <span className="block text-[11px] font-bold text-stone uppercase tracking-wider">Select UPI App</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setUpiProvider('phonepe')}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
                              upiProvider === 'phonepe'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-warm-sm'
                                : 'bg-white border-sand text-stone hover:border-indigo-600/30'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            PhonePe
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpiProvider('gpay')}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
                              upiProvider === 'gpay'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-warm-sm'
                                : 'bg-white border-sand text-stone hover:border-blue-600/30'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            GPay
                          </button>
                        </div>

                        {upiProvider && (
                          <div className="mt-4 bg-cream/50 border border-sand/40 rounded-2xl p-5 flex flex-col items-center text-center space-y-4 animate-fade-in">
                            <div className="text-center">
                              <span className="text-[10px] font-bold text-coral uppercase tracking-widest">
                                Scan & Pay via {upiProvider === 'phonepe' ? 'PhonePe' : 'Google Pay (GPay)'}
                              </span>
                              <p className="text-[11px] text-stone mt-1">Open your UPI app, scan the QR code below, and make the payment.</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-sand/30 shadow-warm-md max-w-[210px] w-full relative">
                              <img
                                src="/upi-qr.jpg"
                                alt="UPI QR Code"
                                className="w-full h-auto object-contain rounded-xl"
                              />
                            </div>
                            <div className="w-full text-xs space-y-1 text-center">
                              <span className="text-stone text-[11px]">UPI ID:</span>
                              <div className="flex items-center justify-between gap-1.5 font-mono bg-white px-3.5 py-2 rounded-xl border border-sand/30 max-w-[250px] mx-auto">
                                <span className="truncate text-charcoal font-semibold">ritikasoni222006-1@oksbi</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('ritikasoni222006-1@oksbi');
                                    setCopiedUpi(true);
                                    setTimeout(() => setCopiedUpi(false), 2000);
                                  }}
                                  className="text-stone hover:text-coral transition flex-shrink-0 cursor-pointer"
                                >
                                  {copiedUpi ? <Check className="w-4 h-4 text-sage-dark" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {paymentMode === 'web3' && (
                  <div className="bg-cream/40 p-4 rounded-xl border border-sand/40 space-y-3 animate-fade-in text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone">Web3 Provider Status:</span>
                      <span className={`font-bold uppercase ${web3Address ? 'text-sage-dark' : 'text-amber-800'}`}>
                        {web3Address ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    {web3Address ? (
                      <p className="text-[10px] font-mono bg-white p-2 rounded-lg border border-sand/20 truncate text-stone">
                        Address: {web3Address}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectWeb3}
                        disabled={connectingWeb3}
                        className="w-full py-2 bg-charcoal hover:bg-black text-white text-xs font-bold rounded-xl shadow-warm-sm transition active:scale-95"
                      >
                        {connectingWeb3 ? 'Connecting Web3 Provider...' : 'Connect MetaMask Wallet'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Impact Calculator Widget */}
            {totalAmount > 0 && (
              <div className="bg-white border border-sand/40 rounded-2xl p-5 shadow-warm-sm animate-fade-in flex items-start gap-4">
                <div className="w-10 h-10 bg-coral/10 rounded-xl flex items-center justify-center text-coral flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-coral uppercase tracking-wider">Your Contribution Impact</span>
                  <h4 className="font-serif text-[18px] text-charcoal leading-snug mt-0.5 mb-1">
                    {getDonationImpact(totalAmount, fund.category).text}
                  </h4>
                  <p className="text-[13px] text-stone leading-relaxed">
                    Your donation of ₹{totalAmount.toLocaleString('en-IN')} {getDonationImpact(totalAmount, fund.category).detail}
                  </p>
                </div>
              </div>
            )}

            {/* Kit Selection */}
            {kits.items.length > 0 && (
              <div className="bg-white rounded-2xl border border-sand/40 shadow-warm-sm p-6">
                <h3 className="text-[13px] font-semibold text-charcoal mb-4">Or Select Donation Kits</h3>
                <div className="space-y-3">
                  {kits.items.map((kit: any) => {
                    const customInfo = customKits[kit.id];
                    const hasCustom = customInfo && customInfo.addedItems.length > 0;
                    const unitPrice = customInfo
                      ? customInfo.basePrice + customInfo.addedItems.reduce((s, item) => s + item.price * item.qty, 0)
                      : kit.unitPrice;

                    return (
                      <div key={kit.id} className="flex items-center gap-4 bg-ivory rounded-xl p-3 border border-sand/40">
                        <img src={kitImageSrc(kit)} alt={kit.name} className="w-14 h-14 rounded-xl object-cover bg-cream"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-charcoal truncate">{kit.name}</p>
                          <p className="text-[12px] text-coral font-bold flex items-center gap-1.5 flex-wrap">
                            ₹{unitPrice.toLocaleString('en-IN')}
                            {hasCustom && (
                              <span className="text-[9px] font-bold text-sage-dark bg-sage/10 px-1.5 py-0.5 rounded border border-sage/20 uppercase tracking-wide">
                                Customized
                              </span>
                            )}
                          </p>
                          <button
                            type="button"
                            onClick={() => openCustomizer(kit.id, kit.name, kit.unitPrice)}
                            className="text-[11px] text-stone hover:text-coral transition font-medium mt-1 flex items-center gap-1 cursor-pointer"
                          >
                            ⚙ Customize Items
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {cart[kit.id] && (
                            <button onClick={() => removeFromCart(kit.id)} className="w-7 h-7 rounded-lg bg-white border border-sand flex items-center justify-center text-stone hover:text-coral transition">
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                          <span className="text-[13px] font-bold text-charcoal w-5 text-center">{cart[kit.id] || 0}</span>
                          <button onClick={() => addToCart(kit.id)} className="w-7 h-7 rounded-lg bg-coral text-white flex items-center justify-center hover:bg-terracotta transition">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Donor Info */}
            <div className="bg-white rounded-2xl border border-sand/40 shadow-warm-sm p-6 space-y-4">
              <h3 className="text-[13px] font-semibold text-charcoal">Your Details</h3>
              <div>
                <label className="block text-[12px] font-semibold text-charcoal mb-1.5">Name</label>
                <input type="text" placeholder="Your name" value={donorName} onChange={e => setDonorName(e.target.value)} disabled={isAnonymous}
                  className="w-full px-4 py-3 bg-ivory border border-sand rounded-xl text-[14px] text-charcoal placeholder-stone/40 disabled:opacity-40 transition" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-sand text-coral focus:ring-coral accent-coral" />
                <span className="text-[13px] text-charcoal">Donate anonymously</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer mt-2">
                <input type="checkbox" checked={isPrivateMode} onChange={e => setIsPrivateMode(e.target.checked)}
                  className="w-4 h-4 rounded border-sand text-coral focus:ring-coral accent-coral" />
                <div className="text-left">
                  <span className="text-[13px] text-charcoal font-semibold">Zero-Trace Privacy Mode</span>
                  <p className="text-[10px] text-stone">Encrypts and anonymizes transaction details in the ledger logs</p>
                </div>
              </label>
              <div>
                <label className="block text-[12px] font-semibold text-charcoal mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-stone" /> Leave a message (optional)
                </label>
                <textarea placeholder="Your words of support..." value={comment} onChange={e => setComment(e.target.value)} rows={2}
                  className="w-full px-4 py-3 bg-ivory border border-sand rounded-xl text-[14px] text-charcoal placeholder-stone/40 resize-none transition" />
              </div>
            </div>

            {/* 80G Tax Exemption Card */}
            <div className="bg-white rounded-2xl border border-sand/40 shadow-warm-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-semibold text-charcoal">Tax Exemption (80G)</h3>
                  <p className="text-[11px] text-stone">Claim 50% tax deduction on your donation (India only)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={request80G} onChange={e => { setRequest80G(e.target.checked); setPanError(''); }} className="sr-only peer" />
                  <div className="w-10 h-6 bg-cream peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sand after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coral"></div>
                </label>
              </div>
              {request80G && (
                <div className="animate-fade-in space-y-2">
                  <label className="block text-[12px] font-semibold text-charcoal">PAN Card Number <span className="text-coral">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={panNumber}
                    onChange={e => { setPanNumber(e.target.value.toUpperCase()); setPanError(''); }}
                    className="w-full px-4 py-3 bg-ivory border border-sand rounded-xl text-[14px] text-charcoal placeholder-stone/40 uppercase transition"
                  />
                  {panError ? (
                    <p className="text-[11px] text-coral font-medium">{panError}</p>
                  ) : (
                    <p className="text-[10px] text-stone">Required to file 80G certificate returns with Income Tax Dept.</p>
                  )}
                </div>
              )}
            </div>

            {error && <div className="bg-coral/8 border border-coral/20 rounded-xl p-3 text-coral text-[13px] font-medium">{error}</div>}

            {/* Submit */}
            <div className="bg-white rounded-2xl border border-sand/40 shadow-warm-sm p-6">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-stone text-[13px]">Total Donation</span>
                <span className="text-[24px] font-serif text-coral">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <button onClick={handleDonate} disabled={submitting || totalAmount <= 0}
                className="w-full py-4 bg-coral text-white text-[15px] font-bold rounded-xl shadow-warm-md hover:bg-terracotta disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><Heart className="w-4 h-4" /> Donate ₹{totalAmount.toLocaleString('en-IN')}</>
                )}
              </button>
              <p className="text-[11px] text-stone text-center mt-3 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Secure & transparent — 0% platform fee
              </p>
            </div>
          </div>
        </div>
      {/* ── Kit Customizer Slide-up Drawer/Modal ── */}
      {customizerOpen && customizingKitId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40 backdrop-blur-sm transition-opacity">
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl border border-sand/40 shadow-warm-xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-cream border-b border-sand/40 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold text-coral uppercase tracking-widest">Interactive Customizer</span>
                <h2 className="text-xl font-serif text-charcoal">{customizingKitName} Customization</h2>
              </div>
              <button
                type="button"
                onClick={() => setCustomizerOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-sand flex items-center justify-center text-stone hover:text-coral transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Wrapper */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Left Column — Item Search & Add */}
              <div className="md:col-span-3 space-y-4">
                <div>
                  <h3 className="text-[12px] font-semibold text-charcoal mb-2">Search & Add Specific Items</h3>
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone/50 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search items to add (e.g. Paracetamol, Atta...)"
                      value={customizerSearch}
                      onChange={e => setCustomizerSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-ivory border border-sand rounded-xl text-[13px] text-charcoal placeholder-stone/40 transition"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[40vh] sm:max-h-[30vh] overflow-y-auto pr-1">
                  {(kitCustomizableItems[customizingKitName] || [])
                    .filter(item =>
                      item.name.toLowerCase().includes(customizerSearch.toLowerCase()) ||
                      item.description.toLowerCase().includes(customizerSearch.toLowerCase())
                    )
                    .map((item, i) => (
                      <div key={i} className="bg-ivory border border-sand/40 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-coral/20 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-cream flex-shrink-0 border border-sand/30"
                              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&h=120&fit=crop&auto=format'; }} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-cream flex-shrink-0 border border-sand/30 flex items-center justify-center text-[10px] text-stone">No Image</div>
                          )}
                          <div className="min-w-0 text-left">
                            <p className="text-[13px] font-semibold text-charcoal truncate">{item.name}</p>
                            <p className="text-[11px] text-stone truncate">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-[12px] font-bold text-coral">+₹{item.price}</span>
                          <button
                            type="button"
                            onClick={() => addItemToCustomization(item.name, item.price)}
                            className="px-3 py-1 bg-coral text-white text-[11px] font-bold rounded-lg hover:bg-terracotta transition cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  {(kitCustomizableItems[customizingKitName] || []).length === 0 && (
                    <p className="text-[12px] text-stone italic text-center py-6">No custom items available for this kit type.</p>
                  )}
                </div>
              </div>

              {/* Right Column — Summary & Saved Customizations */}
              <div className="md:col-span-2 bg-cream/55 border border-sand/40 rounded-2xl p-5 flex flex-col max-h-[45vh] md:max-h-none overflow-y-auto">
                <h3 className="text-[12px] font-bold text-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-coral" /> Custom Kit Summary
                </h3>

                <div className="flex-1 space-y-3">
                  <div className="text-[12px] text-stone flex justify-between">
                    <span>Base Kit Price</span>
                    <span className="font-semibold text-charcoal">₹{(kits.items.find((i: any) => i.id === customizingKitId)?.unitPrice || 0).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="border-t border-sand/40 pt-3">
                    <span className="text-[11px] font-bold text-stone uppercase tracking-wider block mb-2">Customized Additions</span>
                    {customizingKitItems.length === 0 ? (
                      <p className="text-[12px] text-stone italic">No additions yet. Search and add items on the left to customize the kit.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-[22vh] md:max-h-[30vh] overflow-y-auto pr-1">
                        {customizingKitItems.map((item, i) => {
                          const itemImg = (kitCustomizableItems[customizingKitName] || []).find(it => it.name === item.name)?.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&h=80&fit=crop&auto=format';
                          return (
                            <div key={i} className="flex items-center justify-between text-[12px] bg-white border border-sand/30 rounded-lg p-2 gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={itemImg} alt={item.name} className="w-8 h-8 rounded object-cover bg-cream flex-shrink-0 border border-sand/20"
                                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&h=80&fit=crop&auto=format'; }} />
                                <div className="min-w-0 text-left">
                                  <p className="font-medium text-charcoal truncate">{item.name}</p>
                                  <p className="text-[10px] text-stone">₹{item.price} each</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => removeCustomizationItem(item.name)}
                                  className="w-5 h-5 bg-cream hover:bg-sand rounded flex items-center justify-center text-charcoal font-bold transition"
                                >
                                  -
                                </button>
                                <span className="font-semibold text-[11px] w-4 text-center">{item.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => addItemToCustomization(item.name, item.price)}
                                  className="w-5 h-5 bg-coral text-white hover:bg-terracotta rounded flex items-center justify-center font-bold transition"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customized Total & Apply */}
                <div className="border-t border-sand/40 pt-4 mt-4 flex-shrink-0">
                  <div className="flex items-baseline justify-between mb-3.5">
                    <span className="text-[12px] text-stone font-semibold">Custom Unit Cost</span>
                    <span className="text-lg font-serif text-coral font-bold">
                      ₹{(
                        (kits.items.find((i: any) => i.id === customizingKitId)?.unitPrice || 0) +
                        customizingKitItems.reduce((s, item) => s + item.price * item.qty, 0)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => saveCustomization(kits.items.find((i: any) => i.id === customizingKitId)?.unitPrice || 0)}
                    className="w-full py-2.5 bg-coral text-white text-[12px] font-bold rounded-xl shadow-warm-sm hover:bg-terracotta transition cursor-pointer"
                  >
                    Apply Customization
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* UPI Verification Overlay Modal */}
      {upiVerifying && (
        <div className="fixed inset-0 bg-charcoal/85 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-warm-2xl border border-sand/40 flex flex-col items-center space-y-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-coral/20 border-t-coral animate-spin" />
              <Heart className="w-6 h-6 text-coral" fill="currentColor" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-serif text-charcoal">UPI Payment Verification</h3>
              <p className="text-[12px] text-stone leading-relaxed">
                Please scan the QR code and complete the payment on your <span className="font-bold text-coral">{upiProvider === 'gpay' ? 'GPay' : 'PhonePe'}</span> app.
              </p>
            </div>
            <div className="bg-ivory py-3 px-4 rounded-xl border border-sand/30 font-mono text-[11px] text-stone w-full flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-coral animate-ping" />
              Status: <span className="font-bold text-coral uppercase tracking-wide">{upiMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SecurePay Custom Checkout Modal Overlay ── */}
      {showSecurePayCheckout && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#030712]/75 backdrop-blur-md animate-fade-in">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0b1b1e] text-slate-100 w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden border border-teal-800/30 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-5 bg-[#061214] border-b border-teal-900/30 flex justify-between items-center text-left">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span className="text-teal-400 font-extrabold tracking-tight text-lg">SecurePay</span>
                <span className="text-[9px] bg-teal-950 text-teal-300 font-bold px-2 py-0.5 rounded tracking-wider uppercase border border-teal-800/30">Direct Escrow</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurePayCheckout(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Merchant info & Amount */}
            <div className="p-6 text-center bg-[#081719] border-b border-teal-900/20">
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-1">Secure Payout Escrow Channel</span>
              <h4 className="text-sm font-semibold text-slate-200 truncate mb-3">{fund.title}</h4>
              <div className="text-[34px] font-black text-white flex items-center justify-center gap-1 font-mono">
                <span className="text-teal-400 font-normal text-xl">₹</span>
                {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Bank Routing Details */}
            <div className="p-6 space-y-4.5 flex-1 text-left">
              <div className="space-y-1.5">
                <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider block">Receiver Bank Account (Payout Target)</span>
                <div className="bg-[#0c2225] p-4 rounded-xl border border-teal-950/40 space-y-2 text-xs">
                  {fund.hospitalEscrow && fund.hospitalEscrow.accountNumber ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Institution:</span>
                        <span className="font-semibold text-slate-200">{fund.hospitalEscrow.hospitalName || 'Escrow Hospital'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Number:</span>
                        <span className="font-mono font-semibold text-slate-200">XXXX XXXX XXXX {fund.hospitalEscrow.accountNumber.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">IFSC Code:</span>
                        <span className="font-mono text-slate-300">{fund.hospitalEscrow.ifscCode || 'IFSC_ESCROW'}</span>
                      </div>
                      <div className="flex justify-between border-t border-teal-900/40 pt-1.5 mt-1.5">
                        <span className="text-slate-400">Payout Mode:</span>
                        <span className="text-teal-400 font-bold uppercase text-[9px] tracking-wide bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-900/30">Direct Hospital Escrow</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Beneficiary:</span>
                        <span className="font-semibold text-slate-200">{fund.beneficiary?.name || 'Campaign Recipient'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Verified Payout Bank:</span>
                        <span className="font-semibold text-slate-200">HDFC Bank Trust Escrow</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Payout Route:</span>
                        <span className="font-mono text-slate-300">XXXX XXXX XXXX 5821</span>
                      </div>
                      <div className="flex justify-between border-t border-teal-900/40 pt-1.5 mt-1.5">
                        <span className="text-slate-400">Payout Mode:</span>
                        <span className="text-amber-400 font-bold uppercase text-[9px] tracking-wide bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-900/20">Verified Creator Payout</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider block">Payer Details</span>
                <div className="bg-[#0c2225] p-3.5 rounded-xl border border-teal-950/40 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Donor Name:</span>
                    <span className="font-semibold text-slate-200">{selectedSubMethod === 'card' ? cardPayerName : (donorName || 'Kind Supporter')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registered Contact:</span>
                    <span className="font-semibold text-slate-200">{selectedSubMethod === 'card' ? `${cardMobile} (${cardEmail})` : '9876543210'}</span>
                  </div>
                </div>
              </div>

              {securePayLoading && securePayVerifyStatus && (
                <div className="bg-teal-950/40 py-3 px-4 rounded-xl border border-teal-900/30 text-teal-300 text-xs flex items-center justify-center gap-2.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  <span>{securePayVerifyStatus}</span>
                </div>
              )}
            </div>

            {/* Pay Button Footer */}
            <div className="p-5 bg-[#061214] border-t border-teal-900/30">
              <button
                type="button"
                onClick={executeSecurePayPayment}
                disabled={securePayLoading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-950 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {securePayLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Secure Payout...
                  </>
                ) : (
                  <>Verify & Transfer ₹{totalAmount.toLocaleString('en-IN')}</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}


      </div>
    </div>
  );
};

export default Donate;
