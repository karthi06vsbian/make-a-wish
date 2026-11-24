import { createClient } from '@supabase/supabase-js';
import { WishRecord, ReflectionDay, AdminStats } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Resilient In-Memory & LocalStorage Store
 * Guarantees zero friction for testing, offline preview, and immediate demo
 * while syncing with real Supabase when configured.
 */
const STORAGE_KEY_WISHES = 'wishmaker_wishes_db_v1';
const STORAGE_KEY_PAYMENTS = 'wishmaker_payments_db_v1';

const getInitialWishes = (): WishRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WISHES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading wishes cache', e);
  }

  // Pre-seeded inspiring anonymous wishes for community wall
  return [
    {
      id: 'mock-w-1',
      referenceId: 'WISH-4192-2026',
      accessPin: '582914',
      wishType: 'text',
      textContent: 'May my mother find healing and freedom from joint pain this year. May peace abide in our home.',
      category: 'health',
      language: 'en',
      isPublic: true,
      moderationStatus: 'approved',
      paymentId: 'pay_sample_1',
      blessingsCount: 14,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'mock-w-2',
      referenceId: 'WISH-8831-2026',
      accessPin: '294812',
      wishType: 'text',
      textContent: 'எங்கள் குடும்பத்தில் அமைதியும் நல்லிணக்கமும் நிலவ வேண்டும். என் குழந்தைகளுக்கு நல்வழியும் கல்வியும் கிடைக்கட்டும்.',
      category: 'family',
      language: 'ta',
      isPublic: true,
      moderationStatus: 'approved',
      paymentId: 'pay_sample_2',
      blessingsCount: 29,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'mock-w-3',
      referenceId: 'WISH-6047-2026',
      accessPin: '739102',
      wishType: 'text',
      textContent: 'हे ईश्वर, मुझे कठिन परिस्थितियों में शांत रहने और सही निर्णय लेने की शक्ति प्रदान करें।',
      category: 'inner_strength',
      language: 'hi',
      isPublic: true,
      moderationStatus: 'approved',
      paymentId: 'pay_sample_3',
      blessingsCount: 8,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];
};

export const localDb = {
  getWishes: (): WishRecord[] => {
    return getInitialWishes();
  },

  saveWish: (wish: WishRecord): void => {
    const wishes = getInitialWishes();
    const existingIndex = wishes.findIndex((w) => w.id === wish.id || w.referenceId === wish.referenceId);
    if (existingIndex >= 0) {
      wishes[existingIndex] = wish;
    } else {
      wishes.unshift(wish);
    }
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(wishes));
  },

  findWishByRefAndPin: (refId: string, pin?: string): WishRecord | undefined => {
    const wishes = getInitialWishes();
    const trimmedRef = refId.trim().toUpperCase();
    return wishes.find((w) => {
      const matchRef = w.referenceId.toUpperCase() === trimmedRef;
      if (!pin) return matchRef;
      return matchRef && w.accessPin === pin.trim();
    });
  },

  incrementBlessing: (wishId: string): number => {
    const wishes = getInitialWishes();
    const wish = wishes.find((w) => w.id === wishId);
    if (wish) {
      wish.blessingsCount = (wish.blessingsCount || 0) + 1;
      localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(wishes));
      return wish.blessingsCount;
    }
    return 0;
  },

  getAdminStats: (): AdminStats => {
    const wishes = getInitialWishes();
    const verifiedPayments = wishes.length;
    const totalRevenue = verifiedPayments * 10; // ₹10 per wish

    const languageBreakdown: Record<string, number> = {
      en: 0,
      ta: 0,
      hi: 0,
      te: 0,
      ml: 0,
      kn: 0,
    };

    wishes.forEach((w) => {
      if (languageBreakdown[w.language] !== undefined) {
        languageBreakdown[w.language]++;
      } else {
        languageBreakdown.en++;
      }
    });

    return {
      totalWishes: wishes.length,
      verifiedPayments,
      totalRevenue,
      publicWishesCount: wishes.filter((w) => w.isPublic).length,
      pendingModerationCount: wishes.filter((w) => w.moderationStatus === 'pending').length,
      voiceNotesCount: wishes.filter((w) => w.wishType === 'voice' || w.wishType === 'both').length,
      languageBreakdown: languageBreakdown as Record<any, number>,
      dailySubmissions: [
        { date: 'Nov 20', count: 12, revenue: 120 },
        { date: 'Nov 21', count: 18, revenue: 180 },
        { date: 'Nov 22', count: 25, revenue: 250 },
        { date: 'Nov 23', count: 32, revenue: 320 },
        { date: 'Nov 24', count: wishes.length, revenue: wishes.length * 10 },
      ],
    };
  },

  updateModerationStatus: (wishId: string, status: 'approved' | 'rejected'): boolean => {
    const wishes = getInitialWishes();
    const wish = wishes.find((w) => w.id === wishId);
    if (wish) {
      wish.moderationStatus = status;
      localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(wishes));
      return true;
    }
    return false;
  },

  deleteWish: (wishId: string): boolean => {
    let wishes = getInitialWishes();
    wishes = wishes.filter((w) => w.id !== wishId);
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(wishes));
    return true;
  },
};

/**
 * Standard Seven-Day Reflection Content generator
 */
export const getSevenDayJourneyData = (wish: WishRecord): ReflectionDay[] => {
  const createdAtTime = new Date(wish.createdAt).getTime();
  const elapsedDays = Math.floor((Date.now() - createdAtTime) / (1000 * 60 * 60 * 24));

  return [
    {
      dayNumber: 1,
      title: 'Your Sacred Wish Has Been Received',
      theme: 'Arrival & Stillness',
      reflectionMessage:
        'Your sacred intention has been voiced and received with reverence. Planted like a seed in fertile soil, it does not need anxious hurry. Breathe out tension and rest in gentle confidence.',
      affirmation: 'I release anxiety and allow my heart to rest in peaceful trust.',
      mindfulAction:
        'Sit in silence for two quiet minutes. Place both hands over your heart and take five slow, conscious breaths.',
      isUnlocked: true,
      unlockedAt: wish.createdAt,
    },
    {
      dayNumber: 2,
      title: 'Cultivate Still Hope',
      theme: 'Patience & Faith',
      reflectionMessage:
        'Hope is not demanding immediate results; it is the quiet lamp burning gently in the dark. Give your aspirations time to mature. True transformation is quiet and unhurried.',
      affirmation: 'I welcome patience. Every meaningful journey unfolds one moment at a time.',
      mindfulAction:
        'Drink a glass of warm water mindfully today. With every sip, mentally thank your body for supporting you.',
      isUnlocked: elapsedDays >= 1,
      unlockedAt: elapsedDays >= 1 ? new Date(createdAtTime + 86400000).toISOString() : null,
    },
    {
      dayNumber: 3,
      title: 'Believe In Your Inner Strength',
      theme: 'Resilience & Courage',
      reflectionMessage:
        'Reflect upon the storms you have already weathered. The peace and strength you seek outside already reside within your soul. You are far more resilient than your doubts suggest.',
      affirmation: 'I carry within me the wisdom, courage, and perseverance needed for my path.',
      mindfulAction:
        'Recall one challenge from your past that you overcame. Silently honor the strength you demonstrated.',
      isUnlocked: elapsedDays >= 2,
      unlockedAt: elapsedDays >= 2 ? new Date(createdAtTime + 86400000 * 2).toISOString() : null,
    },
    {
      dayNumber: 4,
      title: 'One Small Mindful Step',
      theme: 'Aligned Action',
      reflectionMessage:
        'A sacred wish is not an excuse for passivity; it is an invitation to walk in harmony with what you desire. What tiny, kind action can you take today that moves you closer to harmony?',
      affirmation: 'My purposeful small actions create ripples of positive change.',
      mindfulAction:
        'Perform one tangible act of kindness today—for yourself or someone near you—without seeking recognition.',
      isUnlocked: elapsedDays >= 3,
      unlockedAt: elapsedDays >= 3 ? new Date(createdAtTime + 86400000 * 3).toISOString() : null,
    },
    {
      dayNumber: 5,
      title: 'Practice Deep Gratitude',
      theme: 'Abundance & Grace',
      reflectionMessage:
        'Gratitude is the mirror that reflects the light already glowing in your life. When we notice small wonders—warm tea, a bird song, clean air—we shift our mindset from lack to abundance.',
      affirmation: 'I am deeply grateful for the blessings of this day, both seen and unseen.',
      mindfulAction:
        'Send a heartfelt message of appreciation to someone who was kind to you, or write down 3 simple gifts of this day.',
      isUnlocked: elapsedDays >= 4,
      unlockedAt: elapsedDays >= 4 ? new Date(createdAtTime + 86400000 * 4).toISOString() : null,
    },
    {
      dayNumber: 6,
      title: 'Persevere With Gentle Grace',
      theme: 'Perseverance & Trust',
      reflectionMessage:
        'If discouragement knocks, do not condemn yourself. Doubt is merely a temporary cloud passing through an endless sky. Center yourself, breathe, and keep walking with quiet dignity.',
      affirmation: 'I do not rush, nor do I give up. I walk forward with quiet dignity.',
      mindfulAction:
        'Take a 10-minute quiet walk without checking your phone. Look up at the sky and notice the openness of space.',
      isUnlocked: elapsedDays >= 5,
      unlockedAt: elapsedDays >= 5 ? new Date(createdAtTime + 86400000 * 5).toISOString() : null,
    },
    {
      dayNumber: 7,
      title: 'A Serene New Beginning',
      theme: 'Completion & Renewal',
      reflectionMessage:
        'You have dedicated seven days to nurturing your intention with mindfulness and patience. This is not an end, but a newly aligned beginning. Carry this stillness and clarity with you into all your tomorrows.',
      affirmation: 'I step forward into each day with a peaceful mind, an open heart, and renewed hope.',
      mindfulAction:
        'Light a physical diya or candle, or spend 5 minutes in heartfelt prayer or meditation to celebrate your renewed inner clarity.',
      isUnlocked: elapsedDays >= 6,
      unlockedAt: elapsedDays >= 6 ? new Date(createdAtTime + 86400000 * 6).toISOString() : null,
    },
  ];
};
