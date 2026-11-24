import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Trash2, Eye, Server, RefreshCw } from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <DiyaFlame size="md" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-100">
          Privacy Policy & Sacred Data Stewardship
        </h1>
        <p className="text-xs sm:text-sm text-cream-300/80 max-w-xl mx-auto">
          Last updated: November 2026 • Compliant with Indian DPDP Act and Global Privacy Standards
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-gold-500/20 space-y-8 text-xs sm:text-sm text-cream-200/90 leading-relaxed">
        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-gold-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gold-400" />
            <span>1. What We Collect & Why</span>
          </h2>
          <p>
            When you submit a wish on MAKE A WISH, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-cream-300">
            <li>Your sacred wish content (written text or up to 180 seconds of audio recording).</li>
            <li>Selected category and language preference.</li>
            <li>Optional recovery contact details (email or mobile number) if provided voluntarily.</li>
            <li>Transaction tokens provided by Razorpay (Order ID and Payment ID) to verify ₹10 payments and prevent duplicate redemption.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-gold-200 flex items-center gap-2">
            <Server className="w-4 h-4 text-gold-400" />
            <span>2. Private Storage & Voice Recording Security</span>
          </h2>
          <p>
            All voice recordings are uploaded directly to private, restricted Supabase Storage buckets. They are never publicly indexed, searchable, or downloadable without server-authenticated signed URLs. Voice recordings are strictly accessible only by the submitter (using their secret Reference ID & PIN) and verified platform custodians for safety moderation.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-gold-200 flex items-center gap-2">
            <Eye className="w-4 h-4 text-gold-400" />
            <span>3. Private vs Public Anonymous Wishes</span>
          </h2>
          <p>
            By default, all wishes are set to <strong>Private</strong>. Only you can view your wish and reflection journey. If you explicitly choose to share on the Sacred Community Wall, your wish is stripped of all personal identifiers and published completely anonymously only after human review. Voice recordings are <strong>never</strong> shared publicly.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-gold-200 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-gold-400" />
            <span>4. Retention Policy</span>
          </h2>
          <p>
            Wishes and their seven-day reflection journeys are retained for 365 days from the date of submission so that you may revisit your mindful path. After 365 days, audio recordings are permanently purged from storage.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-gold-200 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-gold-400" />
            <span>5. Right to Erasure & Deletion Process</span>
          </h2>
          <p>
            You hold absolute sovereignty over your spiritual data. You may request the immediate, permanent deletion of your wish record and voice recording at any time by contacting our Grievance Officer at <strong className="text-gold-300">privacy@makeawish.org</strong> with your Wish Reference ID. Deletion requests are fulfilled within 48 business hours.
          </p>
        </div>
      </div>
    </div>
  );
};
