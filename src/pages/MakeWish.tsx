import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Globe2,
  FileText,
  Mic,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Coins,
} from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { WishCategory, WishType, VoiceNoteMeta, LanguageCode } from '../types';
import { createRazorpayOrder, loadRazorpayScript, verifyAndSubmitWish } from '../lib/razorpay';
import { meditativeAudio } from '../lib/soundtrack';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const MakeWish: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [wishType, setWishType] = useState<WishType>('text');
  const [textContent, setTextContent] = useState('');
  const [category, setCategory] = useState<WishCategory>('peace');
  const [isPublic, setIsPublic] = useState(false); // Private default
  const [voiceNoteMeta, setVoiceNoteMeta] = useState<VoiceNoteMeta | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [consentService, setConsentService] = useState(true);
  const [consentPrivacy, setConsentPrivacy] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTestPaymentModal, setShowTestPaymentModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<{
    orderId: string;
    amount: number;
    keyId: string;
  } | null>(null);

  const categories: { id: WishCategory; labelKey: string }[] = [
    { id: 'peace', labelKey: 'form.catPeace' },
    { id: 'health', labelKey: 'form.catHealth' },
    { id: 'family', labelKey: 'form.catFamily' },
    { id: 'growth', labelKey: 'form.catGrowth' },
    { id: 'relationship', labelKey: 'form.catRelationship' },
    { id: 'inner_strength', labelKey: 'form.catInnerStrength' },
    { id: 'gratitude', labelKey: 'form.catGratitude' },
    { id: 'general', labelKey: 'form.catGeneral' },
  ];

  const handleAudioReady = (meta: VoiceNoteMeta) => {
    setVoiceNoteMeta(meta);
    setErrorMessage(null);
  };

  const handleAudioRemoved = () => {
    setVoiceNoteMeta(null);
  };

  const validateForm = (): boolean => {
    setErrorMessage(null);

    if (wishType === 'text') {
      if (!textContent.trim() || textContent.trim().length < 5) {
        setErrorMessage(t('errors.minChar'));
        return false;
      }
      if (textContent.length > 3000) {
        setErrorMessage(t('errors.maxChar'));
        return false;
      }
    } else if (wishType === 'voice') {
      if (!voiceNoteMeta || !voiceNoteMeta.audioBlob) {
        setErrorMessage(t('errors.audioRequired'));
        return false;
      }
    }

    if (!consentService || !consentPrivacy) {
      setErrorMessage(t('errors.consentRequired'));
      return false;
    }

    return true;
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const order = await createRazorpayOrder(1000, 'INR', undefined, userEmail);

      const hasScript = await loadRazorpayScript();
      if (!hasScript || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      // Open Razorpay Standard Web Checkout Modal
      const options = {
        key: order.keyId,
        amount: order.amount, // 1000 paise = ₹10
        currency: order.currency,
        name: 'MAKE A WISH',
        description: 'Sacred 7-Day Positive Reflection Journey',
        order_id: order.orderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          await handlePaymentSuccess(response);
        },
        prefill: {
          email: userEmail || undefined,
        },
        theme: {
          color: '#D97706',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setIsProcessing(false);
        setErrorMessage(resp.error?.description || t('errors.paymentFailed'));
      });
      rzp.open();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Unable to initiate payment session.');
    }
  };

  const handlePaymentSuccess = async (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    setIsProcessing(true);
    try {
      const currentLang = (i18n.language?.split('-')[0] || 'en') as LanguageCode;

      const verification = await verifyAndSubmitWish(response, {
        wishType,
        textContent: wishType === 'text' ? textContent : undefined,
        category,
        language: currentLang,
        isPublic,
        voiceNote: voiceNoteMeta || undefined,
        userEmail: userEmail || undefined,
        consentAccepted: true,
      });

      if (verification.success) {
        // Play serene temple bell chime
        meditativeAudio.playSingingBell(432);

        // Redirect to success screen with unique reference ID
        navigate(`/success/${verification.referenceId}`, {
          state: {
            referenceId: verification.referenceId,
            accessPin: verification.accessPin,
            wishRecord: verification.wishRecord,
          },
        });
      } else {
        throw new Error('Payment verification could not be validated.');
      }
    } catch (err: any) {
      console.error('Submission verification error:', err);
      setErrorMessage(err.message || 'Payment was recorded but wish registration failed. Please contact support.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3 mb-10"
      >
        <div className="flex justify-center">
          <DiyaFlame size="md" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gold-100 via-gold-300 to-amber-500 bg-clip-text text-transparent">
          {t('form.pageTitle')}
        </h1>
        <p className="text-sm sm:text-base text-cream-300/80 max-w-xl mx-auto font-sans leading-relaxed">
          {t('form.pageSubtitle')}
        </p>
      </motion.div>

      {/* Main Submission Form */}
      <form onSubmit={handleInitiatePayment} className="space-y-8">
        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* 1. Category Selection */}
        <div className="glass-panel rounded-2xl p-6 border border-gold-500/20 space-y-3">
          <label className="block font-serif text-gold-200 font-semibold text-sm">
            {t('form.categoryLabel')}
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                  category === cat.id
                    ? 'bg-gold-500/20 text-gold-200 border-gold-400/80 shadow-glow-gold'
                    : 'bg-midnight-900/60 text-cream-400/80 border-gold-500/15 hover:border-gold-500/40 hover:text-cream-200'
                }`}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Format Switcher: Written vs Voice */}
        <div className="space-y-4">
          <div className="flex items-center justify-center p-1.5 rounded-2xl bg-midnight-900/80 border border-gold-500/20 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setWishType('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                wishType === 'text'
                  ? 'bg-gradient-to-r from-gold-400 to-amber-500 text-midnight-950 shadow-glow-gold'
                  : 'text-cream-300/80 hover:text-gold-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('form.tabText')}</span>
            </button>
            <button
              type="button"
              onClick={() => setWishType('voice')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                wishType === 'voice'
                  ? 'bg-gradient-to-r from-gold-400 to-amber-500 text-midnight-950 shadow-glow-gold'
                  : 'text-cream-300/80 hover:text-gold-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{t('form.tabVoice')}</span>
            </button>
          </div>

          {/* Written Wish Input */}
          {wishType === 'text' && (
            <div className="glass-panel rounded-2xl p-6 border border-gold-500/20 space-y-2">
              <label htmlFor="textContent" className="block font-serif text-gold-200 font-semibold text-sm">
                {t('form.textLabel')}
              </label>
              <textarea
                id="textContent"
                rows={5}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                maxLength={3000}
                placeholder={t('form.textPlaceholder')}
                className="w-full bg-midnight-950/80 border border-gold-500/20 rounded-xl p-4 text-cream-100 placeholder-cream-400/40 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/50 transition-colors resize-y min-h-[140px]"
              />
              <div className="flex justify-between text-[11px] text-cream-400/60 font-mono">
                <span>Min: 5 characters</span>
                <span>
                  {textContent.length} / 3000 {t('form.charCount')}
                </span>
              </div>
            </div>
          )}

          {/* Voice Recording Input */}
          {wishType === 'voice' && (
            <VoiceRecorder
              onAudioReady={handleAudioReady}
              onAudioRemoved={handleAudioRemoved}
              maxDurationSeconds={180}
            />
          )}
        </div>

        {/* 3. Privacy Preference (Private Default) */}
        <div className="glass-panel rounded-2xl p-6 border border-gold-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gold-400" />
            <h3 className="font-serif text-gold-200 font-semibold text-sm">
              {t('form.visibilityLabel')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Private Option (Default) */}
            <div
              onClick={() => setIsPublic(false)}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                !isPublic
                  ? 'bg-gold-500/15 border-gold-400/80 shadow-glow-gold'
                  : 'bg-midnight-900/50 border-gold-500/15 hover:border-gold-500/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${!isPublic ? 'border-gold-400 bg-gold-400' : 'border-cream-400/50'}`}>
                  {!isPublic && <div className="w-1.5 h-1.5 rounded-full bg-midnight-950" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gold-100">
                    {t('form.privateOption')}
                  </h4>
                  <p className="text-[11px] text-cream-400/70 mt-1 leading-relaxed">
                    {t('form.privateHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Public Anonymous Option */}
            <div
              onClick={() => setIsPublic(true)}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                isPublic
                  ? 'bg-gold-500/15 border-gold-400/80 shadow-glow-gold'
                  : 'bg-midnight-900/50 border-gold-500/15 hover:border-gold-500/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isPublic ? 'border-gold-400 bg-gold-400' : 'border-cream-400/50'}`}>
                  {isPublic && <div className="w-1.5 h-1.5 rounded-full bg-midnight-950" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-gold-400" />
                    <h4 className="text-xs font-semibold text-gold-100">
                      {t('form.publicOption')}
                    </h4>
                  </div>
                  <p className="text-[11px] text-cream-400/70 mt-1 leading-relaxed">
                    {t('form.publicHint')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Optional Contact (for recovery) */}
        <div className="glass-panel rounded-2xl p-6 border border-gold-500/20 space-y-2">
          <label htmlFor="userEmail" className="block text-xs font-medium text-cream-300">
            {t('form.optionalContact')}
          </label>
          <input
            id="userEmail"
            type="text"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder={t('form.contactPlaceholder')}
            className="w-full bg-midnight-950/80 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-cream-100 placeholder-cream-400/40 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/50"
          />
        </div>

        {/* 5. Transparent ₹10 Fee Breakdown */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gold-950/30 via-midnight-900/70 to-midnight-950 border border-gold-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gold-500/20">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-gold-400" />
              <span className="font-serif text-gold-200 font-semibold text-sm">
                {t('form.feeBreakdownTitle')}
              </span>
            </div>
            <span className="font-serif text-2xl font-bold text-gold-300">
              {t('form.feeAmount')}
            </span>
          </div>

          <p className="text-xs text-cream-400/80 leading-relaxed">
            {t('form.feeExplanation')}
          </p>

          <div className="pt-2 space-y-3">
            {/* Consent 1 */}
            <label className="flex items-start gap-3 cursor-pointer text-xs text-cream-300/90">
              <input
                type="checkbox"
                checked={consentService}
                onChange={(e) => setConsentService(e.target.checked)}
                className="mt-0.5 rounded border-gold-500/40 text-gold-500 focus:ring-gold-400 bg-midnight-950"
              />
              <span className="leading-relaxed">{t('form.consent1')}</span>
            </label>

            {/* Consent 2 */}
            <label className="flex items-start gap-3 cursor-pointer text-xs text-cream-300/90">
              <input
                type="checkbox"
                checked={consentPrivacy}
                onChange={(e) => setConsentPrivacy(e.target.checked)}
                className="mt-0.5 rounded border-gold-500/40 text-gold-500 focus:ring-gold-400 bg-midnight-950"
              />
              <span className="leading-relaxed">{t('form.consent2')}</span>
            </label>
          </div>
        </div>

        {/* Submit & Pay Button */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider text-midnight-950 bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 hover:from-gold-200 hover:to-gold-400 shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-midnight-950" />
                <span>{t('form.processing')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t('form.proceedToPay')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Test Mode Payment Modal (when Razorpay is in test mode or keys are pending) */}
      {showTestPaymentModal && pendingOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-midnight-900 border border-gold-500/40 rounded-3xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gold-500/20">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif text-gold-200 font-semibold text-sm">
                  Razorpay Checkout Gateway
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
                Sandbox Mode
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-midnight-950/80 border border-gold-500/15 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-cream-400/80">Order Reference:</span>
                <span className="font-mono text-gold-300 text-[11px]">
                  {pendingOrderData.orderId}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-cream-400/80">Contribution:</span>
                <span className="font-serif text-gold-200 font-bold text-base">
                  ₹10.00
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-cream-400/80">Description:</span>
                <span className="text-cream-200 text-right text-[11px]">
                  7-Day Mindful Reflection Journey
                </span>
              </div>
            </div>

            <p className="text-[11px] text-cream-400/70 leading-relaxed text-center">
              Select a payment method to simulate verified ₹10 payment completion:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowTestPaymentModal(false);
                  handlePaymentSuccess({
                    razorpay_payment_id: `pay_upi_${Date.now()}`,
                    razorpay_order_id: pendingOrderData.orderId,
                    razorpay_signature: `sig_${Math.random().toString(36).substring(2, 12)}`,
                  });
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-midnight-950 border border-gold-500/20 hover:border-gold-400/60 hover:bg-gold-500/10 text-xs font-medium text-cream-200 transition-colors"
              >
                <span className="text-base mb-1">📱</span>
                <span>UPI (GPay / PhonePe)</span>
                <span className="text-[10px] text-gold-400/70">Instant ₹10</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTestPaymentModal(false);
                  handlePaymentSuccess({
                    razorpay_payment_id: `pay_card_${Date.now()}`,
                    razorpay_order_id: pendingOrderData.orderId,
                    razorpay_signature: `sig_${Math.random().toString(36).substring(2, 12)}`,
                  });
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-midnight-950 border border-gold-500/20 hover:border-gold-400/60 hover:bg-gold-500/10 text-xs font-medium text-cream-200 transition-colors"
              >
                <span className="text-base mb-1">💳</span>
                <span>Debit / Credit Card</span>
                <span className="text-[10px] text-gold-400/70">Verified ₹10</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowTestPaymentModal(false)}
                className="text-xs text-cream-400/60 hover:text-cream-200"
              >
                Cancel payment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
