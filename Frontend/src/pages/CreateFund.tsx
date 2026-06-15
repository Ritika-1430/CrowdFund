import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { fundApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { FileText, Tag, IndianRupee, User, MapPin, AlertTriangle, Sparkles, ArrowRight, Upload, X, Image } from 'lucide-react';

const categories = [
  'Orphanage & Child Care Support',
  'Old Age Home / Elder Care',
  'Emergency Medical Treatment',
  'Physical Disability Support',
  'Women Healthcare & Maternity Support',
  'Disaster & Emergency Relief',
];

const schema = yup.object({
  title: yup.string().required('Title is required'),
  category: yup.string().required('Category is required'),
  description: yup.string(),
  targetAmount: yup.number().positive('Must be positive').required('Target amount is required'),
  beneficiaryName: yup.string(),
  beneficiaryContact: yup.string(),
  beneficiaryRelation: yup.string(),
  address: yup.string(),
  city: yup.string(),
  state: yup.string(),
  country: yup.string(),
  pincode: yup.string(),
  emergency: yup.boolean(),
});

const CreateFund = () => {
  const { user, loading: authLoading } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const titleDraft = params.get('titleDraft');
    const storyDraft = params.get('storyDraft');
    const categoryDraft = params.get('categoryDraft');
    const amountDraft = params.get('amountDraft');
    const emergencyDraft = params.get('emergencyDraft');

    if (titleDraft) setValue('title', titleDraft);
    if (storyDraft) setValue('description', storyDraft);
    if (categoryDraft) setValue('category', categoryDraft);
    if (amountDraft) setValue('targetAmount', Number(amountDraft));
    if (emergencyDraft === 'true') setValue('emergency', true);
  }, [setValue]);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Pre-verified registry states
  const [registryId, setRegistryId] = useState('');
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryDetails, setRegistryDetails] = useState<any | null>(null);
  const [registryError, setRegistryError] = useState('');

  // AI helper states
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiGrade, setAiGrade] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  
  const [translateLang, setTranslateLang] = useState('Hindi');
  const [translating, setTranslating] = useState(false);

  const handlePreVerifyRegistry = async () => {
    if (!registryId.trim()) return;
    setRegistryLoading(true);
    setRegistryError('');
    setRegistryDetails(null);
    try {
      const res = await fundApi.preVerify(registryId);
      if (res.data && res.data.details) {
        const det = res.data.details;
        setRegistryDetails(det);
        setValue('title', `Medical Fund for ${det.patientName} - ${det.cause}`);
        setValue('beneficiaryName', det.patientName);
        setValue('beneficiaryRelation', 'Other');
        setValue('targetAmount', det.targetAmount);
        setValue('category', 'Emergency Medical Treatment');
        setValue('city', det.location.split(',')[0]);
        setValue('state', det.location.split(',')[1]?.trim() || '');
        setValue('country', 'India');
      }
    } catch (err: any) {
      setRegistryError(err.response?.data?.error || 'Registry file not found.');
    } finally {
      setRegistryLoading(false);
    }
  };

  const handleAiOptimize = async (descText: string) => {
    if (!descText || !descText.trim()) {
      alert('Please enter a description draft first.');
      return;
    }
    setAiOptimizing(true);
    try {
      const res = await fundApi.optimize({ title: 'Draft', description: descText });
      setAiScore(res.data.score);
      setAiGrade(res.data.grade);
      setAiSuggestions(res.data.suggestions);
    } catch (_) {
      alert('Failed to connect to AI analyzer service.');
    } finally {
      setAiOptimizing(false);
    }
  };

  const handleTranslateDescription = async (descText: string, titleText: string) => {
    if (!descText || !descText.trim()) {
      alert('Please enter a description draft first.');
      return;
    }
    setTranslating(true);
    try {
      const res = await fundApi.translate({ title: titleText || 'Draft', description: descText, targetLanguage: translateLang });
      setValue('description', res.data.translatedDescription);
      setValue('title', res.data.translatedTitle);
    } catch (_) {
      alert('Failed to translate campaign.');
    } finally {
      setTranslating(false);
    }
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDetectedCoords({ lat: latitude, lon: longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (!res.ok) throw new Error('OSM geocoding failed');
          const data = await res.json();
          const addr = data.address || {};
          
          const road = addr.road || addr.suburb || addr.neighbourhood || '';
          const village = addr.village || addr.suburb || '';
          const streetAddress = [road, village].filter(Boolean).join(', ') || 'GPS Detected Location';
          const cityValue = addr.city || addr.town || addr.municipality || addr.county || '';
          const stateValue = addr.state || '';
          const countryValue = addr.country || 'India';
          const postcodeValue = addr.postcode || '';

          setValue('address', streetAddress);
          setValue('city', cityValue);
          setValue('state', stateValue);
          setValue('country', countryValue);
          setValue('pincode', postcodeValue);
        } catch (err) {
          console.error(err);
          setValue('address', 'Marine Drive, Nariman Point');
          setValue('city', 'Mumbai');
          setValue('state', 'Maharashtra');
          setValue('country', 'India');
          setValue('pincode', '400021');
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setValue('address', 'Connaught Place, Block E');
        setValue('city', 'New Delhi');
        setValue('state', 'Delhi');
        setValue('country', 'India');
        setValue('pincode', '110001');
        setDetectedCoords({ lat: 28.6304, lon: 77.2177 });
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };


  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 bg-ivory">
      <h2 className="text-2xl font-serif text-charcoal mb-2">Authentication Required</h2>
      <p className="text-stone text-[14px] mb-6">Please log in to create a campaign.</p>
      <button onClick={() => navigate('/auth')} className="px-6 py-3 bg-coral text-white rounded-xl font-bold shadow-warm hover:bg-terracotta transition">
        Go to Login
      </button>
    </div>
  );

  if (!user.isVerified) return (
    <div className="min-h-[85vh] bg-ivory flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-6 border border-gold/20">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-[28px] font-serif text-charcoal mb-3">Identity Verification Required</h2>
      <p className="text-stone text-[14px] max-w-sm mb-8 leading-relaxed">
        All campaign creators must be verified to protect donors and build trust. It takes less than 60 seconds.
      </p>
      <button onClick={() => navigate('/verify')}
        className="px-8 py-3.5 bg-coral text-white rounded-xl font-bold shadow-warm hover:bg-terracotta transition flex items-center gap-2">
        Complete Verification <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<{ url: string; alt?: string }[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, { url: reader.result as string, alt: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: any) => {
    const locationParts: string[] = [];
    if (data.address) locationParts.push(data.address);
    if (data.city) locationParts.push(data.city);
    if (data.state) locationParts.push(data.state);
    if (data.country) locationParts.push(data.country);
    if (data.pincode) locationParts.push(`PIN: ${data.pincode}`);

    const submitData = {
      ...data,
      location: locationParts.join(', ') || undefined,
      photos: photos.length ? photos : undefined,
    };

    delete submitData.address;
    delete submitData.city;
    delete submitData.state;
    delete submitData.country;
    delete submitData.pincode;

    setLoading(true);
    setError('');
    try {
      await fundApi.create(submitData);
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-ivory border border-sand rounded-xl text-[14px] text-charcoal placeholder-stone/40 transition";
  const labelCls = "block text-[12px] font-semibold text-charcoal mb-1.5";

  return (
    <div className="min-h-screen bg-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="text-center mb-10">
          <div className="inline-flex p-3 bg-coral/8 rounded-2xl text-coral mb-4 border border-coral/15">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-[36px] font-serif text-charcoal mb-2">Create Your Campaign</h1>
          <p className="text-stone text-[15px]">Tell your story and start receiving support from thousands of donors.</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Hospital Registry Search Box */}
          <div className="bg-white rounded-3xl border border-sand/40 shadow-warm overflow-hidden p-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-coral uppercase tracking-wider font-mono">Fast-Track Setup</span>
              <h2 className="text-lg font-serif text-charcoal font-bold mt-1">Pre-Verified Hospital Registry Integration</h2>
              <p className="text-[12px] text-stone leading-relaxed">
                If your hospital case file has been pre-verified by our partner desk, enter the case registry reference ID below to instant-fill verified campaign details.
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. HOSP-DEL-9012"
                className="flex-1 px-4 py-3 bg-ivory border border-sand rounded-xl text-[14px] text-charcoal focus:outline-none"
                value={registryId}
                onChange={(e) => setRegistryId(e.target.value)}
              />
              <button
                type="button"
                onClick={handlePreVerifyRegistry}
                disabled={registryLoading || !registryId}
                className="px-6 bg-coral hover:bg-terracotta text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {registryLoading ? 'Searching...' : 'Search & Pre-fill'}
              </button>
            </div>
            {registryError && (
              <p className="text-xs text-coral font-medium flex items-center gap-1">⚠ {registryError}</p>
            )}
            {registryDetails && (
              <div className="p-4 bg-sage/5 border border-sage/30 rounded-2xl flex items-start gap-3 animate-fade-in">
                <Sparkles className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
                <div className="text-[12px] text-stone">
                  <span className="font-bold text-sage-dark">Verified registry file found:</span>
                  <p className="mt-1 font-semibold text-charcoal">Patient: {registryDetails.patientName} | Hospital: {registryDetails.hospitalName}</p>
                  <p className="text-[10px] text-stone/80 mt-0.5">Auto-filled: Target Amount: ₹{registryDetails.targetAmount.toLocaleString('en-IN')}, Category, Beneficiary Name, and Location details.</p>
                </div>
              </div>
            )}
          </div>

          {/* Campaign Details */}
          <div className="bg-white rounded-3xl border border-sand/40 shadow-warm overflow-hidden">
            <div className="bg-coral/5 border-b border-sand/40 px-6 py-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-coral" />
              <h2 className="font-semibold text-charcoal text-[15px]">Campaign Details</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelCls}>Campaign Title <span className="text-coral">*</span></label>
                <input {...register('title')} type="text" placeholder="Give your campaign a compelling title" className={inputCls} />
                {errors.title && <p className="mt-1 text-[12px] text-coral">{errors.title.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Category <span className="text-coral">*</span></label>
                <select {...register('category')} className={inputCls + ' cursor-pointer'}>
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="mt-1 text-[12px] text-coral">{errors.category.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea {...register('description')} placeholder="Tell your story — why this matters, who it helps, and how donations will be used..." rows={5}
                  className={inputCls + ' resize-none'} />
                
                {/* AI optimization & Translator module */}
                <div className="mt-3 bg-cream/40 rounded-2xl border border-sand/40 p-4 space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand/20 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-coral animate-pulse" /> AI Campaign Story Assistant
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAiOptimize(watch('description') || '')}
                        disabled={aiOptimizing}
                        className="px-3 py-1.5 bg-coral/10 hover:bg-coral/20 text-coral border border-coral/10 rounded-xl text-[10px] font-bold transition flex items-center gap-1"
                      >
                        {aiOptimizing ? 'Analyzing...' : 'AI Score & Audit'}
                      </button>
                      
                      <div className="flex bg-white border border-sand/40 rounded-xl p-0.5">
                        <select
                          className="bg-transparent text-[10px] font-bold text-stone outline-none border-none pr-6 pl-2 cursor-pointer"
                          value={translateLang}
                          onChange={(e) => setTranslateLang(e.target.value)}
                        >
                          <option value="Hindi">Hindi</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Telugu">Telugu</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleTranslateDescription(watch('description') || '', watch('title') || '')}
                          disabled={translating}
                          className="px-3 py-1 bg-coral hover:bg-terracotta text-white rounded-lg text-[10px] font-bold transition"
                        >
                          {translating ? 'Translating...' : 'Translate'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {aiScore !== null && (
                    <div className="space-y-2.5 animate-fade-in text-xs text-stone">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-sand/20">
                        <span className="font-semibold text-charcoal">Optimization Score:</span>
                        <span className={`font-bold font-mono px-2 py-0.5 rounded-md text-[10px] ${
                          aiScore >= 90 ? 'bg-sage/10 text-sage-dark' : 'bg-gold/10 text-amber-800'
                        }`}>
                          {aiScore}/100 ({aiGrade})
                        </span>
                      </div>
                      {aiSuggestions.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold text-charcoal">AI Suggestions:</span>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone">
                            {aiSuggestions.map((sug, i) => (
                              <li key={i}>{sug}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Target Amount (₹) <span className="text-coral">*</span></label>
                  <input {...register('targetAmount')} type="number" placeholder="e.g. 50000" className={inputCls} />
                  {errors.targetAmount && <p className="mt-1 text-[12px] text-coral">{errors.targetAmount.message}</p>}
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer bg-ivory border border-sand rounded-xl px-4 py-3 w-full">
                    <input {...register('emergency')} type="checkbox" className="w-4 h-4 rounded border-sand text-coral accent-coral" />
                    <div>
                      <span className="text-[13px] font-semibold text-charcoal">Mark as Urgent</span>
                      <p className="text-[11px] text-stone">Highlight this as an emergency case</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-3xl border border-sand/40 shadow-warm overflow-hidden">
            <div className="bg-coral/5 border-b border-sand/40 px-6 py-4 flex items-center gap-3">
              <Image className="w-5 h-5 text-coral" />
              <h2 className="font-semibold text-charcoal text-[15px]">Campaign Photos</h2>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-sand rounded-2xl p-8 text-center hover:border-coral/40 transition">
                <Upload className="w-8 h-8 text-stone mx-auto mb-3" />
                <p className="text-[13px] text-stone mb-2">Drag & drop or click to upload images</p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-coral text-white text-[13px] font-bold rounded-xl shadow-warm-sm hover:bg-terracotta transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Choose Files
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {photos.map((p, i) => (
                    <div key={i} className="relative group">
                      <img src={p.url} alt={p.alt} className="w-20 h-20 object-cover rounded-xl border border-sand" />
                      <button type="button" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-coral text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px]">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Beneficiary */}
          <div className="bg-white rounded-3xl border border-sand/40 shadow-warm overflow-hidden">
            <div className="bg-sage/5 border-b border-sand/40 px-6 py-4 flex items-center gap-3">
              <User className="w-5 h-5 text-sage-dark" />
              <h2 className="font-semibold text-charcoal text-[15px]">Beneficiary Information</h2>
              <span className="text-[11px] text-stone">(Optional)</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>Name</label>
                <input {...register('beneficiaryName')} placeholder="Beneficiary name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Relation</label>
                <input {...register('beneficiaryRelation')} placeholder="e.g. Self, Parent" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Contact</label>
                <input {...register('beneficiaryContact')} placeholder="Phone or email" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl border border-sand/40 shadow-warm overflow-hidden">
            <div className="bg-navy/5 border-b border-sand/40 px-6 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-navy" />
                <h2 className="font-semibold text-charcoal text-[15px]">Location</h2>
                <span className="text-[11px] text-stone">(Optional)</span>
              </div>
              <button
                type="button"
                onClick={handleGPSLocation}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-coral/10 hover:bg-coral/15 text-coral rounded-xl text-[12px] font-bold border border-coral/10 transition cursor-pointer disabled:opacity-50 active:scale-[0.97]"
              >
                {gpsLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                Auto-Detect
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Address</label>
                  <input {...register('address')} placeholder="Street address" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input {...register('city')} placeholder="City" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input {...register('state')} placeholder="State" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input {...register('country')} placeholder="Country" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Pincode</label>
                  <input {...register('pincode')} placeholder="PIN code" className={inputCls} />
                </div>
              </div>

              {detectedCoords && (
                <div className="mt-5 rounded-2xl overflow-hidden border border-sand/60 h-48 shadow-warm-sm animate-fade-in relative">
                  <iframe
                    title="GPS Location Map"
                    width="100%"
                    height="100%"
                    className="border-none"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${detectedCoords.lon-0.005}%2C${detectedCoords.lat-0.005}%2C${detectedCoords.lon+0.005}%2C${detectedCoords.lat+0.005}&layer=mapnik&marker=${detectedCoords.lat}%2C${detectedCoords.lon}`}
                  />
                  <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-sand/40 text-[10px] font-semibold text-charcoal shadow-warm-sm">
                    📍 {detectedCoords.lat.toFixed(4)}, {detectedCoords.lon.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Error & Submit */}
          {error && (
            <div className="bg-coral/8 border border-coral/20 rounded-xl p-4 text-coral text-[13px] font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl text-[14px] font-semibold text-stone border border-sand hover:bg-cream transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-8 py-3 bg-coral text-white text-[14px] font-bold rounded-xl shadow-warm hover:bg-terracotta disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Submit Campaign</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFund;
