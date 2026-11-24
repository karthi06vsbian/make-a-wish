import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { meditativeAudio } from '../lib/soundtrack';
import { useTranslation } from 'react-i18next';

export const AmbientAudioControl: React.FC = () => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = () => {
    const newState = meditativeAudio.toggle();
    setIsPlaying(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
        isPlaying
          ? 'bg-gold-500/20 border-gold-400/60 text-gold-200 shadow-glow-gold'
          : 'bg-midnight-900/60 border-gold-500/20 text-cream-300/80 hover:text-gold-200 hover:border-gold-500/40'
      }`}
      title={t('nav.soundToggle')}
      aria-label={t('nav.soundToggle')}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-4 h-4 text-gold-300 animate-pulse" />
          {/* Animated wave bars */}
          <span className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-gold-400 rounded animate-[pulse_1s_infinite_0.1s] h-2.5" />
            <span className="w-0.5 bg-gold-300 rounded animate-[pulse_1.2s_infinite_0.3s] h-3.5" />
            <span className="w-0.5 bg-gold-400 rounded animate-[pulse_0.9s_infinite_0.2s] h-1.5" />
          </span>
          <span className="hidden sm:inline">{t('nav.soundToggle')}</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4 text-cream-400/70" />
          <span className="hidden sm:inline flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold-400/60" />
            {t('nav.soundToggle')}
          </span>
        </>
      )}
    </button>
  );
};
