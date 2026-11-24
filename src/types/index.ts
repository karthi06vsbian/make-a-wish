export type LanguageCode = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
}

export type WishCategory = 
  | 'peace' 
  | 'health' 
  | 'family' 
  | 'growth' 
  | 'relationship' 
  | 'inner_strength' 
  | 'gratitude' 
  | 'general';

export type WishType = 'text' | 'voice' | 'both';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface VoiceNoteMeta {
  storagePath: string;
  fileSizeBytes: number;
  durationSeconds: number;
  mimeType: string;
  audioBlob?: Blob;
  previewUrl?: string;
}

export interface WishSubmission {
  wishType: WishType;
  textContent?: string;
  category: WishCategory;
  language: LanguageCode;
  isPublic: boolean;
  voiceNote?: VoiceNoteMeta;
  userEmail?: string;
  userPhone?: string;
  consentAccepted: boolean;
}

export interface WishRecord {
  id: string;
  referenceId: string;
  accessPin: string;
  wishType: WishType;
  textContent?: string;
  category: WishCategory;
  language: LanguageCode;
  isPublic: boolean;
  moderationStatus: ModerationStatus;
  paymentId: string;
  blessingsCount: number;
  createdAt: string;
  voiceNote?: {
    storagePath: string;
    durationSeconds: number;
    fileSizeBytes: number;
    mimeType: string;
    previewUrl?: string;
  };
}

export interface ReflectionDay {
  dayNumber: number;
  title: string;
  theme: string;
  reflectionMessage: string;
  affirmation: string;
  mindfulAction: string;
  isUnlocked: boolean;
  unlockedAt?: string | null;
}

export interface PaymentRecord {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number; // 1000 paise
  currency: string;
  status: 'created' | 'captured' | 'failed' | 'refunded';
  createdAt: string;
  verifiedAt?: string;
  customerEmail?: string;
}

export interface AdminStats {
  totalWishes: number;
  verifiedPayments: number;
  totalRevenue: number;
  publicWishesCount: number;
  pendingModerationCount: number;
  voiceNotesCount: number;
  languageBreakdown: Record<LanguageCode, number>;
  dailySubmissions: { date: string; count: number; revenue: number }[];
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
