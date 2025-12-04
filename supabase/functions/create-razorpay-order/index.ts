// @ts-nocheck
// Deno Edge Function for Razorpay order creation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, bookingId, currency = "INR" } = await req.json();

    if (!amount || !bookingId) {
      throw new Error("Amount and bookingId are required");
    }

    // Validate amount is a positive number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 10000000) {
      throw new Error("Invalid amount");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify booking exists and get actual amount from database
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("id, total_amount, payment_status")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Security: Verify amount matches booking total_amount (with 1 INR tolerance for rounding)
    if (Math.abs(numAmount - booking.total_amount) > 1) {
      console.error(`Amount mismatch: Requested ${numAmount}, Expected ${booking.total_amount}`);
      throw new Error("Amount verification failed");
    }

    // Prevent duplicate payments
    if (booking.payment_status === "paid") {
      throw new Error("Booking already paid");
    }

    // Get Razorpay credentials from environment
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Use verified amount from database
    const orderData = {
      amount: Math.round(booking.total_amount * 100), // Convert to paise (smallest currency unit)
      currency: currency,
      receipt: bookingId.slice(0, 40), // Razorpay has 40 char limit for receipt
      notes: {
        booking_id: bookingId,
      },
    };

    const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.text();
      console.error("Razorpay API error:", razorpayResponse.status);
      throw new Error(`Razorpay API error (${razorpayResponse.status})`);
    }

    const order = await razorpayResponse.json();

    // Store order details in database with verified amount
    const { error: dbError } = await supabaseClient
      .from("payment_orders")
      .insert({
        booking_id: bookingId,
        razorpay_order_id: order.id,
        amount: booking.total_amount, // Use verified amount from booking
        currency: currency,
        status: "created",
      });

    if (dbError) {
      console.error("Database error:", dbError);
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId, // Send key ID to frontend
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
