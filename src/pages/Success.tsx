import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Calendar,
  Share2,
  Lock,
} from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';
import { localDb, getSevenDayJourneyData } from '../lib/supabase';
import { WishRecord, ReflectionDay } from '../types';
import { meditativeAudio } from '../lib/soundtrack';

export const Success: React.FC = () => {
  const { referenceId: urlRefId } = useParams<{ referenceId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [copied, setCopied] = useState(false);
  const [wishRecord, setWishRecord] = useState<WishRecord | null>(
    (location.state as any)?.wishRecord || null
  );
  const [accessPin, setAccessPin] = useState<string>(
    (location.state as any)?.accessPin || ''
  );

  const referenceId = urlRefId || wishRecord?.referenceId || 'WISH-7849-2026';

  useEffect(() => {
    // Fire festive golden sparkles
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#FBBF24', '#FDE68A', '#F97316'],
    });

    // If wishRecord not passed in state, try looking it up
    if (!wishRecord && urlRefId) {
      const found = localDb.findWishByRefAndPin(urlRefId);
      if (found) {
        setWishRecord(found);
        setAccessPin(found.accessPin);
      }
    }
  }, [urlRefId, wishRecord]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSoundBell = () => {
    meditativeAudio.playSingingBell(432);
  };

  // Derive reflection days for Day 1 preview
  const days: ReflectionDay[] = wishRecord
    ? getSevenDayJourneyData(wishRecord)
    : [];
  const day1 = days[0];

  return (
    <div className="relative min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Celebration Diya & Heading */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <DiyaFlame size="lg" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            <span>₹10 Payment Verified & Sacred Wish Enshrined</span>
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gold-100 via-gold-200 to-amber-400 bg-clip-text text-transparent">
            {t('success.title')}
          </h1>

          <p className="text-sm text-cream-300/80 max-w-lg mx-auto leading-relaxed">
            {t('success.subtitle')}
          </p>
        </div>

        {/* Sacred Credentials Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-gold-500/30 shadow-glow-gold space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reference ID */}
            <div className="p-4 rounded-2xl bg-midnight-950/80 border border-gold-500/20 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gold-400/80 font-medium">
                {t('success.refLabel')}
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-lg sm:text-xl font-bold text-gold-200 tracking-wider">
                  {referenceId}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 transition-colors"
                  title="Copy Reference ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Secret PIN */}
            <div className="p-4 rounded-2xl bg-midnight-950/80 border border-gold-500/20 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gold-400/80 font-medium">
                {t('success.pinLabel')}
              </span>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-400" />
                <span className="font-mono text-lg sm:text-xl font-bold text-gold-200 tracking-widest">
                  {accessPin || '582914'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-start gap-3 text-xs text-cream-300/90 leading-relaxed">
            <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
            <p>{t('success.saveNotice')}</p>
          </div>
        </div>

        {/* Day 1 Reflection Preview Card */}
        {day1 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gold-950/20 via-midnight-900/60 to-midnight-950 border border-gold-500/30 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gold-500/20">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
                <Calendar className="w-4 h-4" />
                <span>Day 1 • {day1.theme}</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-200 border border-gold-500/30">
                {t('journey.unlocked')}
              </span>
            </div>

            <h3 className="font-serif text-xl font-semibold text-gold-100">
              {day1.title}
            </h3>

            <p className="text-sm text-cream-200/90 leading-relaxed italic border-l-2 border-gold-400/60 pl-4 py-1">
              "{day1.reflectionMessage}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-midnight-950/70 border border-gold-500/15 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-gold-400 font-semibold">
                  {t('journey.affirmationTitle')}
                </span>
                <p className="text-xs text-cream-100 font-medium leading-relaxed">
                  {day1.affirmation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-midnight-950/70 border border-gold-500/15 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-gold-400 font-semibold">
                  {t('journey.actionTitle')}
                </span>
                <p className="text-xs text-cream-100 leading-relaxed">
                  {day1.mindfulAction}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSoundBell}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-gold-200 bg-midnight-950 border border-gold-500/30 hover:bg-gold-500/10 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-gold-400" />
                <span>{t('journey.playBell')}</span>
              </button>

              <Link
                to={`/journey/${referenceId}`}
                state={{ accessPin }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-midnight-950 bg-gradient-to-r from-gold-300 to-amber-500 shadow-glow-gold hover:from-gold-200 hover:to-gold-400 transition-all transform hover:-translate-y-0.5"
              >
                <span>{t('success.openJourney')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
