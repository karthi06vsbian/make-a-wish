import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageSquare, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DiyaFlame } from '../components/DiyaFlame';

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [referenceId, setReferenceId] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <DiyaFlame size="md" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-100">
          Contact & Grievance Redressal
        </h1>
        <p className="text-xs sm:text-sm text-cream-300/80 max-w-xl mx-auto">
          We are here to assist with wish deletion requests, payment queries, or feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Information & Grievance Officer */}
        <div className="space-y-6 md:col-span-1">
          <div className="p-6 rounded-3xl glass-panel border border-gold-500/20 space-y-4">
            <h3 className="font-serif text-gold-200 font-semibold text-sm">
              Sanctuary Support
            </h3>
            <div className="text-xs text-cream-300 space-y-3">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-cream-400/70 block">Support Desk</span>
                  <a href="mailto:support@makeawish.org" className="text-gold-300 hover:underline">
                    support@makeawish.org
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-cream-400/70 block">Grievance & Privacy Officer</span>
                  <a href="mailto:grievance@makeawish.org" className="text-gold-300 hover:underline">
                    grievance@makeawish.org
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-midnight-950/70 border border-gold-500/15 text-[11px] text-cream-400/80 space-y-2">
            <span className="text-gold-300 font-semibold block">Wish Deletion Timeline:</span>
            <p>
              To permanently delete a wish and associated voice note, submit your Reference ID using the form. Deletions are processed within 48 business hours.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-gold-500/25 shadow-glow-gold">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto shadow-glow-gold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-gold-100">
                  Message Received
                </h3>
                <p className="text-xs text-cream-300/80 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. Our support custodians will review your inquiry and respond to {email} within 24 to 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cream-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-midnight-950 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-cream-100 placeholder-cream-400/40 focus:outline-none focus:border-gold-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-cream-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-midnight-950 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-cream-100 placeholder-cream-400/40 focus:outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cream-300 mb-1">
                      Reason for Contact
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-midnight-950 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-cream-100 focus:outline-none focus:border-gold-400"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="deletion">Wish Deletion Request</option>
                      <option value="payment">Payment Assistance</option>
                      <option value="moderation">Content Moderation Concern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-cream-300 mb-1">
                      Wish Reference ID (if applicable)
                    </label>
                    <input
                      type="text"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      placeholder="e.g. WISH-7849-2026"
                      className="w-full bg-midnight-950 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-cream-100 placeholder-cream-400/40 uppercase font-mono tracking-wider focus:outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-cream-300 mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How may our sanctuary custodians assist you?"
                    className="w-full bg-midnight-950 border border-gold-500/20 rounded-xl p-4 text-xs text-cream-100 placeholder-cream-400/40 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-midnight-950 bg-gradient-to-r from-gold-300 to-amber-500 shadow-glow-gold hover:from-gold-200 hover:to-gold-400 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
