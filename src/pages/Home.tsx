import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  Calendar,
  Lock,
  Volume2,
  Coins,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';
import { localDb } from '../lib/supabase';
import { meditativeAudio } from '../lib/soundtrack';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const [wishes, setWishes] = useState(localDb.getWishes().filter((w) => w.isPublic && w.moderationStatus === 'approved'));
  const [blessingAnimatingId, setBlessingAnimatingId] = useState<string | null>(null);

  const handleLightDiya = (wishId: string) => {
    setBlessingAnimatingId(wishId);
    localDb.incrementBlessing(wishId);
    setWishes(localDb.getWishes().filter((w) => w.isPublic && w.moderationStatus === 'approved'));
    meditativeAudio.playSingingBell(528);
    setTimeout(() => setBlessingAnimatingId(null), 1200);
  };

  const steps = [
    { title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
    { title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
    { title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
    { title: t('howItWorks.step4Title'), desc: t('howItWorks.step4Desc') },
  ];

  const journeyDays = [
    { title: t('journeyPreview.day1Title'), desc: t('journeyPreview.day1Desc') },
    { title: t('journeyPreview.day2Title'), desc: t('journeyPreview.day2Desc') },
    { title: t('journeyPreview.day3Title'), desc: t('journeyPreview.day3Desc') },
    { title: t('journeyPreview.day4Title'), desc: t('journeyPreview.day4Desc') },
    { title: t('journeyPreview.day5Title'), desc: t('journeyPreview.day5Desc') },
    { title: t('journeyPreview.day6Title'), desc: t('journeyPreview.day6Desc') },
    { title: t('journeyPreview.day7Title'), desc: t('journeyPreview.day7Desc') },
  ];

  return (
    <div className="relative space-y-24 sm:space-y-32 pb-20">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-8 z-10">
          {/* Sacred Diya Centerpiece */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <div className="relative p-6">
              <DiyaFlame size="xl" />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-gold-500/15 border border-gold-500/30 text-gold-300 shadow-glow-gold"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>{t('hero.badge')}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-cream-100 via-gold-200 to-amber-400 bg-clip-text text-transparent drop-shadow-md leading-[1.15]"
          >
            {t('hero.title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-base sm:text-xl text-cream-300/85 max-w-2xl mx-auto leading-relaxed font-sans font-light"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Main Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/make-a-wish"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider text-midnight-950 bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 hover:from-gold-200 hover:to-gold-400 shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('hero.cta')}</span>
            </Link>

            <Link
              to="/journey"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-medium text-cream-200 bg-midnight-900/60 border border-gold-500/25 hover:border-gold-500/60 hover:text-gold-200 transition-all backdrop-blur-md"
            >
              <Calendar className="w-4 h-4 text-gold-400" />
              <span>{t('hero.ctaExplore')}</span>
            </Link>
          </motion.div>

          {/* Transparent ₹10 Fee Pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="pt-2 text-xs text-cream-400/70 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span>{t('hero.feeNote')}</span>
          </motion.div>
        </div>
      </section>

      {/* 2. HOW THE JOURNEY UNFOLDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="flex justify-center">
            <DiyaFlame size="sm" showStand={false} />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-100">
            {t('howItWorks.title')}
          </h2>
          <p className="text-sm sm:text-base text-cream-300/80 max-w-xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl glass-panel border border-gold-500/20 hover:border-gold-500/40 transition-all duration-300 space-y-3 relative group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-300 font-serif font-bold text-sm group-hover:scale-110 transition-transform shadow-glow-gold">
                0{idx + 1}
              </div>
              <h3 className="font-serif text-base font-semibold text-gold-100">
                {step.title}
              </h3>
              <p className="text-xs text-cream-400/80 leading-relaxed font-sans">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SEVEN-DAY JOURNEY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-midnight-900/90 via-midnight-950 to-midnight-900/80 border border-gold-500/25 space-y-12 shadow-glow-gold">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-gold-300 bg-gold-500/10 border border-gold-500/25">
              <Calendar className="w-3.5 h-3.5" />
              <span>Positive Reflection Architecture</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-100">
              {t('journeyPreview.title')}
            </h2>
            <p className="text-xs sm:text-sm text-cream-300/80 leading-relaxed">
              {t('journeyPreview.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journeyDays.map((day, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-midnight-950/70 border border-gold-500/15 hover:border-gold-500/35 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-gold-500/15 text-gold-300">
                    Day {idx + 1}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-gold-400/60" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-gold-200">
                  {day.title}
                </h4>
                <p className="text-[11px] text-cream-400/70 leading-relaxed">
                  {day.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/journey"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gold-300 hover:text-gold-100 transition-colors"
            >
              <span>Learn more about how daily reflection transforms intention</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SACRED ETHICS & TRUTH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-100">
            {t('ethics.title')}
          </h2>
          <p className="text-sm text-cream-300/80 max-w-xl mx-auto">
            {t('ethics.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel border border-gold-500/20 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-semibold text-gold-200">
              {t('ethics.point1Title')}
            </h3>
            <p className="text-xs text-cream-400/80 leading-relaxed">
              {t('ethics.point1Desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-gold-500/20 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-semibold text-gold-200">
              {t('ethics.point2Title')}
            </h3>
            <p className="text-xs text-cream-400/80 leading-relaxed">
              {t('ethics.point2Desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-gold-500/20 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-semibold text-gold-200">
              {t('ethics.point3Title')}
            </h3>
            <p className="text-xs text-cream-400/80 leading-relaxed">
              {t('ethics.point3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. SACRED COMMUNITY WALL PREVIEW */}
      {wishes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/10 border border-gold-500/20 text-gold-300 mb-2">
                <Flame className="w-3.5 h-3.5" />
                <span>Anonymous Intentions</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-100">
                {t('community.pageTitle')}
              </h2>
            </div>

            <Link
              to="/community"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gold-300 hover:text-gold-100"
            >
              <span>View All Public Wishes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wishes.slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="p-6 rounded-3xl glass-panel border border-gold-500/20 flex flex-col justify-between space-y-4 hover:border-gold-500/40 transition-all shadow-glow-gold"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-cream-400/60">
                    <span className="capitalize font-medium text-gold-300">
                      {w.category.replace('_', ' ')}
                    </span>
                    <span className="font-mono">{w.referenceId}</span>
                  </div>

                  <p className="text-xs text-cream-200 leading-relaxed italic line-clamp-3">
                    "{w.textContent}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gold-500/10">
                  <span className="text-[11px] text-cream-400/70 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-gold-400" />
                    <span>{w.blessingsCount || 0} {t('community.diyasLit')}</span>
                  </span>

                  <button
                    onClick={() => handleLightDiya(w.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      blessingAnimatingId === w.id
                        ? 'bg-gold-500 text-midnight-950 border-gold-400 scale-105 shadow-glow-gold'
                        : 'bg-midnight-950 border-gold-500/25 text-gold-300 hover:bg-gold-500/15'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{t('community.lightDiya')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. FINAL SACRED INVITATION CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-gold-950/40 via-midnight-900/90 to-midnight-950 border border-gold-500/40 shadow-glow-gold space-y-6">
          <DiyaFlame size="md" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-100">
            Begin Your Mindful Seven-Day Journey
          </h2>
          <p className="text-sm text-cream-300/80 max-w-lg mx-auto leading-relaxed">
            Pour your heart out in speech or writing. Let peace and purpose guide your coming days.
          </p>
          <div>
            <Link
              to="/make-a-wish"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider text-midnight-950 bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 hover:from-gold-200 hover:to-gold-400 shadow-glow-gold-lg transition-all transform hover:-translate-y-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('hero.cta')} (₹10)</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
