import React, { useEffect, useState } from 'react';
import { Donation } from '../types';

type Props = {
  donations: Donation[];
};

const DonorTicker: React.FC<Props> = ({ donations }) => {
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    if (donations.length === 0) return;
    const timer = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % donations.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [donations.length]);

  if (donations.length === 0) return null;

  const current = donations[displayIndex];
  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-4 rounded-r-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">💚</span>
        <div>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{current.donorName}</span> donated{' '}
            <span className="font-bold text-green-600">₹{current.amount.toLocaleString('en-IN')}</span>
          </p>
          <p className="text-xs text-gray-500">{timeAgo(current.createdAt)}</p>
        </div>
      </div>
      <div className="mt-2 flex gap-1 justify-center">
        {donations.slice(0, 5).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition ${i === displayIndex ? 'bg-green-600 w-4' : 'bg-gray-300 w-2'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default DonorTicker;
