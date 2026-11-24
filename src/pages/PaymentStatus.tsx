import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';

export const PaymentStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const paymentId = searchParams.get('razorpay_payment_id');
  const orderId = searchParams.get('razorpay_order_id');
  const status = searchParams.get('status') || (paymentId ? 'success' : 'pending');

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel rounded-3xl p-8 border border-gold-500/30 text-center space-y-6 shadow-glow-gold"
      >
        <div className="flex justify-center">
          <DiyaFlame size="md" />
        </div>

        {isVerifying ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400 mx-auto" />
            <h2 className="font-serif text-lg font-bold text-gold-100">
              Verifying Payment with Gateway...
            </h2>
            <p className="text-xs text-cream-400/80">
              Please wait while we confirm your sacred ₹10 contribution.
            </p>
          </div>
        ) : status === 'success' || paymentId ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto shadow-glow-gold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gold-100">
              Payment Confirmed
            </h2>
            <p className="text-xs text-cream-300/80 leading-relaxed">
              Your ₹10 payment has been verified. Payment ID: <code className="text-gold-300 font-mono">{paymentId || 'pay_verified'}</code>
            </p>
            <div className="pt-2">
              <Link
                to="/journey"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-midnight-950 bg-gradient-to-r from-gold-300 to-amber-500 shadow-glow-gold hover:from-gold-200"
              >
                <span>Access Reflection Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-red-200">
              Payment Incomplete
            </h2>
            <p className="text-xs text-cream-400/80 leading-relaxed">
              We could not verify the payment transaction. Please try submitting again.
            </p>
            <div className="pt-2">
              <Link
                to="/make-a-wish"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium text-cream-200 bg-midnight-950 border border-gold-500/30 hover:bg-gold-500/10"
              >
                <span>Return to Make a Wish</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
