import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FundCard from '../components/FundCard';
import { fundApi } from '../services/api';
import { Fund } from '../types';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

const Explore = () => {
  const navigate = useNavigate();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'urgent' | 'popular' | 'goal_desc'>('latest');

  const categories = [
    'Orphanage & Child Care Support',
    'Old Age Home / Elder Care',
    'Emergency Medical Treatment',
    'Physical Disability Support',
    'Women Healthcare & Maternity Support',
    'Disaster & Emergency Relief',
  ];

  useEffect(() => { fetchFunds(); }, [category]);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fundApi.list({ status: 'Active', category: category || undefined });
      setFunds(res.data.funds || []);
    } catch {
      setError('Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = (id: string) => navigate(`/funds/${id}`);
  const handleShare = (fund: Fund) => {
    const url = `${window.location.origin}/funds/${fund._id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Support: ${fund.title} ${url}`)}`, '_blank');
  };

  const filteredFunds = funds
    .filter(fund => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return fund.title.toLowerCase().includes(q) || fund.category.toLowerCase().includes(q) || (fund.description && fund.description.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'urgent') return (b.emergency ? 1 : 0) - (a.emergency ? 1 : 0);
      if (sortBy === 'popular') return (b.donorCount || 0) - (a.donorCount || 0);
      if (sortBy === 'goal_desc') return b.targetAmount - a.targetAmount;
      return 0;
    });

  return (
    <div className="min-h-screen bg-ivory pb-16">

      {/* Header */}
      <div className="bg-white border-b border-sand/50 sticky top-[72px] z-30 py-6">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-coral text-[11px] font-bold uppercase tracking-[0.15em] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Verified campaigns only
              </div>
              <h1 className="text-[32px] font-serif text-charcoal">Active Campaigns</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:max-w-lg">
              {/* Search */}
              <div className="flex-1 flex items-center bg-ivory border border-sand rounded-xl px-3.5 py-2.5 focus-within:border-coral transition">
                <Search className="w-4 h-4 text-stone mr-2.5" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none border-none text-[13px] text-charcoal placeholder-stone/60 w-full font-medium"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center bg-ivory border border-sand rounded-xl px-3 py-2.5 focus-within:border-coral transition gap-2">
                <SlidersHorizontal className="w-4 h-4 text-stone" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent outline-none text-[12px] font-semibold text-charcoal border-none cursor-pointer pr-4"
                >
                  <option value="latest">Latest first</option>
                  <option value="urgent">Urgent first</option>
                  <option value="popular">Most popular</option>
                  <option value="goal_desc">Highest target</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap border transition ${
                category === ''
                  ? 'bg-coral text-white border-coral shadow-warm-sm'
                  : 'bg-white border-sand text-stone hover:text-charcoal hover:border-coral/30'
              }`}
            >
              All Campaigns
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap border transition ${
                  category === cat
                    ? 'bg-coral text-white border-coral shadow-warm-sm'
                    : 'bg-white border-sand text-stone hover:text-charcoal hover:border-coral/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center py-24 space-y-3">
            <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-stone">Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="bg-coral/8 border border-coral/20 text-coral py-4 px-6 rounded-2xl text-center text-sm font-medium">
            {error}
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sand/40 p-16 text-center shadow-warm">
            <Search className="w-12 h-12 text-sand mx-auto mb-4" />
            <h3 className="font-serif text-xl text-charcoal mb-2">No Campaigns Found</h3>
            <p className="text-stone text-sm">Try adjusting your search or filter settings.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
          >
            {filteredFunds.map((fund, i) => (
              <motion.div
                key={fund._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <FundCard fund={fund} onDonate={handleDonate} onShare={handleShare} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && !error && filteredFunds.length > 0 && (
          <div className="text-center text-stone text-[12px] font-semibold mt-14 uppercase tracking-[0.1em]">
            Showing <b className="text-charcoal">{filteredFunds.length}</b> verified campaigns
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
