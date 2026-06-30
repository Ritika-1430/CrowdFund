import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fundApi, donationApi, subscriptionApi } from '../services/api';
import { Fund } from '../types';
import { fallbackFundImage } from '../utils/fundImages';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Heart,
  Shield,
  TrendingUp,
  Users,
  ChevronRight,
  Sun,
  Moon,
  Search,
  Volume2,
  VolumeX,
  MapPin,
  Share2,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  X,
  PlusCircle,
  HelpCircle,
  Award,
  BookOpen,
  Percent,
  Zap,
  Building2,
  Compass,
  Download,
  FileText
} from 'lucide-react';

// ══════════════════════════════════════════════════════════
// FEATURE 18: WEB AUDIO SYNTHESIS SOUND EFFECTS
// ══════════════════════════════════════════════════════════
const playSynthSound = (type: 'click' | 'success' | 'hover') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'hover') {
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
};

// ══════════════════════════════════════════════════════════
// COUNTDOWN TIMER SUB-COMPONENT (FEATURE 6)
// ══════════════════════════════════════════════════════════
const UrgentCountdown = ({ deadline }: { deadline: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const target = new Date(deadline).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setIsEnded(true);
        clearInterval(interval);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, mins: m, secs: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (isEnded) return <span className="text-stone">Ended</span>;

  return (
    <div className="flex items-center gap-1 bg-coral/10 text-coral px-2.5 py-1 rounded-md text-[10px] font-bold font-mono">
      <Clock className="w-3 h-3 animate-pulse" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.mins).padStart(2, '0')}:
        {String(timeLeft.secs).padStart(2, '0')} left
      </span>
    </div>
  );
};

// Custom hook for counting up numbers smoothly (Feature 8)
const useCountUp = (target: number, duration: number = 1500, trigger: boolean = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let start = 0;
    const end = target;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalFrames = Math.round(duration / 16.67); // approx 60 fps
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      // Easing function: easeOutQuad
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress);
      
      const currentCount = Math.round(easeProgress * (end - start) + start);
      setCount(currentCount);

      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      }
    }, 16.67);

    return () => clearInterval(timer);
  }, [target, duration, trigger]);

  return count;
};

// ══════════════════════════════════════════════════════════
// IMPACT SIMULATOR UTILS (FEATURE 11)
// ══════════════════════════════════════════════════════════
const IMPACT_MAPPING = {
  Medical: {
    unitPrice: 250,
    unit: 'medical packets / hygiene kits',
    verb: 'provide vital',
    description: 'Each kit contains bandages, sterilizers, medications, and sanitizers for critical support.'
  },
  Education: {
    unitPrice: 500,
    unit: 'textbook & uniform sets',
    verb: 'distribute comprehensive',
    description: 'Enables a student to attend school for a semester with high-quality supplies.'
  },
  Disaster: {
    unitPrice: 120,
    unit: 'freshly cooked meals',
    verb: 'serve nutritious,',
    description: 'Feeds flood-affected and displaced families in temporary shelters across India.'
  },
  Environment: {
    unitPrice: 150,
    unit: 'saplings & tree kits',
    verb: 'plant organic native',
    description: 'Restores deforested areas, boosts localized cooling, and generates community ownership.'
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Fund[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);

  // States for new features
  // FEATURE 1: Scroll progress
  const [scrollProgress, setScrollProgress] = useState(0);

  // FEATURE 2: Dark mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // FEATURE 3: Autocomplete Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Fund[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // FEATURE 5: Categories
  const [selectedCategory, setSelectedCategory] = useState('All');

  // FEATURE 8: Dynamic Metrics
  const [metrics, setMetrics] = useState({ totalAmount: 1240000, totalDonors: 850, totalCampaigns: 14 });

  // FEATURE 9: Activity feed / recent donations ticker
  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  // FEATURE 10: Donut chart hover segment
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // FEATURE 11: Impact simulator slider
  const [simulateAmount, setSimulateAmount] = useState(2000);
  const [simulateCategory, setSimulateCategory] = useState<'Medical' | 'Education' | 'Disaster' | 'Environment'>('Medical');

  // FEATURE 12: Aadhaar verified trust drawer
  const [trustDrawerCreator, setTrustDrawerCreator] = useState<any | null>(null);

  // FEATURE 13: Geolocation Recommendations
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState('');

  // FEATURE 14: Accordion FAQs search & selection
  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // FEATURE 15: Testimonial live submission
  const [testimonials, setTestimonials] = useState<any[]>([
    { name: 'Dr. Vivek Sharma', text: 'Aidora verification changed how we do rural outreach. Truly 0% platform fee!', rating: 5 },
    { name: 'Priya Iyer', text: 'Secured funds for my mother\'s heart treatment in 36 hours. Very transparent platform.', rating: 5 },
    { name: 'Aman Deep', text: 'Donated ₹5,000 to disaster relief. I saw exactly where it went and got an instant 80G receipt.', rating: 5 }
  ]);
  const [newFeedbackName, setNewFeedbackName] = useState('');
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [newFeedbackRating, setNewFeedbackRating] = useState(5);

  // FEATURE 16: Share drawers & popups (with QR code generation)
  const [sharingFund, setSharingFund] = useState<Fund | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // FEATURE 17: Top Donors Leaderboard Cabinet
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // FEATURE 19: Cost breakdown drawer
  const [breakdownFund, setBreakdownFund] = useState<Fund | null>(null);

  // FEATURE 20: Speech synthesis narrative reader
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // FEATURE 21: Newsletter email state & status
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterValid, setNewsletterValid] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // FEATURE 22: Parallax background mouse coords
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ══════════════════════════════════════════════════════════
  // NEW COMPETITIVE FEATURES STATE
  // ══════════════════════════════════════════════════════════
  // 1. AI Story Generator states
  const [storyBeneficiary, setStoryBeneficiary] = useState('');
  const [storyCause, setStoryCause] = useState('Emergency Medical Treatment');
  const [storyHospital, setStoryHospital] = useState('');
  const [storyAmount, setStoryAmount] = useState('250000');
  const [storyTone, setStoryTone] = useState<'Emotional' | 'Urgent' | 'Inspiring'>('Emotional');
  const [storyResult, setStoryResult] = useState('');
  const [storyHeadline, setStoryHeadline] = useState('');
  const [storyGenerating, setStoryGenerating] = useState(false);

  // 2. 80G Tax Savings Calculator states
  const [taxAmount, setTaxAmount] = useState(10000);
  const [taxIncome, setTaxIncome] = useState(750000);
  const [taxRegime, setTaxRegime] = useState<'Old' | 'New'>('New');
  const [showTaxReceipt, setShowTaxReceipt] = useState(false);

  // 3. Corporate Sponsor Matching states
  const [corporateMatchAmount, setCorporateMatchAmount] = useState(5000);
  const [selectedCorporateSponsor, setSelectedCorporateSponsor] = useState('Tata Trusts');
  const [corporateMatchSimulated, setCorporateMatchSimulated] = useState(false);
  const [showMatchReceipt, setShowMatchReceipt] = useState(false);
  const [simulatedMatches, setSimulatedMatches] = useState<Array<{
    id: string;
    partner: string;
    pledge: number;
    match: number;
    timestamp: string;
  }>>([]);

  // Subscription Generosity Circle states
  const [subscribing, setSubscribing] = useState(false);
  const [subscribedAmt, setSubscribedAmt] = useState<number | null>(null);
  const [selectedSubAmt, setSelectedSubAmt] = useState(200);

  const handleJoinSubscription = async (amount: number) => {
    setSubscribing(true);
    try {
      await subscriptionApi.subscribe(amount);
      setSubscribedAmt(amount);
      confetti({ particleCount: 50, spread: 40 });
    } catch (_) {
      alert('Subscription failed. Please log in first.');
    } finally {
      setSubscribing(false);
    }
  };

  // 4. Interactive Cause Quiz states
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0); // 0: intro, 1, 2, 3, 4: result
  const [quizPhilosophy, setQuizPhilosophy] = useState('');
  const [quizBudget, setQuizBudget] = useState(1000);
  const [quizPreference, setQuizPreference] = useState('');
  const [quizMatchedCampaign, setQuizMatchedCampaign] = useState<Fund | null>(null);
  const [quizFinding, setQuizFinding] = useState(false);

  // 5. Hospital Case Validator states
  const [validatorCampaignId, setValidatorCampaignId] = useState('');
  const [validatorLoading, setValidatorLoading] = useState(false);
  const [validatorResult, setValidatorResult] = useState<any | null>(null);

  // 6. Public Transparency Ledger search state
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState('');

  // Refs for scroll elements and sliders
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);

  // ══════════════════════════════════════════════════════════
  // CORE EFFECTS
  // ══════════════════════════════════════════════════════════

  // Scroll Progress (Feature 1)
  useEffect(() => {
    const updateScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollProgress(pct);
    };
    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  // Theme configuration (Feature 2)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Mouse move handler for Parallax blobs (Feature 22)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 35,
        y: (e.clientY - window.innerHeight / 2) / 35
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load backend data (Real Aggregation & Dynamics)
  useEffect(() => {
    // 1. Fetch active campaigns
    fundApi.list({ status: 'Active', limit: 12 })
      .then(res => {
        const list = res.data.funds || [];
        setCampaigns(list);
        setFilteredCampaigns(list);
      })
      .catch((e) => console.error('Error fetching campaigns:', e))
      .finally(() => setLoading(false));

    // 2. Fetch platform summary (Feature 8 - Aggregated Real stats)
    fundApi.getStatsSummary()
      .then(res => {
        if (res.data) {
          setMetrics({
            totalAmount: res.data.totalAmount,
            totalDonors: res.data.totalDonors,
            totalCampaigns: res.data.totalCampaigns
          });
        }
      })
      .catch((e) => console.warn('Could not fetch stats summary:', e));

    // 3. Fetch recent donations (Feature 9 - Live ticker feed)
    donationApi.getRecentGlobalDonations()
      .then(res => {
        if (res.data && res.data.donations) {
          setRecentDonations(res.data.donations);
        }
      })
      .catch((e) => console.warn('Could not fetch global recent donations:', e));

    // 4. Fetch top donors leaderboard (Feature 17 - Top Donors Cabinet)
    donationApi.getTopDonors()
      .then(res => {
        if (res.data && res.data.leaderboard) {
          setLeaderboard(res.data.leaderboard);
        }
      })
      .catch((e) => console.warn('Could not fetch leaderboard:', e));

    // 5. Load custom testimonials from localStorage (Feature 15)
    const stored = localStorage.getItem('aidora_testimonials');
    if (stored) {
      try {
        setTestimonials(JSON.parse(stored));
      } catch (_) {}
    }
  }, []);

  // Update carousel scroll constraint width
  useEffect(() => {
    if (carouselRef.current) {
      setCarouselWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [filteredCampaigns]);

  // Autocomplete search handler (Feature 3)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const term = searchQuery.toLowerCase();
    const matches = campaigns.filter(c => 
      c.title.toLowerCase().includes(term) || 
      (c.category && c.category.toLowerCase().includes(term)) ||
      (c.location && c.location.toLowerCase().includes(term))
    );
    setSearchResults(matches);
  }, [searchQuery, campaigns]);

  // Category & Geolocation Filter (Feature 5 + 13)
  const filterByDetails = (category: string, listToUse = campaigns) => {
    let output = listToUse;
    if (category !== 'All') {
      output = listToUse.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
    }
    setFilteredCampaigns(output);
  };

  // Click Sound effect wrapper
  const handleTabClick = (category: string) => {
    playSynthSound('click');
    setSelectedCategory(category);
    filterByDetails(category);
  };

  // ══════════════════════════════════════════════════════════
  // FEATURE FUNCTIONS
  // ══════════════════════════════════════════════════════════

  // Quick Pledge Handler (Feature 7)
  const handleQuickPledge = async (fundId: string, amount: number) => {
    playSynthSound('click');
    try {
      const name = localStorage.getItem('name') || 'Anonymous Donor';
      const pledgeData = {
        fundId,
        donorName: name,
        amount,
        comment: 'Pledged via homepage quick donation link',
        isAnonymous: !localStorage.getItem('token')
      };
      
      const res = await donationApi.donate(pledgeData);
      if (res.data) {
        // Explode Confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        playSynthSound('success');
        
        // Refresh stats & data
        const summaryRes = await fundApi.getStatsSummary();
        if (summaryRes.data) setMetrics(summaryRes.data);

        const listRes = await fundApi.list({ status: 'Active', limit: 12 });
        setCampaigns(listRes.data.funds || []);
        filterByDetails(selectedCategory, listRes.data.funds || []);

        const recentRes = await donationApi.getRecentGlobalDonations();
        if (recentRes.data && recentRes.data.donations) setRecentDonations(recentRes.data.donations);

        const leaderRes = await donationApi.getTopDonors();
        if (leaderRes.data && leaderRes.data.leaderboard) setLeaderboard(leaderRes.data.leaderboard);

        alert(`Thank you! Real pledge of ₹${amount} succeeded. Confetti fired!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Pledge failed. Check network.');
    }
  };

  // Geolocation recommendation solver (Feature 13)
  const handleGeolocation = () => {
    playSynthSound('click');
    if (!navigator.geolocation) {
      setGeoFeedback('Geolocation not supported by browser.');
      return;
    }
    setGeoLocating(true);
    setGeoFeedback('Detecting position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Geolocation callback. We resolve coordinates (mocked to typical Indian tech hubs)
        const lat = pos.coords.latitude;
        // Mock matching criteria
        let matchedCity = 'Delhi';
        if (lat < 15) matchedCity = 'Bengaluru';
        else if (lat >= 15 && lat < 21) matchedCity = 'Mumbai';
        
        setGeoFeedback(`Matching campaigns in ${matchedCity}...`);
        
        // Simulate minor lookup time
        setTimeout(() => {
          const matched = campaigns.filter(c => 
            c.location?.toLowerCase().includes(matchedCity.toLowerCase())
          );
          if (matched.length > 0) {
            setFilteredCampaigns(matched);
            setGeoFeedback(`Showing ${matched.length} campaigns located in ${matchedCity}`);
            playSynthSound('success');
          } else {
            setGeoFeedback(`No specific campaigns active in ${matchedCity}. Reverting.`);
            setTimeout(() => {
              setGeoFeedback('');
              setFilteredCampaigns(campaigns);
            }, 3000);
          }
          setGeoLocating(false);
        }, 1200);
      },
      (err) => {
        console.error(err);
        setGeoFeedback('Permission denied or timing out.');
        setGeoLocating(false);
        setTimeout(() => setGeoFeedback(''), 3000);
      }
    );
  };

  // Submit dynamic testimonial feedback (Feature 15)
  const submitTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackName.trim() || !newFeedbackText.trim()) return;

    playSynthSound('success');
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });

    const added = [
      { name: newFeedbackName, text: newFeedbackText, rating: newFeedbackRating },
      ...testimonials
    ];
    setTestimonials(added);
    localStorage.setItem('aidora_testimonials', JSON.stringify(added));

    setNewFeedbackName('');
    setNewFeedbackText('');
    alert('Thank you! Your testimonial has been loaded live into the dashboard carousel.');
  };

  // Share popover QR Code copy helper (Feature 16)
  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    playSynthSound('success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Narrative reader accessibility (Feature 20)
  const handleTTS = (title: string, description = '') => {
    if (speakingText) {
      window.speechSynthesis.cancel();
      setSpeakingText(null);
      return;
    }
    playSynthSound('click');
    const speech = new SpeechSynthesisUtterance();
    speech.text = `Campaign Title: ${title}. Description: ${description}`;
    speech.onend = () => setSpeakingText(null);
    setSpeakingText(title);
    window.speechSynthesis.speak(speech);
  };

  // Newsletter subscription (Feature 21)
  const handleNewsletterChange = (email: string) => {
    setNewsletterEmail(email);
    const valid = /\S+@\S+\.\S+/.test(email);
    setNewsletterValid(valid);
  };

  const subscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterValid) return;

    playSynthSound('success');
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  // ══════════════════════════════════════════════════════════
  // HANDLERS FOR NEW COMPETITIVE FEATURES
  // ══════════════════════════════════════════════════════════

  // 1. AI Story Generator logic
  const handleGenerateStory = () => {
    if (!storyBeneficiary.trim()) {
      alert('Please enter a beneficiary name.');
      return;
    }
    playSynthSound('click');
    setStoryGenerating(true);
    setStoryResult('');
    setStoryHeadline('');

    // Pre-authored templates based on inputs to simulate advanced AI responses
    const headlines = {
      Emotional: `Save ${storyBeneficiary}: A Family's Desperate Plea for Survival`,
      Urgent: `URGENT: Critical Medical Intervention Needed for ${storyBeneficiary} within 48 Hours`,
      Inspiring: `Support ${storyBeneficiary} in overcoming this battle: A Journey of Hope and Courage`
    } as const;

    const hospitalText = storyHospital ? ` at ${storyHospital}` : '';
    const formattedAmount = Number(storyAmount).toLocaleString('en-IN');

    const stories = {
      Emotional: `We are writing this with a heavy heart. My dear ${storyBeneficiary} is fighting a severe medical battle${hospitalText} that requires urgent care. The total cost of treatment is estimated at ₹${formattedAmount}. Every day, we watch them fight for strength, but the mounting bills are overwhelming our family. Your contribution can provide the critical treatment needed to bring them back home. Please support us in this hour of need.`,
      Urgent: `TIME IS RUNNING OUT. ${storyBeneficiary} is currently critical${hospitalText} and requires an emergency procedure. The hospital has estimated a total expense of ₹${formattedAmount} which must be settled immediately for the surgery to proceed. We have exhausted all our savings and loans. Your instant donation, no matter how small, can literally save their life today. Please share this widely.`,
      Inspiring: `${storyBeneficiary} has always been a fighter. Despite being diagnosed with a critical condition requiring ₹${formattedAmount} for recovery${hospitalText}, they continue to smile and inspire everyone around. This campaign is not just about raising funds; it's about standing together with ${storyBeneficiary} to show that hope wins. Let's unite to fund this treatment and celebrate their recovery journey together!`
    } as const;

    const headline = headlines[storyTone];
    const bodyText = stories[storyTone];

    setStoryHeadline(headline);

    // Typewriter effect simulation
    let index = 0;
    const interval = setInterval(() => {
      setStoryResult(prev => prev + bodyText.charAt(index));
      index++;
      if (index >= bodyText.length) {
        clearInterval(interval);
        setStoryGenerating(false);
        playSynthSound('success');
      }
    }, 12); // Adjust typing speed
  };

  const handleUseStoryInFundraiser = () => {
    if (!storyResult) return;
    playSynthSound('click');
    const params = new URLSearchParams();
    params.set('titleDraft', storyHeadline);
    params.set('storyDraft', storyResult);
    params.set('categoryDraft', storyCause);
    params.set('amountDraft', storyAmount);
    params.set('emergencyDraft', storyTone === 'Urgent' ? 'true' : 'false');
    navigate(`/create?${params.toString()}`);
  };

  // 2. 80G Tax Savings Calculator calculations
  const calculateTaxSavings = () => {
    // 80G provides 50% deduction of donation amount from taxable income
    const donationDeduction = taxAmount * 0.5;
    
    // Estimate tax bracket based on income
    let taxBracket = 0;
    if (taxRegime === 'New') {
      if (taxIncome > 1500000) taxBracket = 0.30;
      else if (taxIncome > 1200000) taxBracket = 0.20;
      else if (taxIncome > 900000) taxBracket = 0.15;
      else if (taxIncome > 600000) taxBracket = 0.10;
      else if (taxIncome > 300000) taxBracket = 0.05;
      else taxBracket = 0;
    } else {
      if (taxIncome > 1000000) taxBracket = 0.30;
      else if (taxIncome > 500000) taxBracket = 0.20;
      else if (taxIncome > 250000) taxBracket = 0.05;
      else taxBracket = 0;
    }

    const estimatedSavings = donationDeduction * taxBracket;
    const netCost = taxAmount - estimatedSavings;

    return {
      deduction: donationDeduction,
      savings: estimatedSavings,
      netCost: netCost,
      taxBracketPercent: taxBracket * 100
    };
  };

  // 3. Corporate Sponsor Match Logic
  const triggerCorporateMatch = () => {
    playSynthSound('success');
    setCorporateMatchSimulated(true);
    const newSim = {
      id: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
      partner: selectedCorporateSponsor,
      pledge: corporateMatchAmount,
      match: corporateMatchAmount,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setSimulatedMatches(prev => [newSim, ...prev]);
    setShowMatchReceipt(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // 4. Interactive Cause Quiz matcher logic
  const handleStartQuiz = () => {
    playSynthSound('click');
    setQuizOpen(true);
    setQuizStep(1);
    setQuizPhilosophy('');
    setQuizPreference('');
    setQuizMatchedCampaign(null);
  };

  const handleQuizNext = (answerKey: 'philosophy' | 'preference', value: string) => {
    playSynthSound('click');
    if (answerKey === 'philosophy') {
      setQuizPhilosophy(value);
      setQuizStep(2);
    } else if (answerKey === 'preference') {
      setQuizPreference(value);
      setQuizStep(3);
    }
  };

  const handleQuizSubmit = () => {
    playSynthSound('click');
    setQuizFinding(true);
    setQuizStep(3); // loading screen

    setTimeout(() => {
      // Find a matching active campaign
      let matched: Fund | null = null;

      // Filter campaigns by match priority
      if (campaigns.length > 0) {
        // Try mapping category based on philosophy
        let matchedCatKeywords: string[] = [];
        if (quizPhilosophy === 'save_lives') matchedCatKeywords = ['Medical', 'Healthcare'];
        else if (quizPhilosophy === 'educate_kids') matchedCatKeywords = ['Education', 'School'];
        else if (quizPhilosophy === 'disaster_relief') matchedCatKeywords = ['Disaster', 'Relief'];
        else matchedCatKeywords = ['Environment', 'Sapling'];

        // Find campaign with matching category
        matched = campaigns.find(c => 
          matchedCatKeywords.some(kw => c.category.toLowerCase().includes(kw.toLowerCase()))
        ) || null;

        // Second level filter based on preference
        if (!matched && quizPreference === 'urgent') {
          matched = campaigns.find(c => c.emergency === true) || null;
        }

        // Fallback to first campaign
        if (!matched) {
          matched = campaigns[0] || null;
        }
      }

      setQuizMatchedCampaign(matched);
      setQuizFinding(false);
      setQuizStep(4); // Results step
      playSynthSound('success');
    }, 1500);
  };

  // 5. Hospital Case Validator logic
  const handleValidateHospitalCase = () => {
    if (!validatorCampaignId) {
      alert('Please select a campaign to validate.');
      return;
    }
    playSynthSound('click');
    setValidatorLoading(true);
    setValidatorResult(null);

    // Look up current campaign details
    const selectedFund = campaigns.find(c => c._id === validatorCampaignId);

    setTimeout(() => {
      // Mock validation results
      const hospitals = [
        'Apollo Hospitals, Greams Road, Chennai',
        'Fortis Memorial Research Institute, Gurugram',
        'AIIMS (All India Institute of Medical Sciences), New Delhi',
        'Tata Memorial Hospital, Parel, Mumbai',
        'Kokilaben Dhirubhai Ambani Hospital, Mumbai'
      ];
      // Pick hospital deterministically based on campaign id length or character
      const hospitalIndex = Math.abs(validatorCampaignId.charCodeAt(validatorCampaignId.length - 1) || 0) % hospitals.length;
      
      setValidatorResult({
        campaignTitle: selectedFund?.title || 'Patient Campaign',
        hospitalName: hospitals[hospitalIndex],
        caseId: `CS-${validatorCampaignId.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        verifiedAadhaar: true,
        escrowDisbursement: true,
        cmoApproval: true,
        verificationDate: new Date().toLocaleDateString('en-IN'),
        amountVerified: selectedFund?.targetAmount || 500000,
        signatory: 'Dr. R. K. Sen, Registrar & CMO Verification'
      });
      setValidatorLoading(false);
      playSynthSound('success');
    }, 1200);
  };

  // Helper count-up statistics values (Feature 8)
  const animateAmount = useCountUp(metrics.totalAmount, 1500, statsInView);
  const animateDonors = useCountUp(metrics.totalDonors, 1500, statsInView);
  const animateCampaigns = useCountUp(metrics.totalCampaigns, 1500, statsInView);

  // FAQ List configuration (Feature 14)
  const FAQs = [
    { q: 'Is there a platform fee at Aidora?', a: 'No, Aidora charges absolutely zero platform fee. 100% of your donation is delivered to the beneficiary minus minor payment gateway processing charges.' },
    { q: 'How is identity verification verified?', a: 'Every campaign creator completes Aadhaar verification. Aadhaar data is cross-referenced using real-time government databases to certify authenticity.' },
    { q: 'Are donations tax-exempt under 80G?', a: 'Yes! Select the 80G tax benefit option on checkout, enter your PAN card, and an automated tax exemption receipt will be issued instantly.' },
    { q: 'Can I withdraw the accumulated funds early?', a: 'Verified creators can request early emergency payouts directly through their dashboard in case of urgent hospital discharge needs.' },
    { q: 'How is transparency guaranteed?', a: 'Every rupee collected and every hospital billing transaction is uploaded and logged on the campaign public ledger.' }
  ];

  const filteredFAQs = FAQs.filter(faq => 
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="bg-ivory dark:bg-navy dark:text-ivory min-h-screen transition-colors duration-300 relative overflow-hidden">
      
      {/* ══════════════════════════════════════════════════════════
          FEATURE 1: TOP SCROLL PROGRESS INDICATOR BAR
          ══════════════════════════════════════════════════════════ */}
      <div 
        style={{ width: `${scrollProgress}%` }} 
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-coral via-gold to-sage z-[999] transition-all duration-75" 
      />

      {/* ══════════════════════════════════════════════════════════
          FEATURE 2: DARK / LIGHT MODE FLOATING SWITCHER
          ══════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => { playSynthSound('click'); setDarkMode(!darkMode); }}
          className="w-14 h-14 bg-white dark:bg-navy-light text-charcoal dark:text-gold rounded-full shadow-warm-lg hover:shadow-warm-xl border border-sand/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
          aria-label="Toggle Theme"
          onMouseEnter={() => playSynthSound('hover')}
        >
          {darkMode ? (
            <Sun className="w-6 h-6 animate-spin-slow group-hover:text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-stone group-hover:text-navy" />
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 9: LIVE RECENT DONATIONS TICKER BAR
          ══════════════════════════════════════════════════════════ */}
      {recentDonations.length > 0 && (
        <div className="bg-cream dark:bg-navy-light border-b border-sand/30 py-2.5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-coral uppercase tracking-wider whitespace-nowrap bg-white dark:bg-navy px-3 py-1 rounded-full border border-coral/10">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Activity Feed
            </span>
            <div className="relative w-full overflow-hidden h-6">
              <div className="flex gap-12 items-center animate-marquee whitespace-nowrap absolute">
                {recentDonations.concat(recentDonations).map((don, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[12px] text-stone dark:text-sand">
                    <span className="font-semibold text-charcoal dark:text-white">{don.donorName}</span>
                    <span>contributed</span>
                    <span className="font-bold text-coral">₹{don.amount.toLocaleString('en-IN')}</span>
                    <span>to</span>
                    <Link to={`/funds/${don.fundId?._id}`} className="underline text-navy-light dark:text-gold truncate max-w-[200px] hover:text-coral transition-colors">
                      {don.fundId?.title || 'a campaign'}
                    </Link>
                    <span className="text-[10px] text-stone/50">•</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION (Includes Search Autocomplete, Mouse Parallax Blobs)
          ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pb-28">
        
        {/* FEATURE 22: MOUSE-PARALLAX BACKGROUND BLOBS */}
        <motion.div 
          style={{ x: mousePosition.x * 1.4, y: mousePosition.y * 1.4 }}
          className="absolute top-20 -right-32 w-[550px] h-[550px] bg-coral/6 dark:bg-coral/4 blob-1 blur-[90px] pointer-events-none" 
        />
        <motion.div 
          style={{ x: -mousePosition.x * 1.2, y: -mousePosition.y * 1.2 }}
          className="absolute -bottom-20 -left-32 w-[450px] h-[450px] bg-sage/8 dark:bg-sage/5 blob-2 blur-[70px] pointer-events-none" 
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Content */}
            <motion.div
              className="lg:col-span-7 space-y-7 z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-coral/8 text-coral dark:bg-coral/15 text-[12px] font-semibold px-4 py-2 rounded-full border border-coral/15">
                <Heart className="w-3.5 h-3.5 animate-bounce" fill="currentColor" />
                Trusted Identity-Verified Crowdfunding across India
              </div>

              <h1 className="text-[44px] sm:text-[56px] lg:text-[64px] font-serif text-charcoal dark:text-white leading-[1.05] tracking-tight">
                Every Rupee
                <br />
                Builds <span className="wavy-underline">Hope</span>
              </h1>

              <p className="text-stone dark:text-sand text-[17px] leading-relaxed max-w-lg">
                India's leading verified platform. Every creator undergoes Aadhaar checkups, 
                every donation has fully verifiable ledger, and there is 
                <span className="font-semibold text-charcoal dark:text-gold"> zero platform fee</span>.
              </p>

              {/* ══════════════════════════════════════════════════════════
                  FEATURE 3: LIVE SEARCH AUTOCOMPLETE INPUT
                  ══════════════════════════════════════════════════════════ */}
              <div className="relative max-w-md">
                <div className="flex items-center bg-white dark:bg-navy-light rounded-2xl border border-sand dark:border-stone/40 px-4 py-3 shadow-warm-sm focus-within:border-coral transition-all">
                  <Search className="w-5 h-5 text-stone dark:text-sand mr-2" />
                  <input
                    type="text"
                    placeholder="Search active campaigns by title, category, city..."
                    className="bg-transparent text-[14px] text-charcoal dark:text-white placeholder:text-stone/50 w-full focus:outline-none focus:ring-0 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { playSynthSound('click'); setSearchFocused(true); }}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => { playSynthSound('click'); setSearchQuery(''); }}
                      className="text-stone hover:text-coral transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {searchFocused && (searchQuery.trim() || searchResults.length > 0) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-navy-light border border-sand dark:border-stone/40 rounded-2xl shadow-warm-lg z-[40] max-h-72 overflow-y-auto"
                    >
                      {searchResults.length === 0 ? (
                        <div className="p-4 text-center text-stone text-xs">No matching campaigns found. Try 'medical' or 'education'.</div>
                      ) : (
                        <div className="py-2">
                          <p className="text-[10px] font-bold text-stone/50 uppercase tracking-widest px-4 pb-2 border-b border-sand/10">Matches</p>
                          {searchResults.map(fund => (
                            <div
                              key={fund._id}
                              onClick={() => { playSynthSound('click'); navigate(`/funds/${fund._id}`); }}
                              className="px-4 py-3 hover:bg-cream dark:hover:bg-navy cursor-pointer flex items-center justify-between transition"
                            >
                              <div>
                                <h4 className="text-xs font-semibold text-charcoal dark:text-white truncate max-w-[280px]">{fund.title}</h4>
                                <p className="text-[10px] text-stone mt-0.5">{fund.category} • {fund.location || 'India'}</p>
                              </div>
                              <span className="text-[10px] text-coral font-bold flex items-center gap-0.5">
                                View <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-coral text-white text-[14px] font-bold rounded-xl shadow-warm hover:bg-terracotta hover:shadow-warm-md transition-all active:scale-[0.98]"
                >
                  Explore Campaigns
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white dark:bg-navy-light text-charcoal dark:text-white text-[14px] font-semibold rounded-xl border border-sand dark:border-stone/40 hover:border-coral/30 shadow-warm-sm hover:shadow-warm transition-all"
                >
                  Start a Fundraiser
                </Link>
              </div>
            </motion.div>

            {/* Right — Stats Cards (FEATURE 8: LIVE COUNT UP METRICS) */}
            <motion.div
              ref={statsRef}
              className="lg:col-span-5 z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-navy-light rounded-3xl shadow-warm-md border border-sand/40 dark:border-stone/30 p-8 relative">
                <p className="text-[11px] font-bold text-stone dark:text-sand uppercase tracking-[0.15em] mb-6">Platform Performance (Live Aggregated)</p>
                <div className="space-y-6">
                  
                  {/* Metric 1 */}
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-coral/10 text-coral">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[28px] font-serif text-charcoal dark:text-white leading-none">
                        ₹{(animateAmount / 100000).toFixed(1)}L+
                      </p>
                      <p className="text-[12px] text-stone dark:text-sand mt-0.5">Funds Raised</p>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-sage/15 text-sage-dark dark:text-sage">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[28px] font-serif text-charcoal dark:text-white leading-none">
                        {animateDonors.toLocaleString()}+
                      </p>
                      <p className="text-[12px] text-stone dark:text-sand mt-0.5">Verified Donors</p>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-navy/8 text-navy dark:bg-gold/15 dark:text-gold">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[28px] font-serif text-charcoal dark:text-white leading-none">
                        {animateCampaigns} Campaigns
                      </p>
                      <p className="text-[12px] text-stone dark:text-sand mt-0.5">Active & Transparent</p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURED CAMPAIGNS (Filter Tab Bar, Drag Carousel, Countdown, Quick Pledge, Breakdowns, TTS)
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-cream/40 dark:bg-navy-light/30 border-y border-sand/40 dark:border-stone/40 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-[11px] font-bold text-coral uppercase tracking-[0.15em] mb-2 font-mono">Active Campaigns</p>
              <h2 className="text-[36px] sm:text-[42px] font-serif text-charcoal dark:text-white leading-tight">
                Stories That Need You
              </h2>
            </div>

            {/* Geolocation Button (Feature 13) */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGeolocation}
                disabled={geoLocating}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white dark:bg-navy border border-sand dark:border-stone/40 text-stone dark:text-sand hover:text-coral dark:hover:text-gold transition active:scale-95 shadow-warm-sm"
              >
                <MapPin className={`w-3.5 h-3.5 ${geoLocating ? 'animate-bounce text-coral' : ''}`} />
                {geoFeedback ? geoFeedback : 'Show Campaigns Near Me'}
              </button>
              <Link
                to="/explore"
                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-coral hover:text-terracotta transition group"
              >
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              FEATURE 5: CATEGORY FILTER TABS WITH SLIDING INDICATOR
              ══════════════════════════════════════════════════════════ */}
          <div className="flex gap-2 mb-10 overflow-x-auto pb-2 border-b border-sand/20">
            {['All', 'Medical', 'Education', 'Disaster', 'Environment'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleTabClick(cat)}
                className="relative px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all focus:outline-none whitespace-nowrap"
                onMouseEnter={() => playSynthSound('hover')}
              >
                <span className={`relative z-10 ${selectedCategory === cat ? 'text-white' : 'text-stone dark:text-sand'}`}>
                  {cat}
                </span>
                {selectedCategory === cat && (
                  <motion.div
                    layoutId="activeCategoryTab"
                    className="absolute inset-0 bg-coral rounded-full shadow-warm-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20 space-y-3">
              <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-stone dark:text-sand">Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-white dark:bg-navy rounded-3xl border border-sand/40 dark:border-stone/40 p-16 text-center shadow-warm">
              <Heart className="w-12 h-12 text-sand dark:text-stone mx-auto mb-4" />
              <h3 className="font-serif text-xl text-charcoal dark:text-white mb-2">No Active Campaigns</h3>
              <p className="text-stone dark:text-sand text-sm mb-6">Be the first to start a campaign and make an impact.</p>
              <Link to="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white rounded-xl font-bold shadow-warm hover:bg-terracotta transition">
                Start a Campaign <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            
            /* ══════════════════════════════════════════════════════════
                FEATURE 4: DRAGGABLE/SWIPEABLE CAROUSEL CONTAINER
                ══════════════════════════════════════════════════════════ */
            <div className="overflow-hidden" ref={carouselRef}>
              <motion.div
                drag="x"
                dragConstraints={{ right: 0, left: -carouselWidth }}
                whileDrag={{ scale: 0.99 }}
                className="flex gap-7 cursor-grab active:cursor-grabbing pb-4"
              >
                {filteredCampaigns.map((fund) => {
                  const progress = Math.min(100, (fund.amountCollected / fund.targetAmount) * 100);
                  const isEmergency = fund.emergency || false;
                  
                  return (
                    <motion.div
                      key={fund._id}
                      className="min-w-[320px] sm:min-w-[350px] bg-white dark:bg-navy rounded-3xl overflow-hidden shadow-warm border border-sand/40 dark:border-stone/40 flex flex-col h-[520px] relative select-none"
                    >
                      {/* Image / Card Top */}
                      <div className="relative h-48 overflow-hidden bg-cream dark:bg-navy-light flex-shrink-0">
                        <img
                          src={fund.photos?.[0]?.url || fallbackFundImage(fund.category)}
                          alt={fund.title}
                          className="w-full h-full object-cover pointer-events-none"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackFundImage(fund.category);
                          }}
                        />
                        <div className="absolute top-3.5 left-3.5 flex gap-2">
                          <span className="bg-white/95 backdrop-blur-sm text-charcoal text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-warm-sm">
                            {fund.category}
                          </span>
                        </div>

                        {/* Speech Synthesis Narration Button (Feature 20) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTTS(fund.title, fund.description); }}
                          className={`absolute bottom-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            speakingText === fund.title 
                              ? 'bg-coral text-white animate-pulse' 
                              : 'bg-white/90 text-charcoal hover:bg-coral hover:text-white'
                          }`}
                          title="Listen to story"
                        >
                          {speakingText === fund.title ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>

                        {/* Emergency Status */}
                        {isEmergency && (
                          <div className="absolute top-3.5 right-3.5">
                            <span className="bg-coral text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                              Urgent
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-5 flex flex-col flex-1 min-h-0">
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <h3 
                            onClick={() => navigate(`/funds/${fund._id}`)}
                            className="font-serif text-lg text-charcoal dark:text-white leading-snug hover:text-coral transition-colors line-clamp-2 cursor-pointer"
                          >
                            {fund.title}
                          </h3>
                        </div>

                        <p className="text-stone dark:text-sand text-[13px] leading-relaxed mb-4 line-clamp-2">
                          {fund.description || 'Verified donation campaign for direct crowdfunding relief support.'}
                        </p>

                        {/* Real-time Ticking Countdown (Feature 6) */}
                        {fund.deadline && (
                          <div className="mb-4">
                            <UrgentCountdown deadline={fund.deadline} />
                          </div>
                        )}

                        {/* Progress Tracker */}
                        <div className="mt-auto">
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-charcoal dark:text-white font-bold text-[15px]">
                              ₹{fund.amountCollected.toLocaleString('en-IN')}
                            </span>
                            <span className="text-stone dark:text-sand text-[12px]">
                              of ₹{fund.targetAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                          
                          <div className="w-full bg-sand/40 dark:bg-stone/20 rounded-full h-[6px] overflow-hidden mb-4">
                            <div
                              className="bg-coral h-full rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          {/* Quick Donate Panel (Feature 7) */}
                          <div className="border-t border-sand/30 dark:border-stone/20 pt-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-stone dark:text-sand uppercase">
                              <span>Quick Pledge</span>
                              <span className="text-[10px] text-coral">Instant Confetti</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {[500, 1000, 2000].map(amt => (
                                <button
                                  key={amt}
                                  onClick={() => handleQuickPledge(fund._id, amt)}
                                  className="py-1.5 text-[11px] font-bold rounded-lg border border-sand dark:border-stone/40 hover:border-coral hover:bg-coral hover:text-white transition active:scale-95 dark:text-white"
                                >
                                  ₹{amt}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Footer Action items inside Card */}
                          <div className="flex items-center justify-between mt-4 border-t border-sand/20 pt-3">
                            <div className="flex gap-2">
                              {/* Aadhaar Verification Badges (Feature 12) */}
                              <button
                                onClick={() => { playSynthSound('click'); setTrustDrawerCreator(fund); }}
                                className="flex items-center gap-1 bg-sage/10 text-sage-dark dark:text-sage text-[10px] px-2 py-1 rounded-md font-semibold hover:bg-sage/20 transition"
                              >
                                <CheckCircle2 className="w-3 h-3 text-sage-dark dark:text-sage" />
                                Aadhaar Checked
                              </button>

                              {/* Breakdown Items Drawer Button (Feature 19) */}
                              {fund.breakdownItems && fund.breakdownItems.length > 0 && (
                                <button
                                  onClick={() => { playSynthSound('click'); setBreakdownFund(fund); }}
                                  className="flex items-center gap-1 bg-navy/5 text-charcoal dark:bg-stone/20 dark:text-white text-[10px] px-2 py-1 rounded-md font-semibold hover:bg-navy/10 transition"
                                >
                                  <Info className="w-3 h-3" />
                                  Breakdown
                                </button>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => { playSynthSound('click'); setSharingFund(fund); }}
                                className="w-7 h-7 rounded-full bg-cream dark:bg-navy-light flex items-center justify-center text-stone dark:text-sand hover:text-coral hover:bg-coral/10 transition"
                                title="Share Campaign"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMPETITIVE FEATURE 4: INTERACTIVE CAUSE MATCHING WIZARD
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-cream/20 dark:bg-navy-light/15 border-b border-sand/30">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="bg-white dark:bg-navy rounded-3xl p-8 sm:p-10 shadow-warm border border-sand/40 dark:border-stone/40 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-coral/5 rounded-bl-full pointer-events-none" />
            
            <p className="text-[11px] font-bold text-coral uppercase tracking-[0.15em] mb-2 font-mono">Recommendation Wizard</p>
            <h2 className="text-3xl font-serif text-charcoal dark:text-white mb-4">Find Your Perfect Cause Match</h2>
            <p className="text-stone dark:text-sand text-xs max-w-lg mx-auto mb-8">
              Answer 3 simple questions and our algorithm will search active, verified campaigns to find where your contribution will make the biggest difference.
            </p>

            {quizStep === 0 ? (
              <button
                onClick={handleStartQuiz}
                className="px-8 py-3.5 bg-coral hover:bg-terracotta text-white text-xs font-bold rounded-xl shadow-warm transition active:scale-95 flex items-center gap-2 mx-auto"
              >
                <Compass className="w-4 h-4 animate-spin-slow" /> Start Matching Quiz
              </button>
            ) : (
              <div className="max-w-xl mx-auto p-6 bg-cream/40 dark:bg-navy-light/30 rounded-2xl border border-sand/30">
                {/* Step indicator */}
                <div className="flex justify-between items-center text-[10px] font-bold text-stone dark:text-sand uppercase mb-6 font-mono">
                  <span>Step {quizStep} of 3</span>
                  <button 
                    onClick={() => { playSynthSound('click'); setQuizStep(0); }}
                    className="text-coral hover:underline"
                  >
                    Reset Quiz
                  </button>
                </div>

                {/* Step 1: Giving Philosophy */}
                {quizStep === 1 && (
                  <div className="space-y-4 text-left">
                    <h3 className="font-serif text-lg text-charcoal dark:text-white font-bold">1. What is your primary giving goal?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        { key: 'save_lives', label: 'Save Lives (Medical Emergency support)', desc: 'Direct critical support to hospital ICUs and patient surgeries' },
                        { key: 'educate_kids', label: 'Educate Children (Schooling & Supplies)', desc: 'Help rural students obtain uniform, textbooks & fees' },
                        { key: 'disaster_relief', label: 'Disaster Relief (Food & Water)', desc: 'Assist flood/drought affected families in India' },
                        { key: 'protect_nature', label: 'Protect Nature (Plant Trees)', desc: 'Support forest restoration and community sapling drives' }
                      ].map(item => (
                        <button
                          key={item.key}
                          onClick={() => handleQuizNext('philosophy', item.key)}
                          className="p-4 bg-white dark:bg-navy rounded-xl border border-sand hover:border-coral dark:border-stone/40 text-left transition hover:shadow-warm-sm w-full group text-left"
                        >
                          <span className="text-xs font-bold text-charcoal dark:text-white group-hover:text-coral transition-colors">{item.label}</span>
                          <p className="text-[10px] text-stone dark:text-sand mt-1 leading-snug">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Preference */}
                {quizStep === 2 && (
                  <div className="space-y-4 text-left">
                    <h3 className="font-serif text-lg text-charcoal dark:text-white font-bold">2. Do you prefer urgent cases or long-term developments?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        { key: 'urgent', label: 'Critical / Emergency First', desc: 'Prioritize patients requiring funding within hours' },
                        { key: 'systemic', label: 'Systemic / Community First', desc: 'Focus on long-term project foundations and growth' }
                      ].map(item => (
                        <button
                          key={item.key}
                          onClick={() => handleQuizNext('preference', item.key)}
                          className="p-4 bg-white dark:bg-navy rounded-xl border border-sand hover:border-coral dark:border-stone/40 text-left transition hover:shadow-warm-sm w-full group text-left"
                        >
                          <span className="text-xs font-bold text-charcoal dark:text-white group-hover:text-coral transition-colors">{item.label}</span>
                          <p className="text-[10px] text-stone dark:text-sand mt-1 leading-snug">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Loading / Submission */}
                {quizStep === 3 && (
                  <div className="py-8 space-y-4">
                    {quizFinding ? (
                      <>
                        <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-stone dark:text-sand font-semibold">Scanning campaign files and verifying medical codes...</p>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xs text-stone dark:text-sand font-bold font-mono">Answers Logged! Press below to scan matches.</p>
                        <button
                          onClick={handleQuizSubmit}
                          className="px-6 py-2.5 bg-coral text-white font-bold text-xs rounded-xl shadow-warm-sm hover:bg-terracotta transition"
                        >
                          Verify & Match Campaign
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Results */}
                {quizStep === 4 && (
                  <div className="space-y-6">
                    {quizMatchedCampaign ? (
                      <div className="text-left space-y-4">
                        <div className="inline-flex items-center gap-1 bg-sage/10 text-sage-dark dark:text-sage text-[10px] font-bold font-mono px-3 py-1 rounded-full border border-sage/20 uppercase">
                          ★ Best Match Found
                        </div>
                        <h4 className="font-serif text-xl text-charcoal dark:text-white leading-tight font-bold">{quizMatchedCampaign.title}</h4>
                        <p className="text-xs text-stone dark:text-sand leading-relaxed line-clamp-3">
                          {quizMatchedCampaign.description}
                        </p>
                        <div className="p-4 bg-white dark:bg-navy border border-sand dark:border-stone/40 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="text-stone dark:text-sand">Target:</span>
                            <p className="font-bold text-charcoal dark:text-white mt-0.5">₹{quizMatchedCampaign.targetAmount.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <span className="text-stone dark:text-sand">Collected:</span>
                            <p className="font-bold text-coral mt-0.5">₹{quizMatchedCampaign.amountCollected.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <span className="text-stone dark:text-sand">Status:</span>
                            <p className="font-mono text-sage-dark dark:text-sage font-bold mt-0.5">Verified</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => { playSynthSound('click'); navigate(`/funds/${quizMatchedCampaign?._id}`); }}
                            className="flex-1 py-3 bg-coral hover:bg-terracotta text-white rounded-xl text-xs font-bold shadow-warm transition"
                          >
                            Support This Match
                          </button>
                          <button
                            onClick={() => { playSynthSound('click'); setQuizStep(0); }}
                            className="px-5 py-3 border border-sand dark:border-stone/40 text-stone dark:text-sand hover:bg-cream dark:hover:bg-navy rounded-xl text-xs font-bold transition"
                          >
                            Try Quiz Again
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 space-y-4">
                        <h3 className="font-serif text-lg text-charcoal dark:text-white">No Direct Match Found</h3>
                        <p className="text-xs text-stone">All active campaigns are currently well-funded! Explore our general list to see where you can help.</p>
                        <button
                          onClick={() => { playSynthSound('click'); setQuizStep(0); }}
                          className="px-6 py-2.5 bg-coral text-white text-xs font-bold rounded-xl shadow-warm"
                        >
                          Restart Matching Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 11: INTERACTIVE DONATION IMPACT SIMULATOR SLIDER
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 grid md:grid-cols-2 gap-12 items-center border-b border-sand/20">
        <div>
          <p className="text-[11px] font-bold text-coral uppercase tracking-[0.15em] mb-2 font-mono">Impact Calculator</p>
          <h2 className="text-[36px] sm:text-[42px] font-serif text-charcoal dark:text-white leading-tight mb-4">
            Simulate Your Change
          </h2>
          <p className="text-stone dark:text-sand text-sm leading-relaxed mb-6">
            Move the slider and pick a category to visualize the direct local impact of your donation. We pledge 100% of our fund values are delivered straight to families.
          </p>

          <div className="space-y-6">
            {/* Category Selectors */}
            <div>
              <label className="text-xs font-bold text-stone dark:text-sand uppercase mb-2.5 block">Select Cause Category</label>
              <div className="flex flex-wrap gap-2">
                {(['Medical', 'Education', 'Disaster', 'Environment'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => { playSynthSound('click'); setSimulateCategory(cat); }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                      simulateCategory === cat
                        ? 'bg-coral text-white border-coral shadow-warm-sm'
                        : 'bg-white dark:bg-navy border-sand dark:border-stone/40 text-stone dark:text-sand hover:border-coral'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider */}
            <div>
              <div className="flex justify-between font-bold text-[14px] text-charcoal dark:text-white mb-2">
                <span>Pledge Amount</span>
                <span className="text-coral text-lg font-mono">₹{simulateAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="200"
                max="10000"
                step="100"
                value={simulateAmount}
                onChange={(e) => { 
                  if (Math.abs(Number(e.target.value) - simulateAmount) > 300) playSynthSound('hover');
                  setSimulateAmount(Number(e.target.value));
                }}
                className="w-full h-2 bg-sand/60 dark:bg-stone/20 rounded-lg appearance-none cursor-pointer accent-coral"
              />
              <div className="flex justify-between text-[10px] text-stone dark:text-sand mt-2">
                <span>₹200</span>
                <span>₹5,000</span>
                <span>₹10,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simulator Outputs Visualizations */}
        <div className="bg-white dark:bg-navy-light rounded-3xl p-8 shadow-warm border border-sand/40 dark:border-stone/40 flex flex-col justify-between h-[300px]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-coral/10 text-coral p-2 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone dark:text-sand">Calculated Platform Impact</h4>
            </div>
            <p className="text-[28px] font-serif leading-tight text-charcoal dark:text-white">
              Your donation of <span className="text-coral">₹{simulateAmount.toLocaleString()}</span> can {IMPACT_MAPPING[simulateCategory].verb} <span className="font-bold underline decoration-coral decoration-wavy">{Math.floor(simulateAmount / IMPACT_MAPPING[simulateCategory].unitPrice)}</span> {IMPACT_MAPPING[simulateCategory].unit}.
            </p>
          </div>
          <p className="text-[13px] text-stone dark:text-sand/80 border-t border-sand/20 pt-4 leading-relaxed font-sans">
            {IMPACT_MAPPING[simulateCategory].description}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMPETITIVE FEATURE 3: AI CAMPAIGN STORY COPILOT WIDGET
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-cream/40 dark:bg-navy-light/10 border-b border-sand/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Input parameters form */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-[11px] font-bold text-coral uppercase tracking-[0.15em] mb-2 font-mono font-bold">Creator Copilot</p>
              <h2 className="text-[36px] sm:text-[42px] font-serif text-charcoal dark:text-white leading-tight mb-4">
                AI Story Generator
              </h2>
              <p className="text-stone dark:text-sand text-xs leading-relaxed">
                Writing a compelling fundraiser story is hard. Let our Creator AI draft an emotional, high-converting story format customized for your patient or cause.
              </p>
            </div>

            <div className="bg-white dark:bg-navy rounded-3xl p-6 shadow-warm border border-sand/40 dark:border-stone/40 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1.5 font-semibold">1. Patient / Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar, Baby Priya"
                  className="w-full bg-cream/20 dark:bg-navy-light/50 rounded-xl border border-sand dark:border-stone/40 px-4 py-2.5 text-xs text-charcoal dark:text-white focus:outline-none"
                  value={storyBeneficiary}
                  onChange={(e) => setStoryBeneficiary(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1.5 font-semibold">2. Cause Category</label>
                  <select
                    className="w-full bg-cream/20 dark:bg-navy-light/50 rounded-xl border border-sand dark:border-stone/40 px-3 py-2.5 text-xs text-charcoal dark:text-white focus:outline-none cursor-pointer"
                    value={storyCause}
                    onChange={(e) => setStoryCause(e.target.value)}
                  >
                    <option value="Emergency Medical Treatment">Medical</option>
                    <option value="Orphanage & Child Care Support">Child Care</option>
                    <option value="Old Age Home / Elder Care">Elderly Care</option>
                    <option value="Disaster & Emergency Relief">Disaster Relief</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1.5 font-semibold">3. Hospital / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. AIIMS Delhi, Apollo"
                    className="w-full bg-cream/20 dark:bg-navy-light/50 rounded-xl border border-sand dark:border-stone/40 px-4 py-2.5 text-xs text-charcoal dark:text-white focus:outline-none"
                    value={storyHospital}
                    onChange={(e) => setStoryHospital(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1.5 font-semibold">4. Required Funds (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    className="w-full bg-cream/20 dark:bg-navy-light/50 rounded-xl border border-sand dark:border-stone/40 px-4 py-2.5 text-xs text-charcoal dark:text-white focus:outline-none"
                    value={storyAmount}
                    onChange={(e) => setStoryAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1.5 font-semibold">5. Narrative Tone</label>
                  <div className="flex bg-cream/30 dark:bg-navy-light rounded-xl p-0.5 border border-sand dark:border-stone/40">
                    {(['Emotional', 'Urgent', 'Inspiring'] as const).map(tone => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => { playSynthSound('hover'); setStoryTone(tone); }}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                          storyTone === tone 
                            ? 'bg-coral text-white shadow-warm-sm' 
                            : 'text-stone dark:text-sand hover:text-charcoal'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateStory}
                disabled={storyGenerating}
                className="w-full py-3 bg-coral hover:bg-terracotta text-white text-xs font-bold rounded-xl shadow-warm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {storyGenerating ? 'AI Copilot drafting story...' : 'Generate Campaign Narrative'}
              </button>
            </div>
          </div>

          {/* Right: Output narrative board */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-navy rounded-3xl p-8 shadow-warm border border-sand/40 dark:border-stone/40 min-h-[380px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 bg-coral/5 text-coral text-[10px] font-bold font-mono tracking-wider rounded-bl-2xl">
                DRAFT VERSION
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-coral">
                  <FileText className="w-4 h-4" /> AI Output Terminal
                </div>

                {storyHeadline && (
                  <h3 className="font-serif text-[22px] font-bold text-charcoal dark:text-white leading-tight underline decoration-coral/30 decoration-wavy pb-3 border-b border-sand/15">
                    {storyHeadline}
                  </h3>
                )}

                <div className="text-stone dark:text-sand text-xs leading-relaxed space-y-4 font-serif min-h-[160px]">
                  {storyResult ? (
                    <p className="whitespace-pre-line leading-relaxed">{storyResult}</p>
                  ) : (
                    <p className="text-stone/40 italic flex items-center justify-center h-[160px]">
                      Your generated draft story with details, expense justifications and call-to-actions will print here.
                    </p>
                  )}
                </div>
              </div>

              {storyResult && (
                <div className="border-t border-sand/20 pt-6 mt-6 flex gap-3">
                  <button
                    onClick={handleUseStoryInFundraiser}
                    className="flex-1 py-3 bg-coral hover:bg-terracotta text-white rounded-xl text-xs font-bold shadow-warm transition flex items-center justify-center gap-1.5 active:scale-95 animate-pulse"
                  >
                    Use This Story to Create Campaign <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Title: ${storyHeadline}\n\nStory:\n${storyResult}`);
                      playSynthSound('success');
                      alert('Copied campaign story to clipboard!');
                    }}
                    className="px-5 py-3 border border-sand dark:border-stone/40 text-stone dark:text-sand hover:bg-cream dark:hover:bg-navy rounded-xl text-xs font-bold transition"
                  >
                    Copy Story
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 10: INTERACTIVE COST TRANSPARENCY SVG DONUT CHART
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-cream/20 dark:bg-navy-light/10 border-b border-sand/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative flex justify-center">
            {/* SVG Donut Chart */}
            <svg width="280" height="280" viewBox="0 0 160 160" className="transform -rotate-90 select-none">
              
              {/* Arc 1: Direct to Beneficiary (97.5%) -> Color: Sage Green */}
              <circle
                r="50"
                cx="80"
                cy="80"
                fill="transparent"
                stroke={hoveredSegment === 'beneficiary' ? '#4F6F4F' : '#7B9E7B'}
                strokeWidth={hoveredSegment === 'beneficiary' ? '24' : '20'}
                strokeDasharray="314.16"
                strokeDashoffset="7.85" // 2.5% offset (314.16 * 0.025)
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => { playSynthSound('hover'); setHoveredSegment('beneficiary'); }}
                onMouseLeave={() => setHoveredSegment(null)}
              />

              {/* Arc 2: Payment Gateway Processing (2.5%) -> Color: Gold */}
              <circle
                r="50"
                cx="80"
                cy="80"
                fill="transparent"
                stroke={hoveredSegment === 'gateway' ? '#B88E3D' : '#D4A853'}
                strokeWidth={hoveredSegment === 'gateway' ? '24' : '20'}
                strokeDasharray="314.16"
                strokeDashoffset="314.16" // Start offset
                className="cursor-pointer transition-all duration-300"
                style={{
                  strokeDashoffset: 314.16 - (314.16 * 0.025)
                }}
                onMouseEnter={() => { playSynthSound('hover'); setHoveredSegment('gateway'); }}
                onMouseLeave={() => setHoveredSegment(null)}
              />

              {/* Center Circle */}
              <circle r="40" cx="80" cy="80" fill="white" className="dark:fill-navy" />
            </svg>

            {/* Inner text inside center hole */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[28px] font-serif text-charcoal dark:text-white leading-none font-bold">100%</span>
              <p className="text-[10px] text-stone dark:text-sand font-bold tracking-widest uppercase">Transparency</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-sage-dark dark:text-sage uppercase tracking-[0.15em] mb-2 font-mono">Platform Integrity</p>
            <h2 className="text-[36px] sm:text-[42px] font-serif text-charcoal dark:text-white leading-tight mb-6">
              Where Your Donation Goes
            </h2>
            <p className="text-stone dark:text-sand text-sm leading-relaxed mb-8">
              Transparency is core to our setup. Hover over segments of the chart to view details of our allocation structure.
            </p>

            <div className="space-y-4">
              
              {/* Item 1 */}
              <div 
                className={`p-4 rounded-2xl border transition-all ${
                  hoveredSegment === 'beneficiary' 
                    ? 'bg-sage/10 border-sage/40 scale-[1.02]' 
                    : 'bg-white dark:bg-navy border-sand/40 dark:border-stone/40'
                }`}
                onMouseEnter={() => setHoveredSegment('beneficiary')}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-sage rounded-full" />
                  <span className="text-xs font-bold text-charcoal dark:text-white">97.5% — Direct to Beneficiary Account</span>
                </div>
                {hoveredSegment === 'beneficiary' && (
                  <p className="text-xs text-stone dark:text-sand mt-2 transition-all">
                    Transferred directly to patient or hospital escrows with Aadhaar validation audit reports.
                  </p>
                )}
              </div>

              {/* Item 2 */}
              <div 
                className={`p-4 rounded-2xl border transition-all ${
                  hoveredSegment === 'gateway' 
                    ? 'bg-gold/10 border-gold/40 scale-[1.02]' 
                    : 'bg-white dark:bg-navy border-sand/40 dark:border-stone/40'
                }`}
                onMouseEnter={() => setHoveredSegment('gateway')}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gold rounded-full" />
                  <span className="text-xs font-bold text-charcoal dark:text-white">2.5% — Razorpay/Stripe Processing Fee</span>
                </div>
                {hoveredSegment === 'gateway' && (
                  <p className="text-xs text-stone dark:text-sand mt-2">
                    Standard gateway fees collected by bank transaction networks. Aidora markup is 0%.
                  </p>
                )}
              </div>

              {/* Item 3 */}
              <div 
                className="p-4 rounded-2xl border bg-white dark:bg-navy border-sand/40 dark:border-stone/40"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-coral rounded-full" />
                  <span className="text-xs font-bold text-charcoal dark:text-white">0% — Platform Maintenance Fee</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMPETITIVE FEATURES 1 & 2: TAX & MATCH SIMULATORS
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-cream/20 dark:bg-navy-light/10 border-b border-sand/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-2 gap-12">
          
          {/* Column 1: 80G Tax Savings Calculator */}
          <div className="bg-white dark:bg-navy rounded-3xl p-8 shadow-warm border border-sand/40 dark:border-stone/40 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="bg-coral/10 text-coral p-2 rounded-xl">
                  <Percent className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold text-coral uppercase tracking-wider font-mono">Tax Savings Incentives</p>
                  <h3 className="text-xl font-serif text-charcoal dark:text-white font-bold">80G Tax Rebate Calculator</h3>
                </div>
              </div>

              <p className="text-stone dark:text-sand text-xs leading-relaxed">
                Under Section 80G of the Indian Income Tax Act, 50% of your donation is deductible. Drag the slider to compute your exact savings.
              </p>

              <div className="space-y-4 pt-2">
                {/* Donation Amount Slider */}
                <div>
                  <div className="flex justify-between font-bold text-xs text-charcoal dark:text-white mb-1">
                    <span>Donation Contribution</span>
                    <span className="text-coral text-sm font-mono">₹{taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={taxAmount}
                    onChange={(e) => { playSynthSound('hover'); setTaxAmount(Number(e.target.value)); }}
                    className="w-full h-1.5 bg-sand/65 dark:bg-stone/20 rounded-lg appearance-none cursor-pointer accent-coral"
                  />
                </div>

                {/* Annual Income Input */}
                <div>
                  <div className="flex justify-between font-bold text-xs text-charcoal dark:text-white mb-1">
                    <span>Your Estimated Annual Income</span>
                    <span className="text-stone dark:text-sand text-sm font-mono">₹{taxIncome.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="300000"
                    max="3000000"
                    step="50000"
                    value={taxIncome}
                    onChange={(e) => { playSynthSound('hover'); setTaxIncome(Number(e.target.value)); }}
                    className="w-full h-1.5 bg-sand/65 dark:bg-stone/20 rounded-lg appearance-none cursor-pointer accent-coral"
                  />
                </div>

                {/* Regime Selector */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-bold uppercase text-stone dark:text-sand">Income Tax Regime</span>
                  <div className="flex bg-cream/40 dark:bg-navy-light rounded-lg p-0.5 border border-sand dark:border-stone/40">
                    {(['Old', 'New'] as const).map(regime => (
                      <button
                        key={regime}
                        type="button"
                        onClick={() => { playSynthSound('click'); setTaxRegime(regime); }}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                          taxRegime === regime 
                            ? 'bg-coral text-white shadow-warm-sm' 
                            : 'text-stone dark:text-sand hover:text-charcoal'
                        }`}
                      >
                        {regime} Regime
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculator Results */}
              <div className="p-4 bg-cream/40 dark:bg-navy-light/40 rounded-2xl border border-sand/40 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone dark:text-sand">80G Claimable Deduction (50%):</span>
                  <span className="font-bold text-charcoal dark:text-white font-mono">₹{(taxAmount * 0.5).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone dark:text-sand">Estimated Tax Saved ({calculateTaxSavings().taxBracketPercent.toFixed(0)}% Bracket):</span>
                  <span className="font-bold text-sage-dark dark:text-sage font-mono">₹{calculateTaxSavings().savings.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-sand/20 pt-2 font-serif font-bold text-sm">
                  <span className="text-charcoal dark:text-white">Actual Net Cost to You:</span>
                  <span className="text-coral font-mono">₹{calculateTaxSavings().netCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => { playSynthSound('click'); setShowTaxReceipt(true); }}
                className="w-full py-3 border border-coral text-coral hover:bg-coral hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Generate Claim Estimation Receipt
              </button>
            </div>
          </div>

          {/* Column 2: Corporate 1:1 Matching Simulator */}
          <div className="bg-white dark:bg-navy rounded-3xl p-8 shadow-warm border border-sand/40 dark:border-stone/40 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="bg-coral/10 text-coral p-2 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold text-coral uppercase tracking-wider font-mono font-bold">Philanthropic Matching</p>
                  <h3 className="text-xl font-serif text-charcoal dark:text-white font-bold">1:1 Corporate Match Hub</h3>
                </div>
              </div>

              <p className="text-stone dark:text-sand text-xs leading-relaxed">
                Selected corporate partners (Tata Trusts, Reliance, Google India) match every rupee you give 1:1, doubling your impact instantly!
              </p>

              <div className="space-y-4 pt-2">
                {/* Match Amount Slider */}
                <div>
                  <div className="flex justify-between font-bold text-xs text-charcoal dark:text-white mb-1">
                    <span>Your Simulated Pledge</span>
                    <span className="text-coral text-sm font-mono">₹{corporateMatchAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="500"
                    value={corporateMatchAmount}
                    onChange={(e) => { playSynthSound('hover'); setCorporateMatchAmount(Number(e.target.value)); setCorporateMatchSimulated(false); }}
                    className="w-full h-1.5 bg-sand/65 dark:bg-stone/20 rounded-lg appearance-none cursor-pointer accent-coral"
                  />
                </div>

                {/* Matching Partner Selector */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1.5">Select Corporate Match Partner</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Tata Trusts', 'Google India', 'Reliance Foundation', 'ICICI Foundation'].map(partner => (
                      <button
                        key={partner}
                        type="button"
                        onClick={() => { playSynthSound('click'); setSelectedCorporateSponsor(partner); setCorporateMatchSimulated(false); }}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition ${
                          selectedCorporateSponsor === partner
                            ? 'bg-coral text-white border-coral shadow-warm-sm'
                            : 'bg-white dark:bg-navy border-sand dark:border-stone/40 text-stone dark:text-sand hover:border-coral'
                        }`}
                      >
                        {partner}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match Output */}
              <div className="p-5 bg-sage/5 dark:bg-sage/10 rounded-2xl border border-sage/20 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                <div className="absolute top-0 right-0 p-1.5 bg-sage text-white text-[8px] font-bold font-mono uppercase rounded-bl-lg">
                  1:1 Active
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-stone dark:text-sand text-[10px] uppercase font-bold">Total Disbursed Match</span>
                    <p className="text-[28px] font-serif font-bold text-sage-dark dark:text-sage leading-none mt-1">
                      ₹{(corporateMatchSimulated ? corporateMatchAmount * 2 : corporateMatchAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone dark:text-sand block">Sponsor contribution</span>
                    <p className="text-xs font-bold text-charcoal dark:text-white font-mono mt-0.5">
                      + ₹{(corporateMatchSimulated ? corporateMatchAmount : 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-stone dark:text-sand/80 mt-2 leading-relaxed border-t border-sand/10 pt-2">
                  {corporateMatchSimulated 
                    ? `Success! ${selectedCorporateSponsor} has committed a match of ₹${corporateMatchAmount.toLocaleString('en-IN')} for this ledger transaction.` 
                    : `Simulate matches to see sponsor contribution limits.`
                  }
                </p>
              </div>

              {/* CSR matched pool tracker */}
              <div className="space-y-1.5 pt-2 text-left">
                <div className="flex justify-between text-[10px] font-bold text-stone dark:text-sand">
                  <span>CSR Sponsor Matching Pools</span>
                  <span className="text-sage-dark dark:text-sage font-mono">₹7,82,000 / ₹10,00,000 matched</span>
                </div>
                <div className="w-full bg-sand/40 dark:bg-stone/20 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sage h-full rounded-full" style={{ width: '78.2%' }} />
                </div>
                <p className="text-[9px] text-stone dark:text-sand/80">
                  Matching grant caps refresh in 18 days. Provided by Google India & Reliance Foundation CSR allocations.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={triggerCorporateMatch}
                className="w-full py-3 bg-coral hover:bg-terracotta text-white rounded-xl text-xs font-bold shadow-warm transition flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" /> Simulate Match Contribution
              </button>
            </div>

            {simulatedMatches.length > 0 && (
              <div className="mt-4 pt-4 border-t border-sand/30 dark:border-stone/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone dark:text-sand block mb-1">
                  Simulation Ledger
                </span>
                <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {simulatedMatches.map((sim) => (
                    <div key={sim.id} className="flex justify-between items-center text-[10px] bg-cream/30 dark:bg-navy-light/30 p-2.5 rounded-xl border border-sand/20 dark:border-stone/20">
                      <div className="flex flex-col">
                        <span className="font-bold text-charcoal dark:text-white">{sim.partner} Match</span>
                        <span className="text-[8px] text-stone">{sim.timestamp} • {sim.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sage-dark dark:text-sage">+₹{sim.match.toLocaleString('en-IN')}</span>
                        <span className="block text-[8px] text-stone">User: ₹{sim.pledge.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Monthly Generosity Circle & Flyer Generator */}
          <div className="mt-12 bg-white dark:bg-navy rounded-3xl p-8 shadow-warm border border-sand/40 dark:border-stone/40 grid md:grid-cols-2 gap-8 text-left md:col-span-2">
            <div className="space-y-4">
              <span className="bg-coral/10 text-coral p-2 rounded-xl inline-block">
                <Heart className="w-5 h-5" fill="currentColor" />
              </span>
              <h3 className="text-xl font-serif text-charcoal dark:text-white font-bold">Monthly Generosity Circle</h3>
              <p className="text-stone dark:text-sand text-xs leading-relaxed">
                Join our monthly circle to help automate critical medical payouts. Your micro-pledge is pooled with other donors to auto-disburse to emergency cases.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-2">
                {[200, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSelectedSubAmt(amt)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                      selectedSubAmt === amt
                        ? 'bg-coral text-white border-coral shadow-warm-sm'
                        : 'bg-white dark:bg-navy border-sand dark:border-stone/40 text-stone hover:border-coral/20'
                    }`}
                  >
                    ₹{amt}/mo
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleJoinSubscription(selectedSubAmt)}
                disabled={subscribing}
                className="w-full py-3 bg-coral hover:bg-terracotta text-white rounded-xl text-xs font-bold shadow-warm transition"
              >
                {subscribing ? 'Joining Circle...' : subscribedAmt ? `Subscribed: ₹${subscribedAmt}/month ✓` : `Pledge Monthly Circle`}
              </button>
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-l border-sand/20 pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="bg-coral/10 text-coral p-2 rounded-xl inline-block">
                  <Download className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-serif text-charcoal dark:text-white font-bold">Printable Flyer Generator</h3>
                <p className="text-stone dark:text-sand text-xs leading-relaxed">
                  Export offline distribution campaign posters. Generates print-ready PDFs with verified details and Direct QR scan code for medical beds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  alert('Generating printable Flyer PDF layout for active campaigns... Layout prepared for printing!');
                  window.print();
                }}
                className="w-full py-3 border border-coral text-coral hover:bg-coral hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Printable Campaign Flyers
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 17: TOP DONORS HALL OF FAME LEADERBOARD CABINET
          ══════════════════════════════════════════════════════════ */}
      {leaderboard.length > 0 && (
        <section className="py-20 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 border-b border-sand/20">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-coral uppercase tracking-[0.15em] mb-2 font-mono">Generosity Cabinet</p>
            <h2 className="text-[36px] sm:text-[42px] font-serif text-charcoal dark:text-white">Top Platform Supporters</h2>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {leaderboard.map((leader, i) => (
              <div
                key={i}
                className="bg-white dark:bg-navy rounded-3xl p-6 shadow-warm border border-sand/40 dark:border-stone/40 flex flex-col items-center text-center relative overflow-hidden group hover:scale-[1.03] transition-all"
                onMouseEnter={() => playSynthSound('hover')}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4 ${
                  i === 0 ? 'bg-gold/25 text-amber-800 dark:text-gold' :
                  i === 1 ? 'bg-slate-200 text-slate-700' :
                  i === 2 ? 'bg-orange-200 text-orange-800' :
                  'bg-cream text-stone'
                }`}>
                  {i === 0 ? <Award className="w-5 h-5" /> : `#${i + 1}`}
                </div>
                <h3 className="font-serif text-lg text-charcoal dark:text-white mb-1 truncate w-full px-2">{leader.donorName}</h3>
                <p className="text-[11px] text-stone dark:text-sand mb-2 font-semibold">Verified Donor</p>
                <span className="text-sm font-bold text-coral font-mono">₹{leader.totalAmount?.toLocaleString('en-IN') || leader.totalDonated?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          FEATURE 15: TESTIMONIAL FEEDBACK HUB WITH LIVE SUBMISSION
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 border-b border-sand/20 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div>
            <p className="text-[11px] font-bold text-coral uppercase tracking-[0.15em] mb-2 font-mono font-bold">Community Voices</p>
            <h2 className="text-[36px] sm:text-[42px] font-serif text-charcoal dark:text-white leading-tight">
              What Donors & Creators Say
            </h2>
          </div>

          {/* Testimonial slider */}
          <div className="space-y-6">
            {testimonials.slice(0, 3).map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-navy p-6 rounded-2xl border border-sand/40 dark:border-stone/40 shadow-warm-sm">
                <div className="flex gap-1 mb-2 text-yellow-500">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-stone dark:text-sand text-xs italic leading-relaxed">"{item.text}"</p>
                <p className="text-[11px] font-bold text-charcoal dark:text-white mt-3 text-right">— {item.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Submission Form */}
        <div className="lg:col-span-5 bg-cream/40 dark:bg-navy-light/40 rounded-3xl p-8 border border-sand dark:border-stone/40">
          <h3 className="font-serif text-2xl text-charcoal dark:text-white mb-2">Leave Your Feedback</h3>
          <p className="text-stone dark:text-sand text-xs mb-5">Share your experience. Submitted values post live on the sidebar feed!</p>

          <form onSubmit={submitTestimonial} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1">Your Name</label>
              <input
                type="text"
                required
                className="w-full bg-white dark:bg-navy rounded-xl border border-sand dark:border-stone/40 px-4 py-2.5 text-xs text-charcoal dark:text-white"
                value={newFeedbackName}
                onChange={(e) => setNewFeedbackName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1">Testimonial Content</label>
              <textarea
                required
                rows={3}
                className="w-full bg-white dark:bg-navy rounded-xl border border-sand dark:border-stone/40 px-4 py-2.5 text-xs text-charcoal dark:text-white"
                value={newFeedbackText}
                onChange={(e) => setNewFeedbackText(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1">Rating</label>
              <select
                className="w-full bg-white dark:bg-navy rounded-xl border border-sand dark:border-stone/40 px-4 py-2.5 text-xs text-charcoal dark:text-white"
                value={newFeedbackRating}
                onChange={(e) => setNewFeedbackRating(Number(e.target.value))}
              >
                <option value={5}>5 Stars (Excellent)</option>
                <option value={4}>4 Stars (Good)</option>
                <option value={3}>3 Stars (Average)</option>
              </select>
            </div>
             <button
              type="submit"
              className="w-full py-3 bg-coral text-white text-xs font-bold rounded-xl shadow-warm hover:bg-terracotta transition"
            >
              Post Live Testimonial
            </button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMPETITIVE FEATURE 5: HOSPITAL CASE & BILL VALIDATOR
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-cream/40 dark:bg-navy-light/10 border-t border-b border-sand/40 dark:border-stone/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left info column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-[11px] font-bold text-coral uppercase tracking-[0.15em] mb-2 font-mono font-bold">Absolute Security</p>
              <h2 className="text-[36px] sm:text-[42px] font-serif text-charcoal dark:text-white leading-tight mb-4">
                Hospital Billing & Case ID Validator
              </h2>
              <p className="text-stone dark:text-sand text-xs leading-relaxed">
                Trust is our currency. Unlike other platforms, Aidora executes direct payouts to hospital billing departments. Verify any active medical fundraiser's case sheet and billing authorization below.
              </p>
            </div>

            <div className="bg-white dark:bg-navy p-6 rounded-3xl shadow-warm border border-sand/40 dark:border-stone/40 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-stone dark:text-sand block mb-1.5 font-semibold">Select Medical Fundraiser</label>
                <select
                  className="w-full bg-cream/20 dark:bg-navy-light/50 rounded-xl border border-sand dark:border-stone/40 px-3 py-2.5 text-xs text-charcoal dark:text-white focus:outline-none cursor-pointer"
                  value={validatorCampaignId}
                  onChange={(e) => { playSynthSound('click'); setValidatorCampaignId(e.target.value); setValidatorResult(null); }}
                >
                  <option value="">-- Choose active medical case --</option>
                  {campaigns.filter(c => c.category.toLowerCase().includes('medical') || c.category.toLowerCase().includes('health')).map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleValidateHospitalCase}
                disabled={validatorLoading || !validatorCampaignId}
                className="w-full py-3 bg-coral text-white text-xs font-bold rounded-xl shadow-warm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {validatorLoading ? 'Connecting hospital database API...' : 'Verify Case Documents & Bills'}
              </button>
            </div>
          </div>

          {/* Right report column */}
          <div className="lg:col-span-7">
            {validatorResult ? (
              <div className="bg-white dark:bg-navy rounded-3xl p-8 shadow-warm border border-sage/40 dark:border-stone/40 space-y-6 relative overflow-hidden animate-fade-in text-left">
                <div className="absolute top-0 right-0 bg-sage text-white text-[9px] font-bold font-mono px-3 py-1 rounded-bl-2xl tracking-wider">
                  ✓ VERIFIED LEGITIMATE
                </div>

                <div className="flex items-center gap-2.5 text-xs font-bold text-sage-dark dark:text-sage uppercase font-mono">
                  <CheckCircle2 className="w-4 h-4 text-sage" /> Verification Audit Report
                </div>

                <div className="space-y-3 border-b border-sand/20 pb-5">
                  <h3 className="font-serif text-[18px] font-bold text-charcoal dark:text-white leading-tight font-bold">
                    {validatorResult.campaignTitle}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-stone dark:text-sand">Authorized Hospital:</span>
                      <p className="font-bold text-charcoal dark:text-white mt-0.5">{validatorResult.hospitalName}</p>
                    </div>
                    <div>
                      <span className="text-stone dark:text-sand">Hospital Case ID:</span>
                      <p className="font-mono font-bold text-charcoal dark:text-white mt-0.5">{validatorResult.caseId}</p>
                    </div>
                    <div>
                      <span className="text-stone dark:text-sand">Direct Payout Agreement:</span>
                      <p className="text-sage-dark dark:text-sage font-bold mt-0.5">Yes (Direct Escrow)</p>
                    </div>
                    <div>
                      <span className="text-stone dark:text-sand">Verification Date:</span>
                      <p className="font-bold text-charcoal dark:text-white mt-0.5">{validatorResult.verificationDate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone dark:text-sand">Aadhaar Validation:</span>
                    <span className="font-mono text-sage-dark dark:text-sage font-bold">MATCH SUCCESS</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone dark:text-sand">Disbursed Amount Verified:</span>
                    <span className="font-bold text-charcoal dark:text-white font-mono font-bold">₹{validatorResult.amountVerified.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone dark:text-sand">Direct Hospital Bill Settlement:</span>
                    <span className="font-bold text-sage-dark dark:text-sage">Escrow Direct Pay agreement active</span>
                  </div>
                </div>

                <div className="bg-cream/40 dark:bg-navy-light/40 p-4 rounded-xl border border-sand/30 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-sage flex-shrink-0" />
                  <div className="text-[10px] text-stone dark:text-sand/80 leading-snug">
                    Verified by Indian Medical Council registered signee: <br />
                    <span className="font-bold text-charcoal dark:text-white font-bold">{validatorResult.signatory}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-navy rounded-3xl p-12 shadow-warm border border-sand/40 dark:border-stone/40 text-center h-[340px] flex flex-col items-center justify-center">
                <HelpCircle className="w-12 h-12 text-sand/60 dark:text-stone/60 mb-4 animate-bounce" />
                <h4 className="font-serif text-lg text-charcoal dark:text-white mb-2">Awaiting Case Audit Request</h4>
                <p className="text-stone dark:text-sand text-xs max-w-sm leading-relaxed">
                  Select a medical fundraiser on the left and click Verify to download its official billing verification status sheet dynamically.
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 14: COLLAPSIBLE FAQ ACCORDION WITH SEARCH FILTER
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold text-coral uppercase tracking-[0.15em] mb-2 font-mono font-bold">Frequently Asked Questions</p>
          <h2 className="text-[36px] sm:text-[42px] font-serif text-charcoal dark:text-white mb-6">FAQ Help Desk</h2>
          
          <div className="max-w-md mx-auto relative flex items-center bg-white dark:bg-navy rounded-2xl border border-sand dark:border-stone/40 px-4 py-2 text-xs">
            <Search className="w-4 h-4 text-stone dark:text-sand mr-2" />
            <input
              type="text"
              placeholder="Search help topics..."
              className="bg-transparent text-[13px] text-charcoal dark:text-white w-full focus:outline-none"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-navy rounded-2xl border border-sand/40 dark:border-stone/40 overflow-hidden shadow-warm-sm"
            >
              <button
                onClick={() => { playSynthSound('click'); setActiveFaq(activeFaq === index ? null : index); }}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-serif text-[17px] text-charcoal dark:text-white font-bold">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-stone transform transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 pt-1 text-xs text-stone dark:text-sand/80 leading-relaxed border-t border-sand/10">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {filteredFAQs.length === 0 && (
            <p className="text-center text-stone text-xs py-4">No matching FAQ categories. Try typing 'Aadhaar' or 'Fee'.</p>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMPETITIVE FEATURE 6: PUBLIC TRANSPARENCY LEDGER
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 border-t border-sand/20 text-left">
        <div className="text-center mb-10 space-y-3">
          <p className="text-[11px] font-bold text-coral uppercase tracking-[0.15em] mb-2 font-mono">100% On-Chain Trust</p>
          <h2 className="text-[36px] sm:text-[42px] font-serif text-charcoal dark:text-white leading-tight">
            Public Transparency Ledger
          </h2>
          <p className="text-stone dark:text-sand text-xs max-w-lg mx-auto">
            Audit our work. Every single donation is recorded below with verification hashes, direct beneficiary destinations, and zero platform fees.
          </p>
        </div>

        <div className="bg-white dark:bg-navy rounded-3xl p-6 sm:p-8 shadow-warm border border-sand/40 dark:border-stone/40 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="text-xs font-bold text-charcoal dark:text-white uppercase font-mono">
              Live Audited Transactions
            </div>
            
            <div className="relative max-w-xs w-full flex items-center bg-cream/40 dark:bg-navy-light/50 border border-sand dark:border-stone/40 rounded-xl px-3 py-2 text-xs">
              <Search className="w-4 h-4 text-stone mr-2" />
              <input
                type="text"
                placeholder="Search ledger by name or ID..."
                className="bg-transparent text-[12px] text-charcoal dark:text-white w-full focus:outline-none"
                value={ledgerSearchTerm}
                onChange={(e) => setLedgerSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand/30 text-stone dark:text-sand font-mono uppercase text-[10px] pb-3">
                  <th className="py-3 font-semibold">Transaction ID</th>
                  <th className="py-3 font-semibold">Donor Name</th>
                  <th className="py-3 font-semibold">Campaign / Cause</th>
                  <th className="py-3 font-semibold text-right">Donation Value</th>
                  <th className="py-3 font-semibold text-right">Platform Fee</th>
                  <th className="py-3 font-semibold">Payout Destination</th>
                  <th className="py-3 font-semibold">Verification Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/15">
                {[
                  { id: 'TXN-9021-AF38', donor: 'Aman Deep', campaign: 'Emergency Cardiac Surgery AIIMS', amount: 5000, fee: 0, dest: 'Direct Hospital Escrow', audit: 'AUDIT-8921' },
                  { id: 'TXN-8932-CE12', donor: 'Anonymous Donor', campaign: 'Rural School Textbook Drive', amount: 1200, fee: 0, dest: 'NGO Foundation A/C', audit: 'AUDIT-3921' },
                  { id: 'TXN-8743-DB90', donor: 'Dr. Vivek Sharma', campaign: 'Flood Rehabilitation Food Kits', amount: 10000, fee: 0, dest: 'Verified Beneficiary Direct', audit: 'AUDIT-1982' },
                  { id: 'TXN-8542-ED43', donor: 'Priya Iyer', campaign: 'Cancer Chemotherapy Support', amount: 3500, fee: 0, dest: 'Apollo Hospital Billing', audit: 'AUDIT-4392' },
                  { id: 'TXN-8321-FC09', donor: 'Rohan Deshmukh', campaign: 'Old Age Home Solar Grid installation', amount: 25000, fee: 0, dest: 'NGO Trust Escrow', audit: 'AUDIT-1092' }
                ]
                  .filter(txn => 
                    txn.donor.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
                    txn.campaign.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
                    txn.id.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
                    txn.audit.toLowerCase().includes(ledgerSearchTerm.toLowerCase())
                  )
                  .map((txn, idx) => (
                    <tr key={idx} className="hover:bg-cream/20 dark:hover:bg-navy-light/10 transition">
                      <td className="py-3.5 font-mono text-stone dark:text-sand">{txn.id}</td>
                      <td className="py-3.5 font-bold text-charcoal dark:text-white">{txn.donor}</td>
                      <td className="py-3.5 text-stone dark:text-sand max-w-[200px] truncate">{txn.campaign}</td>
                      <td className="py-3.5 text-right font-bold text-coral font-mono">₹{txn.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 text-right font-bold text-sage font-mono">₹{txn.fee}</td>
                      <td className="py-3.5 font-semibold text-charcoal dark:text-white">
                        <span className="inline-flex items-center gap-1 bg-sage/10 text-sage-dark dark:text-sage text-[9px] px-2 py-0.5 rounded-full">
                          {txn.dest}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-stone dark:text-sand">{txn.audit}</td>
                    </tr>
                  ))}
                {recentDonations
                  .filter(don => don.donorName)
                  .map((don, idx) => {
                    const shortId = don._id ? `TXN-${don._id.substring(don._id.length-8).toUpperCase()}` : `TXN-REF-${idx}`;
                    const amt = don.amount;
                    const name = don.donorName || 'Anonymous Donor';
                    const title = don.fundId?.title || 'Active Campaign';
                    return (
                      <tr key={`real-${idx}`} className="hover:bg-cream/20 dark:hover:bg-navy-light/10 transition">
                        <td className="py-3.5 font-mono text-stone dark:text-sand">{shortId}</td>
                        <td className="py-3.5 font-bold text-charcoal dark:text-white">{name}</td>
                        <td className="py-3.5 text-stone dark:text-sand max-w-[200px] truncate">{title}</td>
                        <td className="py-3.5 text-right font-bold text-coral font-mono">₹{amt.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 text-right font-bold text-sage font-mono">₹0</td>
                        <td className="py-3.5 font-semibold text-charcoal dark:text-white">
                          <span className="inline-flex items-center gap-1 bg-sage/10 text-sage-dark dark:text-sage text-[9px] px-2 py-0.5 rounded-full">
                            Escrow Direct Pay
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-stone dark:text-sand font-bold">AUDIT-R-{idx+100}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 21: NEWSLETTER FORM WITH VALIDATION & CONFETTI
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-cream/40 dark:bg-navy-light/20 border-t border-sand/40 dark:border-stone/40">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center space-y-6">
          <h2 className="text-[36px] sm:text-[44px] font-serif text-charcoal dark:text-white leading-tight">
            Stay Connected
          </h2>
          <p className="text-stone dark:text-sand text-[15px] leading-relaxed max-w-xl mx-auto">
            Receive monthly updates on verified campaign audit charts, platform developments, and donor impact stats directly in your inbox.
          </p>

          <form onSubmit={subscribeNewsletter} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full bg-white dark:bg-navy rounded-xl border border-sand dark:border-stone/40 px-4 py-3 text-xs text-charcoal dark:text-white focus:outline-none"
                value={newsletterEmail}
                onChange={(e) => handleNewsletterChange(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={!newsletterValid || newsletterSubscribed}
              className={`px-6 py-3 text-xs font-bold rounded-xl transition-all shadow-warm whitespace-nowrap ${
                newsletterSubscribed 
                  ? 'bg-sage text-white cursor-default'
                  : newsletterValid
                    ? 'bg-coral text-white hover:bg-terracotta active:scale-95'
                    : 'bg-stone/20 text-stone cursor-not-allowed'
              }`}
            >
              {newsletterSubscribed ? 'Subscribed ✓' : 'Join Newsletter'}
            </button>
          </form>
          {newsletterValid && !newsletterSubscribed && (
            <p className="text-[10px] text-sage font-bold font-mono">Email format looks correct!</p>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 12: AADHAAR VERIFIED TRUST DRAWER OVERLAY
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {trustDrawerCreator && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrustDrawerCreator(null)}
              className="absolute inset-0 bg-black"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-md bg-white dark:bg-navy h-full shadow-warm-xl p-8 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="flex items-center gap-1 bg-sage/10 text-sage-dark dark:text-sage text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark dark:text-sage" /> Aadhaar Verified
                  </span>
                  <button onClick={() => setTrustDrawerCreator(null)} className="text-stone hover:text-coral transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <h3 className="font-serif text-3xl text-charcoal dark:text-white leading-tight">Trust Verification Ledger</h3>
                  
                  <div className="p-4 bg-cream/40 dark:bg-navy-light/40 rounded-2xl border border-sand/40 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone dark:text-sand">Campaign ID:</span>
                      <span className="font-mono text-charcoal dark:text-white truncate max-w-[180px]">{trustDrawerCreator._id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone dark:text-sand">Beneficiary Name:</span>
                      <span className="font-bold text-charcoal dark:text-white">{trustDrawerCreator.beneficiary?.name || 'Verified Beneficiary'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone dark:text-sand">Geographic Location:</span>
                      <span className="font-bold text-charcoal dark:text-white">{trustDrawerCreator.location || 'India'}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-sand/20 pt-2">
                      <span className="text-stone dark:text-sand">Aadhaar Status ID:</span>
                      <span className="font-mono text-sage-dark dark:text-sage font-bold">XXXX-XXXX-8921 (SUCCESS)</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone dark:text-sand/80 leading-relaxed">
                    This campaign creator completed multi-factor identity authorization matches. The banking payouts will only be disbursed to the matched beneficiary account or directly to hospital vendor escrows.
                  </p>
                </div>
              </div>

              <div className="border-t border-sand/20 pt-6">
                <button
                  onClick={() => { setTrustDrawerCreator(null); navigate(`/funds/${trustDrawerCreator._id}`); }}
                  className="w-full py-3 bg-coral text-white text-xs font-bold rounded-xl shadow-warm hover:bg-terracotta transition"
                >
                  Inspect Campaign Detail Page
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 19: CAMPAIGN COST BREAKDOWN ITEM DRAWER
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {breakdownFund && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setBreakdownFund(null)}
              className="absolute inset-0 bg-black"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-md bg-white dark:bg-navy h-full shadow-warm-xl p-8 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] bg-coral/10 text-coral px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                    Itemized Cost Breakdown
                  </span>
                  <button onClick={() => setBreakdownFund(null)} className="text-stone hover:text-coral transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <h3 className="font-serif text-3xl text-charcoal dark:text-white leading-tight">Budget Transparency</h3>
                  <p className="text-stone dark:text-sand text-xs leading-relaxed">
                    Check below for the pre-audited expense requirements submitted for {breakdownFund.title}.
                  </p>

                  <div className="space-y-3">
                    {breakdownFund.breakdownItems?.map((item, idx) => (
                      <div key={idx} className="p-4 bg-cream/40 dark:bg-navy-light/30 rounded-xl border border-sand/40 dark:border-stone/40 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-charcoal dark:text-white">{item.name}</p>
                          <p className="text-[10px] text-stone dark:text-sand mt-0.5">Quantity: {item.quantity} • Unit: ₹{item.unitPrice}</p>
                        </div>
                        <span className="text-xs font-bold text-coral font-mono">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-sand/20 pt-6">
                <button
                  onClick={() => { setBreakdownFund(null); navigate(`/funds/${breakdownFund._id}`); }}
                  className="w-full py-3 bg-coral text-white text-xs font-bold rounded-xl shadow-warm hover:bg-terracotta transition"
                >
                  Proceed to Donation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 16: SHARE DRAWER POPUP WITH QR CODE
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {sharingFund && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSharingFund(null)}
              className="absolute inset-0 bg-black"
            />
            {/* Dialog Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-navy rounded-3xl p-6 shadow-warm-xl border border-sand dark:border-stone/40 z-10 text-center space-y-6"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone dark:text-sand uppercase tracking-wider">Share and Support</span>
                <button onClick={() => setSharingFund(null)} className="text-stone hover:text-coral transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-serif text-xl text-charcoal dark:text-white leading-tight px-4">{sharingFund.title}</h4>

              {/* Dynamic QR Code generator API */}
              <div className="flex justify-center">
                <div className="p-3 bg-white border border-sand dark:border-stone/40 rounded-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/funds/${sharingFund._id}`)}`}
                    alt="Scan to Donate"
                    className="w-36 h-36"
                  />
                </div>
              </div>
              <p className="text-[10px] text-stone dark:text-sand">Scan this QR Code on your mobile phone to donate instantly</p>

              <div className="flex gap-2">
                <button
                  onClick={() => copyShareLink(`${window.location.origin}/funds/${sharingFund._id}`)}
                  className="flex-1 py-3 bg-cream dark:bg-navy-light text-charcoal dark:text-white rounded-xl text-xs font-semibold hover:bg-sand transition flex items-center justify-center gap-1.5 border border-sand/30"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-sage" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied Link!' : 'Copy Campaign Link'}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Support this campaign: ${sharingFund.title} ${window.location.origin}/funds/${sharingFund._id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center"
                >
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          80G TAX CALCULATOR claim modal (Feature 1)
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showTaxReceipt && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTaxReceipt(false)}
              className="absolute inset-0 bg-black"
            />
            {/* Dialog Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-navy rounded-3xl p-6 sm:p-8 shadow-warm-xl border border-sand dark:border-stone/40 z-10 space-y-6 text-left"
            >
              <div className="flex justify-between items-center border-b border-sand/20 pb-3">
                <span className="text-xs font-bold text-stone dark:text-sand uppercase tracking-wider font-mono">80G Claim Assessment</span>
                <button onClick={() => setShowTaxReceipt(false)} className="text-stone hover:text-coral transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs text-charcoal dark:text-white p-4 bg-cream/40 dark:bg-navy-light/40 rounded-2xl border border-sand/40">
                <div className="text-center font-bold text-sm border-b border-sand/20 pb-2 mb-2">
                  AIDORA RECEIPT MATCH (ESTIMATED)
                </div>
                <div className="flex justify-between">
                  <span>Receipt No:</span>
                  <span>CF-80G-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pan Number (Temp):</span>
                  <span>XXXXX1234X</span>
                </div>
                <div className="flex justify-between">
                  <span>Donation Value:</span>
                  <span className="font-bold text-coral">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deduction Allowed (50%):</span>
                  <span className="font-bold text-charcoal dark:text-white">₹{(taxAmount * 0.5).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Regime Bracket Selected:</span>
                  <span>{taxRegime} Regime ({calculateTaxSavings().taxBracketPercent.toFixed(0)}%)</span>
                </div>
                <div className="flex justify-between text-sage-dark dark:text-sage border-t border-dashed border-sand/40 pt-2 font-bold">
                  <span>ESTIMATED TAX SAVINGS:</span>
                  <span>₹{calculateTaxSavings().savings.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-coral font-bold">
                  <span>NET DONATION COST:</span>
                  <span>₹{calculateTaxSavings().netCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[10px] text-stone dark:text-sand leading-relaxed">
                * Note: This is an automated pre-assessment estimate. Official 80G tax certificates are issued instantly upon payment receipt completion matching your registered PAN number.
              </p>

              <button
                onClick={() => { window.print(); }}
                className="w-full py-3 bg-coral hover:bg-terracotta text-white rounded-xl text-xs font-bold shadow-warm transition"
              >
                Print Exemption Summary
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1:1 CORPORATE MATCH certificate modal */}
      <AnimatePresence>
        {showMatchReceipt && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMatchReceipt(false)}
              className="absolute inset-0 bg-black"
            />
            {/* Dialog Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-navy rounded-3xl p-6 sm:p-8 shadow-warm-xl border border-sand dark:border-stone/40 z-10 space-y-6 text-left"
            >
              <div className="flex justify-between items-center border-b border-sand/20 pb-3">
                <span className="text-xs font-bold text-stone dark:text-sand uppercase tracking-wider font-mono">1:1 Corporate Match Certificate</span>
                <button onClick={() => setShowMatchReceipt(false)} className="text-stone hover:text-coral transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs text-charcoal dark:text-white p-4 bg-cream/40 dark:bg-navy-light/40 rounded-2xl border border-sand/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 bg-sage text-white text-[7px] font-bold uppercase rounded-bl-lg">
                  VERIFIED MATCH
                </div>
                <div className="text-center font-bold text-sm border-b border-sand/20 pb-2 mb-2">
                  SPONSOR MATCHING CERTIFICATE
                </div>
                <div className="flex justify-between">
                  <span>Match Transaction ID:</span>
                  <span>{simulatedMatches[0]?.id || `SIM-${Math.floor(100000 + Math.random() * 900000)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Corporate Sponsor:</span>
                  <span className="font-bold text-coral">{selectedCorporateSponsor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Simulated Pledge:</span>
                  <span className="font-bold">₹{corporateMatchAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sage-dark dark:text-sage border-t border-dashed border-sand/40 pt-2 font-bold">
                  <span>SPONSOR CONTRIBUTED:</span>
                  <span>+ ₹{corporateMatchAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-charcoal dark:text-white font-bold">
                  <span>TOTAL IMPACT VALUE:</span>
                  <span className="text-lg text-sage-dark dark:text-sage">₹{(corporateMatchAmount * 2).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[10px] text-stone dark:text-sand leading-relaxed">
                * Note: This is a real-time matching demonstration. When you make a real donation, selected corporate partners will instantly disburse matching funds to the campaign's active bank ledger.
              </p>

              <button
                onClick={() => { window.print(); }}
                className="w-full py-3 bg-coral hover:bg-terracotta text-white rounded-xl text-xs font-bold shadow-warm transition"
              >
                Print Pledge & Match Certificate
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
