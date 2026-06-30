import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Eye, Zap, ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const trustItems = [
    { icon: Shield, title: 'Aadhaar Verified', desc: 'Every creator is identity-checked' },
    { icon: Eye, title: 'Fully Transparent', desc: 'Track every rupee in real time' },
    { icon: Zap, title: '0% Platform Fee', desc: 'Every donation goes directly to the cause' },
  ];

  const links = [
    { label: 'Explore Campaigns', to: '/explore' },
    { label: 'Start a Fundraiser', to: '/create' },
    { label: 'Verify Identity', to: '/verify' },
    { label: 'My Dashboard', to: '/profile' },
  ];

  return (
    <footer className="bg-navy text-white/90 relative overflow-hidden">
      {/* Decorative organic blob */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-coral/5 blob-1 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 relative z-10">

        {/* Trust Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-start gap-4 bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/8 transition">
              <div className="w-10 h-10 bg-coral/15 rounded-xl flex items-center justify-center text-coral flex-shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-14">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-coral rounded-xl flex items-center justify-center">
                <Heart className="w-[18px] h-[18px] text-white" fill="white" strokeWidth={0} />
              </div>
              <span className="text-xl font-serif text-white">
                Aid<span className="text-coral">ora</span>
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-sm mb-6">
              India's most trusted crowdfunding platform where every creator is verified,
              every donation is transparent, and every rupee creates real impact.
            </p>
            <p className="text-xs text-white/30 flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-coral" fill="currentColor" /> for a better world
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-5">Navigate</h4>
            <ul className="space-y-3">
              {links.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/60 hover:text-coral transition flex items-center group">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Info */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-5">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li className="text-white/50">
                <span className="text-white/30">Verification:</span>{' '}
                <span className="text-white/70">Aadhaar-based Identity Check</span>
              </li>
              <li className="text-white/50">
                <span className="text-white/30">Review:</span>{' '}
                <span className="text-white/70">Every campaign is manually reviewed</span>
              </li>
              <li className="text-white/50">
                <span className="text-white/30">Fee:</span>{' '}
                <span className="text-coral font-semibold">0% Platform Fee</span>
              </li>
              <li className="text-white/50">
                <span className="text-white/30">Support:</span>{' '}
                <span className="text-white/70">24/7 Community Help</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {year} Aidora. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <span className="hover:text-white/60 cursor-pointer transition">Privacy</span>
            <span className="hover:text-white/60 cursor-pointer transition">Terms</span>
            <span className="hover:text-white/60 cursor-pointer transition">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
