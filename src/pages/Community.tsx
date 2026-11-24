import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Filter, Heart, MessageCircle } from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';
import { localDb } from '../lib/supabase';
import { WishRecord, WishCategory } from '../types';
import { meditativeAudio } from '../lib/soundtrack';

export const Community: React.FC = () => {
  const { t } = useTranslation();
  const [wishes, setWishes] = useState<WishRecord[]>(
    localDb.getWishes().filter((w) => w.isPublic && w.moderationStatus === 'approved')
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'peace', label: 'Peace of Mind' },
    { id: 'health', label: 'Health & Healing' },
    { id: 'family', label: 'Family & Loved Ones' },
    { id: 'growth', label: 'Growth & Career' },
    { id: 'relationship', label: 'Love & Harmony' },
    { id: 'inner_strength', label: 'Inner Strength' },
    { id: 'gratitude', label: 'Gratitude' },
  ];

  const handleLightDiya = (wishId: string) => {
    setAnimatingId(wishId);
    localDb.incrementBlessing(wishId);
    setWishes(
      localDb.getWishes().filter((w) => w.isPublic && w.moderationStatus === 'approved')
    );
    meditativeAudio.playSingingBell(528);
    setTimeout(() => setAnimatingId(null), 1000);
  };

  const filteredWishes = wishes.filter((w) => {
    if (selectedCategory === 'all') return true;
    return w.category === selectedCategory;
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <DiyaFlame size="md" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gold-100 via-gold-200 to-amber-500 bg-clip-text text-transparent">
          {t('community.pageTitle')}
        </h1>
        <p className="text-sm sm:text-base text-cream-300/80 max-w-2xl mx-auto leading-relaxed">
          {t('community.pageSubtitle')}
        </p>
        <p className="text-[11px] text-gold-400/70 max-w-lg mx-auto">
          {t('community.guideline')}
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              selectedCategory === cat.id
                ? 'bg-gold-500/20 text-gold-200 border-gold-400/80 shadow-glow-gold'
                : 'bg-midnight-900/60 text-cream-400/80 border-gold-500/15 hover:border-gold-500/40 hover:text-cream-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Wishes Masonry / Grid */}
      {filteredWishes.length === 0 ? (
        <div className="py-16 text-center space-y-3 glass-panel rounded-3xl p-8 max-w-md mx-auto">
          <Heart className="w-8 h-8 text-gold-400/60 mx-auto" />
          <p className="text-xs text-cream-400/70">{t('community.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishes.map((w) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl glass-panel border border-gold-500/20 flex flex-col justify-between space-y-4 hover:border-gold-500/40 transition-all duration-300 shadow-glow-gold"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="capitalize font-semibold text-gold-300 px-2.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20">
                    {w.category.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-cream-400/50 text-[10px]">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-cream-100 leading-relaxed italic">
                  "{w.textContent}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gold-500/10">
                <span className="text-[11px] text-cream-400/70 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-gold-400" />
                  <span className="font-mono font-medium text-gold-200">
                    {w.blessingsCount || 0}
                  </span>
                  <span>{t('community.diyasLit')}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleLightDiya(w.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    animatingId === w.id
                      ? 'bg-gold-500 text-midnight-950 border-gold-300 scale-105 shadow-glow-gold'
                      : 'bg-midnight-950 text-gold-300 border-gold-500/30 hover:bg-gold-500/15'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{t('community.lightDiya')}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
