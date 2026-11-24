import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper to convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "webhook_secret_placeholder";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Verify webhook signature
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(rawBody)
    );
    const expectedSignature = bufferToHex(signatureBuffer);

    if (WEBHOOK_SECRET !== "webhook_secret_placeholder" && signature !== expectedSignature) {
      console.error("Invalid webhook signature received");
      return new Response("Invalid signature", { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Processing Razorpay webhook event: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity) {
        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;

        await supabase
          .from("payments")
          .update({
            razorpay_payment_id: paymentId,
            status: "captured",
            verified_at: new Date().toISOString(),
            metadata: paymentEntity,
          })
          .eq("razorpay_order_id", orderId);
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            metadata: paymentEntity,
          })
          .eq("razorpay_order_id", paymentEntity.order_id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response("Webhook error", { status: 500 });
  }
});
