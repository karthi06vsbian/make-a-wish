import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AmbientAudioControl } from './AmbientAudioControl';
import { LanguageSelector } from './LanguageSelector';

export const FloatingControls: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const isHome = location.pathname === '/';

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5 pointer-events-auto">
      {!isHome && (
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-midnight-900/80 border border-gold-500/25 text-cream-200 hover:text-gold-200 hover:border-gold-500/50 backdrop-blur-md transition-all duration-200 shadow-glass"
          title="Return to Home"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gold-400" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      )}

      <AmbientAudioControl />
      <LanguageSelector />
    </div>
  );
};
