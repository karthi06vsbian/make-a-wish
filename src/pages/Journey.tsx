import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Calendar,
  Lock,
  Unlock,
  Sparkles,
  Volume2,
  CheckCircle,
  Search,
  AlertCircle,
  Heart,
  Compass,
} from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';
import { localDb, getSevenDayJourneyData } from '../lib/supabase';
import { WishRecord, ReflectionDay } from '../types';
import { meditativeAudio } from '../lib/soundtrack';

export const Journey: React.FC = () => {
  const { referenceId: paramRefId } = useParams<{ referenceId: string }>();
  const location = useLocation();
  const { t } = useTranslation();

  const [inputRefId, setInputRefId] = useState(paramRefId || '');
  const [inputPin, setInputPin] = useState(
    (location.state as any)?.accessPin || ''
  );
  const [activeWish, setActiveWish] = useState<WishRecord | null>(null);
  const [journeyDays, setJourneyDays] = useState<ReflectionDay[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number>(1);

  // Auto-search if parameter provided
  useEffect(() => {
    if (paramRefId) {
      const found = localDb.findWishByRefAndPin(paramRefId, inputPin || undefined);
      if (found) {
        setActiveWish(found);
        setJourneyDays(getSevenDayJourneyData(found));
        setErrorMsg(null);
      } else {
        // If not found in local db, provide demo template so user can explore
        const demoWish: WishRecord = {
          id: 'demo-view',
          referenceId: paramRefId,
          accessPin: '582914',
          wishType: 'text',
          textContent: 'Sample intention in sacred reflection.',
          category: 'peace',
          language: 'en',
          isPublic: false,
          moderationStatus: 'approved',
          paymentId: 'pay_demo',
          blessingsCount: 5,
          createdAt: new Date().toISOString(),
        };
        setActiveWish(demoWish);
        setJourneyDays(getSevenDayJourneyData(demoWish));
      }
    }
  }, [paramRefId]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!inputRefId.trim()) {
      setErrorMsg('Please enter your Wish Reference ID (e.g. WISH-7849-2026).');
      return;
    }

    const found = localDb.findWishByRefAndPin(inputRefId, inputPin);
    if (found) {
      setActiveWish(found);
      setJourneyDays(getSevenDayJourneyData(found));
      setErrorMsg(null);
    } else {
      setErrorMsg('No wish record found matching that Reference ID and PIN. Please double-check.');
    }
  };

  const handlePlayBell = () => {
    meditativeAudio.playSingingBell(432);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <DiyaFlame size="md" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gold-100 via-gold-200 to-amber-500 bg-clip-text text-transparent">
          {t('journey.pageTitle')}
        </h1>
        <p className="text-sm sm:text-base text-cream-300/80 max-w-xl mx-auto leading-relaxed">
          {t('journey.pageSubtitle')}
        </p>
      </div>

      {/* Lookup Card if no active wish loaded yet */}
      {!activeWish && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 sm:p-8 border border-gold-500/25 max-w-xl mx-auto space-y-5 shadow-glow-gold"
        >
          <div className="flex items-center gap-2 text-gold-300 font-serif font-semibold text-base">
            <Compass className="w-5 h-5 text-gold-400" />
            <span>{t('journey.lookupTitle')}</span>
          </div>

          <p className="text-xs text-cream-400/80 leading-relaxed">
            {t('journey.lookupSubtitle')}
          </p>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label htmlFor="refInput" className="block text-xs font-medium text-cream-300 mb-1">
                {t('success.refLabel')}
              </label>
              <input
                id="refInput"
                type="text"
                value={inputRefId}
                onChange={(e) => setInputRefId(e.target.value)}
                placeholder={t('journey.refPlaceholder')}
                className="w-full bg-midnight-950 border border-gold-500/30 rounded-xl px-4 py-2.5 text-xs text-cream-100 placeholder-cream-400/40 uppercase font-mono tracking-wider focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label htmlFor="pinInput" className="block text-xs font-medium text-cream-300 mb-1">
                {t('success.pinLabel')} (6 digits)
              </label>
              <input
                id="pinInput"
                type="password"
                maxLength={6}
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value)}
                placeholder={t('journey.pinPlaceholder')}
                className="w-full bg-midnight-950 border border-gold-500/30 rounded-xl px-4 py-2.5 text-xs text-cream-100 placeholder-cream-400/40 font-mono tracking-widest focus:outline-none focus:border-gold-400"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-midnight-950 bg-gradient-to-r from-gold-300 to-amber-500 shadow-glow-gold hover:from-gold-200 hover:to-gold-400 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>{t('journey.lookupBtn')}</span>
            </button>
          </form>
        </motion.div>
      )}

      {/* Active Wish Seven-Day Journey Render */}
      {activeWish && (
        <div className="space-y-6">
          {/* Wish Header Bar */}
          <div className="p-6 rounded-3xl glass-panel border border-gold-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-gold-400 tracking-wider">
                Active Reflection Sanctuary
              </span>
              <h2 className="font-serif text-lg font-bold text-gold-200">
                {activeWish.referenceId}
              </h2>
              {activeWish.textContent && (
                <p className="text-xs text-cream-300/80 italic max-w-lg line-clamp-2">
                  "{activeWish.textContent}"
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handlePlayBell}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-gold-300 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-gold-400" />
              <span>{t('journey.playBell')}</span>
            </button>
          </div>

          {/* 7 Days Timeline Cards */}
          <div className="space-y-4">
            {journeyDays.map((day) => {
              const isUnlocked = day.isUnlocked;
              const isCurrentExpanded = expandedDay === day.dayNumber;

              return (
                <motion.div
                  key={day.dayNumber}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isUnlocked
                      ? isCurrentExpanded
                        ? 'bg-gradient-to-br from-gold-950/30 via-midnight-900/80 to-midnight-950 border-gold-500/50 shadow-glow-gold'
                        : 'bg-midnight-900/60 border-gold-500/20 hover:border-gold-500/40'
                      : 'bg-midnight-950/40 border-gold-500/10 opacity-70'
                  }`}
                >
                  {/* Card Title Header */}
                  <div
                    onClick={() => isUnlocked && setExpandedDay(day.dayNumber)}
                    className={`p-5 sm:p-6 flex items-center justify-between cursor-pointer select-none`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Day Number Badge */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif text-lg font-bold border shrink-0 ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-gold-400 to-amber-600 text-midnight-950 border-gold-300 shadow-glow-gold'
                            : 'bg-midnight-900 text-cream-400/40 border-gold-500/15'
                        }`}
                      >
                        {day.dayNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-gold-400/80 font-mono">
                            Day {day.dayNumber} • {day.theme}
                          </span>
                        </div>
                        <h3 className="font-serif text-base sm:text-lg font-semibold text-gold-100">
                          {day.title}
                        </h3>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-300 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30">
                          <Unlock className="w-3.5 h-3.5 text-gold-400" />
                          <span className="hidden sm:inline">{t('journey.unlocked')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cream-400/60 px-3 py-1 rounded-full bg-midnight-950 border border-gold-500/10">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {t('journey.locked')} {day.dayNumber}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content (when unlocked & active) */}
                  {isUnlocked && isCurrentExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 space-y-5 border-t border-gold-500/15 animate-in fade-in duration-200">
                      {/* Reflection message */}
                      <div className="p-4 rounded-2xl bg-midnight-950/70 border border-gold-500/15">
                        <p className="text-sm text-cream-100 leading-relaxed italic">
                          "{day.reflectionMessage}"
                        </p>
                      </div>

                      {/* Daily Affirmation & Mindful Action */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-gold-950/40 to-midnight-950 border border-gold-500/20 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-gold-400 text-xs font-semibold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{t('journey.affirmationTitle')}</span>
                          </div>
                          <p className="text-xs text-cream-100 font-medium leading-relaxed">
                            {day.affirmation}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-gradient-to-br from-gold-950/40 to-midnight-950 border border-gold-500/20 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-gold-400 text-xs font-semibold uppercase tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t('journey.actionTitle')}</span>
                          </div>
                          <p className="text-xs text-cream-100 leading-relaxed">
                            {day.mindfulAction}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Reset / lookup another wish */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setActiveWish(null);
                setInputRefId('');
                setInputPin('');
              }}
              className="text-xs text-cream-400/60 hover:text-gold-300 transition-colors"
            >
              ← Search a different Wish Reference ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
