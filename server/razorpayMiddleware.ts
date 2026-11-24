import Razorpay from 'razorpay';
import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Helper to parse JSON body from incoming HTTP request
export const parseJsonBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Safeguard against large payloads (1MB)
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', (err) => reject(err));
  });
};

export const createRazorpayInstance = (keyId?: string, keySecret?: string) => {
  const id = keyId || process.env.RAZORPAY_KEY_ID;
  const secret = keySecret || process.env.RAZORPAY_KEY_SECRET;

  if (!id || !secret) {
    throw new Error('Razorpay credentials missing in environment variables');
  }

  return new Razorpay({
    key_id: id,
    key_secret: secret,
  });
};

/**
 * Handler for POST /api/create-order
 */
export const handleCreateOrder = async (
  req: IncomingMessage,
  res: ServerResponse,
  envKeyId?: string,
  envKeySecret?: string
) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const amount = body.amount !== undefined ? Number(body.amount) : 1000; // Default ₹10 = 1000 paise
    const currency = body.currency || 'INR';
    const receipt = body.receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Validate amount >= 100 paise
    if (isNaN(amount) || amount < 100) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid amount. Minimum amount is 100 paise (₹1).' }));
      return;
    }

    const keyId = envKeyId || process.env.RAZORPAY_KEY_ID;
    const keySecret = envKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Razorpay credentials not configured in environment' }));
      return;
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: currency,
      receipt: receipt,
      notes: body.notes || {
        service: 'Make A Wish Sacred 7-Day Journey',
      },
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      })
    );
  } catch (err: any) {
    console.error('Error in /api/create-order:', err);

    // Check for auth / 401 errors from Razorpay
    const statusCode = err.statusCode === 401 || err.error?.code === 'BAD_REQUEST_ERROR' && err.error?.description?.includes('auth') ? 401 : 500;
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: err.message || 'Razorpay order creation failed',
        details: err.error || undefined,
      })
    );
  }
};

/**
 * Handler for POST /api/verify-payment
 */
export const handleVerifyPayment = async (
  req: IncomingMessage,
  res: ServerResponse,
  envKeySecret?: string
) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Missing fields check
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Missing required parameters. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
        })
      );
      return;
    }

    const keySecret = envKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Razorpay Key Secret not configured on server' }));
      return;
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn('Razorpay signature mismatch:', {
        expected: expectedSignature,
        received: razorpay_signature,
      });
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: 'Signature verification failed: signature does not match.',
        })
      );
      return;
    }

    // Signatures match
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      })
    );
  } catch (err: any) {
    console.error('Error in /api/verify-payment:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message || 'Payment verification server error' }));
  }
};
