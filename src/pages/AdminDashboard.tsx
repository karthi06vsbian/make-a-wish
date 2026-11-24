import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ShieldCheck,
  LogOut,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Trash2,
  Play,
  Pause,
  Volume2,
  FileText,
  CreditCard,
  BarChart3,
  Globe,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { localDb } from '../lib/supabase';
import { WishRecord, AdminStats, ModerationStatus } from '../types';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ModerationStatus>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [activeTab, setActiveTab] = useState<'wishes' | 'payments' | 'analytics'>('wishes');

  // Audio preview playback
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Detail Modal
  const [selectedWish, setSelectedWish] = useState<WishRecord | null>(null);

  const loadData = () => {
    const list = localDb.getWishes();
    setWishes(list);
    setStats(localDb.getAdminStats());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('wishmaker_admin_token');
    sessionStorage.removeItem('wishmaker_admin_email');
    navigate('/admin1');
  };

  const handleApprove = (wishId: string) => {
    localDb.updateModerationStatus(wishId, 'approved');
    loadData();
  };

  const handleReject = (wishId: string) => {
    localDb.updateModerationStatus(wishId, 'rejected');
    loadData();
  };

  const handleDelete = (wishId: string) => {
    if (window.confirm('Are you certain you wish to permanently delete this wish record?')) {
      localDb.deleteWish(wishId);
      loadData();
      if (selectedWish?.id === wishId) {
        setSelectedWish(null);
      }
    }
  };

  // Play audio note using signed URL or preview blob URL
  const handleToggleAudio = (wish: WishRecord) => {
    if (playingAudioId === wish.id) {
      if (audioElement) {
        audioElement.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audioSrc =
      wish.voiceNote?.previewUrl ||
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Demo fallback

    const newAudio = new Audio(audioSrc);
    newAudio.onended = () => setPlayingAudioId(null);
    newAudio.play().catch(() => {});
    setAudioElement(newAudio);
    setPlayingAudioId(wish.id);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Reference ID',
      'Date Created',
      'Category',
      'Language',
      'Visibility',
      'Moderation Status',
      'Wish Type',
      'Payment ID',
      'Blessings Count',
      'Text Content',
    ];

    const rows = wishes.map((w) => [
      w.referenceId,
      w.createdAt,
      w.category,
      w.language,
      w.isPublic ? 'Public' : 'Private',
      w.moderationStatus,
      w.wishType,
      w.paymentId,
      w.blessingsCount,
      `"${(w.textContent || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `make_a_wish_records_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered wishes
  const filteredWishes = wishes.filter((w) => {
    const matchesSearch =
      w.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.textContent && w.textContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : w.moderationStatus === statusFilter;

    const matchesVisibility =
      visibilityFilter === 'all'
        ? true
        : visibilityFilter === 'public'
        ? w.isPublic
        : !w.isPublic;

    return matchesSearch && matchesStatus && matchesVisibility;
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gold-500/20">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/10 border border-gold-500/30 text-gold-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Administrative Sanctuary</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gold-100">
            {t('admin.dashboardTitle')}
          </h1>
          <p className="text-xs text-cream-400/80">
            Enforcing server-side authorization, moderation, and sacred audit compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-midnight-900 border border-gold-500/20 text-cream-300 hover:text-gold-200 hover:border-gold-500/40 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-gold-200 bg-gold-500/15 border border-gold-500/30 hover:bg-gold-500/25 transition-colors shadow-glow-gold"
          >
            <Download className="w-4 h-4" />
            <span>{t('admin.exportCsv')}</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-950/40 border border-red-500/30 hover:bg-red-950/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('admin.logout')}</span>
          </button>
        </div>
      </div>

      {/* Stats Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-gold-500/20 space-y-2">
            <div className="flex items-center justify-between text-cream-400/80 text-xs">
              <span>{t('admin.metricWishes')}</span>
              <FileText className="w-4 h-4 text-gold-400" />
            </div>
            <div className="font-serif text-2xl font-bold text-gold-200">
              {stats.totalWishes}
            </div>
            <span className="text-[10px] text-cream-400/60">
              {stats.publicWishesCount} public • {stats.totalWishes - stats.publicWishesCount} private
            </span>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-gold-500/20 space-y-2">
            <div className="flex items-center justify-between text-cream-400/80 text-xs">
              <span>{t('admin.metricPayments')}</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-serif text-2xl font-bold text-emerald-300">
              {stats.verifiedPayments}
            </div>
            <span className="text-[10px] text-cream-400/60">
              ₹10 per submission verified
            </span>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-gold-500/20 space-y-2">
            <div className="flex items-center justify-between text-cream-400/80 text-xs">
              <span>{t('admin.metricRevenue')}</span>
              <Coins className="w-4 h-4 text-gold-400" />
            </div>
            <div className="font-serif text-2xl font-bold text-gold-300">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <span className="text-[10px] text-cream-400/60">
              Total digital contributions
            </span>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-gold-500/20 space-y-2">
            <div className="flex items-center justify-between text-cream-400/80 text-xs">
              <span>{t('admin.metricPending')}</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-serif text-2xl font-bold text-amber-300">
              {stats.pendingModerationCount}
            </div>
            <span className="text-[10px] text-cream-400/60">
              Awaiting custodian review
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gold-500/20 pb-2">
        <button
          onClick={() => setActiveTab('wishes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'wishes'
              ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40 shadow-glow-gold'
              : 'text-cream-400 hover:text-gold-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('admin.tabWishes')}</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'payments'
              ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40 shadow-glow-gold'
              : 'text-cream-400 hover:text-gold-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t('admin.tabPayments')}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40 shadow-glow-gold'
              : 'text-cream-400 hover:text-gold-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('admin.tabAnalytics')}</span>
        </button>
      </div>

      {/* TAB 1: WISHES REPOSITORY */}
      {activeTab === 'wishes' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl glass-panel border border-gold-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gold-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={t('admin.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-midnight-950 border border-gold-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-cream-100 placeholder-cream-400/40 focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Moderation Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-cream-400/70">{t('admin.filterStatus')}:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-midnight-950 border border-gold-500/20 rounded-xl px-2.5 py-1.5 text-xs text-cream-200 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Visibility Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-cream-400/70">{t('admin.filterVisibility')}:</span>
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as any)}
                  className="bg-midnight-950 border border-gold-500/20 rounded-xl px-2.5 py-1.5 text-xs text-cream-200 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl glass-panel border border-gold-500/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight-950/80 border-b border-gold-500/20 text-gold-400 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Custodian Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/10">
                {filteredWishes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-cream-400/60">
                      No wish records match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredWishes.map((w) => (
                    <tr key={w.id} className="hover:bg-midnight-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gold-200">
                        {w.referenceId}
                      </td>
                      <td className="py-3.5 px-4 text-cream-400/80">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-cream-200">
                        {w.category.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4">
                        {w.wishType === 'voice' || w.voiceNote ? (
                          <button
                            onClick={() => handleToggleAudio(w)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                              playingAudioId === w.id
                                ? 'bg-gold-500/30 text-gold-200 border-gold-400 animate-pulse'
                                : 'bg-midnight-950 text-cream-300 border-gold-500/20 hover:text-gold-200'
                            }`}
                          >
                            {playingAudioId === w.id ? (
                              <Pause className="w-3 h-3 fill-current" />
                            ) : (
                              <Play className="w-3 h-3 fill-current" />
                            )}
                            <span>Voice (Audio)</span>
                          </button>
                        ) : (
                          <span className="text-cream-400/70">{t('admin.noAudio')}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            w.isPublic
                              ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                              : 'bg-midnight-950 text-cream-400 border border-gold-500/15'
                          }`}
                        >
                          {w.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            w.moderationStatus === 'approved'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                              : w.moderationStatus === 'rejected'
                              ? 'bg-red-950/60 text-red-300 border border-red-500/30'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {w.moderationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedWish(w)}
                            className="px-2.5 py-1 rounded-lg bg-midnight-950 border border-gold-500/20 text-gold-300 hover:bg-gold-500/10 text-[11px]"
                          >
                            Inspect
                          </button>

                          {w.moderationStatus !== 'approved' && (
                            <button
                              onClick={() => handleApprove(w.id)}
                              className="p-1 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/80"
                              title={t('admin.approve')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {w.moderationStatus !== 'rejected' && (
                            <button
                              onClick={() => handleReject(w.id)}
                              className="p-1 rounded-lg bg-amber-950/40 text-amber-400 hover:bg-amber-950/80"
                              title={t('admin.reject')}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(w.id)}
                            className="p-1 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-950/80"
                            title={t('admin.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT LEDGER */}
      {activeTab === 'payments' && (
        <div className="overflow-x-auto rounded-2xl glass-panel border border-gold-500/20">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight-950/80 border-b border-gold-500/20 text-gold-400 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Wish Reference</th>
                <th className="py-3 px-4">Verified Timestamp</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/10">
              {wishes.map((w) => (
                <tr key={w.id} className="hover:bg-midnight-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gold-300">
                    {w.paymentId}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-300">
                    ₹10.00
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cream-200">
                    {w.referenceId}
                  </td>
                  <td className="py-3.5 px-4 text-cream-400/80">
                    {new Date(w.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      Captured
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ANALYTICS & DISTRIBUTION */}
      {activeTab === 'analytics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Breakdown */}
          <div className="p-6 rounded-2xl glass-panel border border-gold-500/20 space-y-4">
            <div className="flex items-center gap-2 text-gold-300 font-serif font-semibold text-sm">
              <Globe className="w-4 h-4 text-gold-400" />
              <span>Language Distribution</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'English (en)', count: stats.languageBreakdown.en },
                { name: 'Tamil (ta)', count: stats.languageBreakdown.ta },
                { name: 'Hindi (hi)', count: stats.languageBreakdown.hi },
                { name: 'Telugu (te)', count: stats.languageBreakdown.te },
                { name: 'Malayalam (ml)', count: stats.languageBreakdown.ml },
                { name: 'Kannada (kn)', count: stats.languageBreakdown.kn },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs text-cream-300">
                    <span>{item.name}</span>
                    <span className="font-mono text-gold-300">{item.count}</span>
                  </div>
                  <div className="w-full bg-midnight-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gold-500 h-full"
                      style={{
                        width: `${stats.totalWishes > 0 ? (item.count / stats.totalWishes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Trends */}
          <div className="p-6 rounded-2xl glass-panel border border-gold-500/20 space-y-4">
            <div className="flex items-center gap-2 text-gold-300 font-serif font-semibold text-sm">
              <BarChart3 className="w-4 h-4 text-gold-400" />
              <span>Daily Submissions & Revenue</span>
            </div>
            <div className="space-y-3">
              {stats.dailySubmissions.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/70 border border-gold-500/10 text-xs"
                >
                  <span className="font-medium text-cream-200">{day.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-cream-400/80">{day.count} wishes</span>
                    <span className="font-serif font-bold text-gold-300">
                      ₹{day.revenue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedWish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-midnight-900 border border-gold-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gold-500/20">
              <span className="font-mono text-base font-bold text-gold-200">
                {selectedWish.referenceId}
              </span>
              <button
                onClick={() => setSelectedWish(null)}
                className="text-cream-400 hover:text-cream-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-cream-400/70 block mb-1">Text Expression:</span>
                <div className="p-3.5 rounded-xl bg-midnight-950 border border-gold-500/15 text-cream-100 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedWish.textContent || '(No written text submitted — voice note provided)'}
                </div>
              </div>

              {selectedWish.voiceNote && (
                <div>
                  <span className="text-cream-400/70 block mb-1">Voice Recording:</span>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-midnight-950 border border-gold-500/15">
                    <button
                      onClick={() => handleToggleAudio(selectedWish)}
                      className="w-8 h-8 rounded-full bg-gold-500 text-midnight-950 flex items-center justify-center"
                    >
                      {playingAudioId === selectedWish.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                    <span className="text-[11px] text-cream-300">
                      Duration: {selectedWish.voiceNote.durationSeconds}s • Format: {selectedWish.voiceNote.mimeType}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                <div>
                  <span className="text-cream-400/70">Category:</span>
                  <p className="text-gold-200 capitalize font-medium">{selectedWish.category}</p>
                </div>
                <div>
                  <span className="text-cream-400/70">Language:</span>
                  <p className="text-gold-200 font-mono">{selectedWish.language}</p>
                </div>
                <div>
                  <span className="text-cream-400/70">Payment ID:</span>
                  <p className="text-gold-200 font-mono">{selectedWish.paymentId}</p>
                </div>
                <div>
                  <span className="text-cream-400/70">Access PIN:</span>
                  <p className="text-gold-200 font-mono tracking-widest">{selectedWish.accessPin}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gold-500/20">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleApprove(selectedWish.id);
                    setSelectedWish(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedWish.id);
                    setSelectedWish(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-950 text-amber-300 border border-amber-500/30 text-xs"
                >
                  Reject
                </button>
              </div>

              <button
                onClick={() => handleDelete(selectedWish.id)}
                className="px-3 py-1.5 rounded-xl bg-red-950 text-red-300 border border-red-500/30 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
