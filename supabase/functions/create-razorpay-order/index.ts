import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { idempotencyKey, customerEmail, customerPhone } = await req.json();

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_placeholder";
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "secret_placeholder";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Idempotency check: if order with this idempotency key already exists and is pending, reuse it
    if (idempotencyKey) {
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("razorpay_order_id, amount, currency, status")
        .eq("idempotency_key", idempotencyKey)
        .single();

      if (existingPayment && existingPayment.status === "created") {
        return new Response(
          JSON.stringify({
            orderId: existingPayment.razorpay_order_id,
            amount: existingPayment.amount,
            currency: existingPayment.currency,
            keyId: RAZORPAY_KEY_ID,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fixed fee: exactly ₹10 = 1000 paise
    const amount = 1000;
    const currency = "INR";
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Call Razorpay API to create order
    const authHeader = "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        receipt: receipt,
        notes: {
          purpose: "Make A Wish Sacred 7-Day Journey",
          customerEmail: customerEmail || "",
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errText = await rzpResponse.text();
      console.error("Razorpay order creation error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to create payment order with gateway", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderData = await rzpResponse.json();

    // Store payment in Supabase database with created status
    const { error: dbError } = await supabase.from("payments").insert({
      razorpay_order_id: orderData.id,
      amount: amount,
      currency: currency,
      status: "created",
      idempotency_key: idempotencyKey || null,
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      metadata: { receipt, rzp_order: orderData },
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Database error recording payment intent" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: RAZORPAY_KEY_ID,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Internal error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
