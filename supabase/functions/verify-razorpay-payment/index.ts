// @ts-nocheck
// Deno Edge Function for Razorpay payment verification
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      throw new Error("Missing required payment verification data");
    }

    // Get Razorpay secret
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      throw new Error("Razorpay secret not configured");
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = createHmac("sha256", razorpayKeySecret)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update payment order status
    const { error: orderError } = await supabaseClient
      .from("payment_orders")
      .update({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (orderError) {
      console.error("Error updating payment order:", orderError);
    }

    // Update booking status to confirmed
    const { error: bookingError } = await supabaseClient
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (bookingError) {
      console.error("Error updating booking:", bookingError);
      throw new Error("Failed to update booking status");
    }

    // Send confirmation email
    try {
      await supabaseClient.functions.invoke("send-booking-confirmation", {
        body: { bookingId },
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the payment if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
