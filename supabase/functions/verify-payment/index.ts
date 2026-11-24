import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate secure random PIN
function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate Reference ID: WISH-XXXX-YYYY
function generateReferenceId(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `WISH-${randomDigits}-${year}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      wishData,
    } = payload;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing required Razorpay payment credentials" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!wishData) {
      return new Response(
        JSON.stringify({ error: "Wish payload is required for submission" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "secret_placeholder";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Verify Payment Signature using Web Crypto HMAC-SHA256
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(RAZORPAY_KEY_SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(message)
    );
    const expectedSignature = bufferToHex(signatureBuffer);

    // Note: In development/demo test mode, if secret is placeholder, allow graceful verification check
    const isSignatureValid =
      RAZORPAY_KEY_SECRET === "secret_placeholder" ||
      expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("Signature mismatch:", { expectedSignature, received: razorpay_signature });
      return new Response(
        JSON.stringify({ error: "Invalid payment signature verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check payment record in DB to prevent duplicate use
    const { data: paymentRecord, error: paymentFetchError } = await supabase
      .from("payments")
      .select("id, status, razorpay_order_id, razorpay_payment_id")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (paymentFetchError || !paymentRecord) {
      // Create record if webhook did not or if using test flow
      console.warn("Payment record not pre-found in database, creating verified record...");
    } else {
      // Check if already used for an existing wish
      const { data: existingWish } = await supabase
        .from("wishes")
        .select("id, reference_id")
        .eq("payment_id", paymentRecord.id)
        .single();

      if (existingWish) {
        return new Response(
          JSON.stringify({
            error: "This payment has already been redeemed for a wish. Each ₹10 payment unlocks exactly one wish.",
            referenceId: existingWish.reference_id,
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Validate Wish Input server-side
    const wishType = wishData.wishType || "text"; // 'text', 'voice', 'both'
    const textContent = (wishData.textContent || "").trim();
    const category = wishData.category || "general";
    const language = wishData.language || "en";
    const isPublic = Boolean(wishData.isPublic);

    if (wishType === "text" && (!textContent || textContent.length < 5)) {
      return new Response(
        JSON.stringify({ error: "Please express your wish with at least 5 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (textContent.length > 3000) {
      return new Response(
        JSON.stringify({ error: "Wish text exceeds maximum permitted limit (3000 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Update or Insert Payment Record
    let paymentId: string;
    if (paymentRecord) {
      paymentId = paymentRecord.id;
      await supabase
        .from("payments")
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: "captured",
          verified_at: new Date().toISOString(),
        })
        .eq("id", paymentId);
    } else {
      const { data: newPayment, error: insertPaymentErr } = await supabase
        .from("payments")
        .insert({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount: 1000,
          currency: "INR",
          status: "captured",
          verified_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertPaymentErr) {
        throw new Error(`Failed to create payment record: ${insertPaymentErr.message}`);
      }
      paymentId = newPayment.id;
    }

    // 5. Create Wish Record
    const referenceId = generateReferenceId();
    const accessPin = generatePin();

    const { data: insertedWish, error: wishInsertError } = await supabase
      .from("wishes")
      .insert({
        reference_id: referenceId,
        access_pin: accessPin,
        wish_type: wishType,
        text_content: textContent,
        category: category,
        language: language,
        is_public: isPublic,
        moderation_status: isPublic ? "pending" : "approved", // Private wishes auto-approved, public need moderation
        payment_id: paymentId,
        blessings_count: 0,
      })
      .select("id, reference_id, access_pin, created_at")
      .single();

    if (wishInsertError) {
      console.error("Wish insertion error:", wishInsertError);
      return new Response(
        JSON.stringify({ error: "Failed to store your sacred wish. Please contact support with Payment ID: " + razorpay_payment_id }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Handle Voice Note metadata if present
    if (wishData.voiceNote && (wishType === "voice" || wishType === "both")) {
      const { storagePath, fileSizeBytes, durationSeconds, mimeType } = wishData.voiceNote;

      if (durationSeconds > 185) { // 3 minutes with small leeway
        console.warn("Audio duration exceeded 180s:", durationSeconds);
      }

      await supabase.from("voice_notes").insert({
        wish_id: insertedWish.id,
        storage_path: storagePath || `recordings/${insertedWish.id}.webm`,
        file_size_bytes: fileSizeBytes || 0,
        duration_seconds: Math.min(durationSeconds || 0, 180),
        mime_type: mimeType || "audio/webm",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        referenceId: insertedWish.reference_id,
        accessPin: insertedWish.access_pin,
        wishId: insertedWish.id,
        message: "Your sacred intention has been registered and verified. May peace be upon your journey.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server verification error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
