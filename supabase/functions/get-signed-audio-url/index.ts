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
    const { wishId, accessPin } = await req.json();

    if (!wishId) {
      return new Response(JSON.stringify({ error: "Wish ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user is authenticated admin
    let isAuthorized = false;
    if (authHeader) {
      const { data: { user } } = await userClient.auth.getUser();
      if (user) {
        const { data: adminRole } = await adminClient
          .from("admin_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        if (adminRole) {
          isAuthorized = true;
        }
      }
    }

    // Or check if valid accessPin is provided for this wish
    if (!isAuthorized && accessPin) {
      const { data: wish } = await adminClient
        .from("wishes")
        .select("id, access_pin")
        .eq("id", wishId)
        .single();
      if (wish && wish.access_pin === accessPin) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access to private voice recording" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get voice note path
    const { data: voiceNote, error: vnError } = await adminClient
      .from("voice_notes")
      .select("storage_path")
      .eq("wish_id", wishId)
      .single();

    if (vnError || !voiceNote) {
      return new Response(
        JSON.stringify({ error: "Voice recording not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate signed URL valid for 60 minutes
    const { data: signedData, error: signError } = await adminClient.storage
      .from("wish-voice-notes")
      .createSignedUrl(voiceNote.storage_path, 3600);

    if (signError || !signedData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: "Failed to generate secure streaming URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ signedUrl: signedData.signedUrl, expiresIn: 3600 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
