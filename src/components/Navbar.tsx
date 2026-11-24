import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Menu, X, ShieldCheck } from 'lucide-react';
import { DiyaFlame } from './DiyaFlame';
import { LanguageSelector } from './LanguageSelector';
import { AmbientAudioControl } from './AmbientAudioControl';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav.brand') },
    { to: '/make-a-wish', label: t('nav.makeWish') },
    { to: '/journey', label: t('nav.journey') },
    { to: '/community', label: t('nav.community') },
    { to: '/about', label: t('nav.about') },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-midnight-950/80 border-b border-gold-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg p-1"
        >
          <DiyaFlame size="sm" />
          <div className="flex flex-col">
            <span className="font-serif tracking-[0.2em] text-lg sm:text-xl font-bold bg-gradient-to-r from-gold-100 via-gold-300 to-amber-500 bg-clip-text text-transparent group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all">
              MAKE A WISH
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gold-400/70 font-sans hidden sm:block">
              Positive Reflection Journey
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? 'text-gold-200 bg-gold-500/15 border border-gold-500/30'
                  : 'text-cream-300/80 hover:text-gold-200 hover:bg-midnight-900/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AmbientAudioControl />
          <LanguageSelector />

          {/* Glowing CTA */}
          <Link
            to="/make-a-wish"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-midnight-950 bg-gradient-to-r from-gold-200 via-gold-400 to-amber-500 hover:from-gold-100 hover:to-gold-400 shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('nav.makeWish')}</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-cream-300 hover:text-gold-200 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-midnight-900/95 border-b border-gold-500/20 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-gold-500/20 text-gold-200 font-semibold border border-gold-500/30'
                    : 'text-cream-300 hover:bg-midnight-800 hover:text-gold-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-gold-500/15 flex flex-col gap-2">
            <Link
              to="/make-a-wish"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-midnight-950 bg-gradient-to-r from-gold-300 to-amber-500 shadow-glow-gold"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('nav.makeWish')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
