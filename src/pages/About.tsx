import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Shield, Heart, Compass, CheckCircle2, Coins } from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';

export const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <DiyaFlame size="md" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gold-100 via-gold-200 to-amber-500 bg-clip-text text-transparent">
          {t('about.title', 'Our Sacred Philosophy')}
        </h1>
        <p className="text-sm sm:text-base text-cream-300/80 max-w-xl mx-auto leading-relaxed">
          Mindfulness over superstition. Inner clarity over false promises. A sanctuary for the soul.
        </p>
      </div>

      {/* Main Philosophy Card */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-gold-500/25 space-y-6 shadow-glow-gold">
        <h2 className="font-serif text-2xl font-bold text-gold-100">
          The Power of Naming What You Long For
        </h2>
        <div className="text-xs sm:text-sm text-cream-200/90 leading-relaxed space-y-4">
          <p>
            In ancient traditions across every culture, lighting a lamp or expressing a sacred prayer was never about bargaining with the cosmos. It was an intentional pause—a sacred moment where one stopped rushing, stood in silence, and named the deepest yearning of the heart.
          </p>
          <p>
            Modern psychology confirms what our ancestors intuitively practiced: naming an intention clarifies our subconscious goals, reduces emotional turbulence, and awakens self-compassion.
          </p>
          <p>
            <strong>MAKE A WISH</strong> was created as a peaceful digital sanctuary. We reject commercial exploitation, sensationalist astrology, and magical guarantees. Instead, we provide a serene spiritual space where you can vocalize or write your wish, anchored by a <strong>Seven-Day Positive Reflection Journey</strong>.
          </p>
        </div>
      </div>

      {/* Why ₹10 Contribution */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-gold-950/20 via-midnight-900/60 to-midnight-950 border border-gold-500/30 space-y-4">
        <div className="flex items-center gap-2 text-gold-300 font-serif font-semibold text-lg">
          <Coins className="w-5 h-5 text-gold-400" />
          <span>The Purpose of the ₹10 Contribution</span>
        </div>
        <div className="text-xs sm:text-sm text-cream-300/90 leading-relaxed space-y-3">
          <p>
            We deliberately set the one-time contribution to exactly <strong>₹10 (1000 paise)</strong>.
          </p>
          <ul className="space-y-2 pl-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span>It acts as a conscious commitment mechanism, encouraging mindful reflection rather than impulsive spam.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span>It covers payment gateway transaction fees and secure cloud hosting for up to 3 minutes of high-fidelity voice recordings.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span>It maintains an ad-free, clutter-free digital sanctuary with zero tracking or user profiling.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel border border-gold-500/15 space-y-2">
          <Shield className="w-5 h-5 text-gold-400" />
          <h4 className="font-serif text-sm font-semibold text-gold-100">Absolute Transparency</h4>
          <p className="text-xs text-cream-400/80 leading-relaxed">
            We never promise that wishes come true automatically. Change requires patience, self-belief, and conscious daily deeds.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-gold-500/15 space-y-2">
          <Heart className="w-5 h-5 text-gold-400" />
          <h4 className="font-serif text-sm font-semibold text-gold-100">Sacred Dignity</h4>
          <p className="text-xs text-cream-400/80 leading-relaxed">
            Every submission is treated with reverence. Private wishes remain strictly private, and public wishes remain completely anonymous.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-gold-500/15 space-y-2">
          <Compass className="w-5 h-5 text-gold-400" />
          <h4 className="font-serif text-sm font-semibold text-gold-100">Seven Days of Light</h4>
          <p className="text-xs text-cream-400/80 leading-relaxed">
            Seven daily reflections crafted to foster gratitude, resilience, and calm action throughout your personal journey.
          </p>
        </div>
      </div>
    </div>
  );
};
