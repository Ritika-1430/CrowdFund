import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Heart, Menu, X, User, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const closeMenu = () => setOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Explore', to: '/explore' },
    { label: 'Start a Campaign', to: '/create' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sand/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex h-[72px] items-center justify-between">

          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-coral rounded-xl flex items-center justify-center shadow-warm-sm group-hover:shadow-warm transition-shadow">
              <Heart className="w-[18px] h-[18px] text-white" fill="white" strokeWidth={0} />
            </div>
            <div className="leading-none">
              <span className="block text-[19px] font-serif text-charcoal tracking-tight">
                Aid<span className="text-coral">ora</span>
              </span>
            </div>
          </Link>

          {/* Center Links — Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`link-underline text-[14px] font-medium transition-colors ${
                  isActive(link.to) ? 'text-coral' : 'text-stone hover:text-charcoal'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && !user.isVerified && (
              <Link
                to="/verify"
                className="text-[12px] font-semibold text-gold bg-gold/10 px-3.5 py-1.5 rounded-full border border-gold/20 hover:bg-gold/15 transition"
              >
                ✦ Verify Account
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                className="text-[12px] font-semibold text-navy bg-navy/8 px-3.5 py-1.5 rounded-full border border-navy/15 hover:bg-navy/12 transition flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3 h-3" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions — Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-charcoal border border-sand hover:border-coral/30 hover:bg-cream/50 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-stone hover:text-terracotta transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="text-[13px] font-semibold text-stone hover:text-charcoal transition px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-coral hover:bg-terracotta shadow-warm-sm hover:shadow-warm transition-all active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(v => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-sand text-charcoal hover:bg-cream transition"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden border-t border-sand bg-white px-5 py-6 animate-fade-in">
          <div className="space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-xl text-[15px] font-semibold transition ${
                  isActive(link.to)
                    ? 'bg-coral/8 text-coral'
                    : 'text-charcoal hover:bg-cream'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && !user.isVerified && (
              <Link to="/verify" onClick={closeMenu} className="block px-4 py-3 rounded-xl text-[15px] font-semibold text-gold hover:bg-gold/8 transition">
                ✦ Verify Account
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" onClick={closeMenu} className="block px-4 py-3 rounded-xl text-[15px] font-semibold text-navy hover:bg-navy/8 transition">
                Admin Dashboard
              </Link>
            )}
          </div>

          <hr className="border-sand my-4" />

          <div className="space-y-2">
            {user ? (
              <>
                <Link to="/profile" onClick={closeMenu} className="block text-center py-3 rounded-xl border border-sand font-semibold text-charcoal hover:bg-cream transition">
                  My Dashboard
                </Link>
                <button onClick={handleLogout} className="block w-full text-center py-3 rounded-xl font-medium text-stone hover:text-terracotta transition">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={closeMenu} className="block text-center py-3 rounded-xl bg-coral font-bold text-white hover:bg-terracotta transition">
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
