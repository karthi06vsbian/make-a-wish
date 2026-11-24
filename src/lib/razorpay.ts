import { RazorpayPaymentSuccessResponse, WishSubmission, WishRecord } from '../types';
import { localDb } from './supabase';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_U3oCFL6hAXf5Iw';

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as unknown as { Razorpay: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

/**
 * STEP 1: Calls backend POST /api/create-order
 */
export const createRazorpayOrder = async (
  amount: number = 1000,
  currency: string = 'INR',
  receipt?: string,
  userEmail?: string
): Promise<CreateOrderResult> => {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.max(100, amount), // Min 100 paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: {
        customerEmail: userEmail || '',
        purpose: 'Make A Wish Sacred 7-Day Journey',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create payment order (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    orderId: data.order_id,
    amount: data.amount,
    currency: data.currency,
    keyId: data.key_id || RAZORPAY_KEY_ID,
  };
};

/**
 * STEP 3: Calls backend POST /api/verify-payment to verify HMAC SHA-256 signature
 */
export const verifyRazorpayPayment = async (
  paymentResponse: RazorpayPaymentSuccessResponse
): Promise<{ success: boolean; message: string; order_id?: string; payment_id?: string }> => {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Payment signature verification failed. Untrusted payment.');
  }

  return data;
};

export interface VerificationResult {
  success: boolean;
  referenceId: string;
  accessPin: string;
  wishRecord: WishRecord;
  message?: string;
}

/**
 * Verifies signature on backend and registers the sacred wish atomically
 */
export const verifyAndSubmitWish = async (
  paymentResponse: RazorpayPaymentSuccessResponse,
  submission: WishSubmission
): Promise<VerificationResult> => {
  // 1. Verify with backend endpoint first
  await verifyRazorpayPayment(paymentResponse);

  // 2. Generate unique sacred reference ID and 6-digit access PIN
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  const referenceId = `WISH-${randomNum}-${year}`;
  const accessPin = Math.floor(100000 + Math.random() * 900000).toString();

  const wishRecord: WishRecord = {
    id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    referenceId,
    accessPin,
    wishType: submission.wishType,
    textContent: submission.textContent,
    category: submission.category,
    language: submission.language,
    isPublic: submission.isPublic,
    moderationStatus: submission.isPublic ? 'pending' : 'approved',
    paymentId: paymentResponse.razorpay_payment_id,
    blessingsCount: 0,
    createdAt: new Date().toISOString(),
    voiceNote: submission.voiceNote,
  };

  localDb.saveWish(wishRecord);

  return {
    success: true,
    referenceId,
    accessPin,
    wishRecord,
  };
};
