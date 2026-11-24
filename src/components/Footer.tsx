import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DiyaFlame } from './DiyaFlame';
import { Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative z-10 bg-midnight-950 border-t border-gold-500/15 pt-12 pb-8 text-cream-300/70 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gold-500/10">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <div className="flex items-center gap-2">
              <DiyaFlame size="sm" showStand={false} />
              <span className="font-serif tracking-widest text-base font-bold bg-gradient-to-r from-gold-200 to-amber-400 bg-clip-text text-transparent">
                MAKE A WISH
              </span>
            </div>
            <p className="max-w-md text-cream-400/80 leading-relaxed text-[11px]">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            <Link to="/" className="hover:text-gold-300 transition-colors">
              Home
            </Link>
            <Link to="/make-a-wish" className="hover:text-gold-300 transition-colors font-medium text-gold-300">
              {t('nav.makeWish')}
            </Link>
            <Link to="/journey" className="hover:text-gold-300 transition-colors">
              {t('nav.journey')}
            </Link>
            <Link to="/community" className="hover:text-gold-300 transition-colors">
              {t('nav.community')}
            </Link>
            <Link to="/about" className="hover:text-gold-300 transition-colors">
              {t('footer.about')}
            </Link>
            <Link to="/privacy" className="hover:text-gold-300 transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="hover:text-gold-300 transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to="/contact" className="hover:text-gold-300 transition-colors">
              {t('footer.contact')}
            </Link>
          </div>
        </div>

        {/* Ethical Transparency & Non-Guarantee Statement */}
        <div className="py-6 my-4 px-5 rounded-2xl bg-midnight-900/50 border border-gold-500/10 text-center md:text-left flex flex-col md:flex-row items-center gap-4">
          <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300 shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-cream-400/90 leading-relaxed">
            <strong className="text-gold-300 font-medium">Sacred Transparency Notice: </strong>
            {t('footer.disclaimer')}
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-[10px] text-cream-400/50">
          <p>© {new Date().getFullYear()} MAKE A WISH. {t('footer.rights')}</p>
          <p className="flex items-center gap-1">
            Crafted for mindfulness, peace, and hope 🪔
          </p>
        </div>
      </div>
    </footer>
  );
};
