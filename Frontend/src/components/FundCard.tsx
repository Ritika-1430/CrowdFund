import React from 'react';
import { Fund } from '../types';
import { MapPin, Clock, Users, Share2 } from 'lucide-react';
import { fundPhotoUrls, fallbackFundImage } from '../utils/fundImages';

interface FundCardProps {
  fund: Fund;
  onDonate: (id: string) => void;
  onShare: (fund: Fund) => void;
}

const FundCard: React.FC<FundCardProps> = ({ fund, onDonate, onShare }) => {
  const imageSrc = fundPhotoUrls(fund)[0];
  const progress = Math.min(100, (fund.amountCollected / fund.targetAmount) * 100);
  const daysLeft = fund.deadline
    ? Math.max(0, Math.ceil((new Date(fund.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-warm card-hover border border-sand/40 flex flex-col h-full group cursor-pointer"
      onClick={() => onDonate(fund._id)}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-cream">
        <img
          src={imageSrc}
          alt={fund.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackFundImage(fund.category);
          }}
        />
        {/* Category Tag */}
        <div className="absolute top-3.5 left-3.5">
          <span className="bg-white/90 backdrop-blur-sm text-charcoal text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-warm-sm">
            {fund.category.split(' ')[0]}
          </span>
        </div>
        {/* Emergency Badge */}
        {fund.emergency && (
          <div className="absolute top-3.5 right-3.5">
            <span className="bg-coral text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Urgent
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg text-charcoal leading-snug mb-2 group-hover:text-coral transition-colors line-clamp-2">
          {fund.title}
        </h3>

        {fund.description && (
          <p className="text-stone text-[13px] leading-relaxed mb-4 line-clamp-2">
            {fund.description}
          </p>
        )}

        {/* Progress */}
        <div className="mt-auto">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-charcoal font-bold text-[15px]">
              ₹{fund.amountCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-stone text-[12px]">
              of ₹{fund.targetAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-full bg-sand/60 rounded-full h-[6px] overflow-hidden">
            <div
              className="bg-coral h-full rounded-full progress-animate"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Meta Row */}
          <div className="flex items-center justify-between mt-3.5 text-[11px] text-stone">
            <div className="flex items-center gap-3">
              {(fund.donorCount ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {fund.donorCount} donors
                </span>
              )}
              {daysLeft !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysLeft}d left
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onShare(fund); }}
              className="w-7 h-7 rounded-full bg-cream flex items-center justify-center text-stone hover:text-coral hover:bg-coral/10 transition"
              aria-label="Share"
            >
              <Share2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
