import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Coins, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <DiyaFlame size="md" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-100">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-cream-300/80 max-w-xl mx-auto">
          Please read these terms carefully before participating in the MAKE A WISH journey.
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-gold-500/20 space-y-8 text-xs sm:text-sm text-cream-200/90 leading-relaxed">
        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-gold-200 flex items-center gap-2">
            <Coins className="w-4 h-4 text-gold-400" />
            <span>1. Digital Service Contribution (₹10)</span>
          </h2>
          <p>
            The ₹10 (Indian Rupees Ten Only) contribution is a non-refundable digital service fee that covers:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-cream-300">
            <li>Secure cloud processing and private audio storage for up to 3 minutes.</li>
            <li>Instant generation of a unique Reference ID and secure PIN.</li>
            <li>Seven days of personalized positive reflection guidance and affirmations.</li>
          </ul>
          <p className="text-gold-300 font-medium">
            Each ₹10 payment unlocks exactly one wish submission.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
          <h2 className="font-serif text-lg font-bold text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>2. No Supernatural or Outcome Guarantees</span>
          </h2>
          <p>
            MAKE A WISH is a self-care and mindful reflection software application. We expressly state that we make <strong>NO</strong> guarantees, prophecies, supernatural claims, or astrological promises that any wish will definitely come true, be fulfilled within 7 days, or alter external circumstances. The positive reflection journey is an internal mindfulness exercise for emotional peace and thoughtful action.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-gold-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span>3. Community Standards & Acceptable Use</span>
          </h2>
          <p>
            You agree not to submit content that contains hate speech, harassment, threats of violence, illegal solicitations, or explicit personal contact information. Platform custodians reserve the right to reject, redact, or permanently delete any submission that violates peaceful sanctuary standards without refund.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-gold-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold-400" />
            <span>4. Governing Law & Dispute Redressal</span>
          </h2>
          <p>
            These terms are governed by the laws of India. For any billing or service concerns, please contact our support team at <strong className="text-gold-300">support@makeawish.org</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
