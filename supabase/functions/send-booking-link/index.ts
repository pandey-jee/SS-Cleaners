// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// @ts-ignore: Deno types
import nodemailer from "npm:nodemailer@6.9.7";

// @ts-ignore: Deno global
const GMAIL_USER = Deno.env.get("GMAIL_USER");
// @ts-ignore: Deno global
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
// @ts-ignore: Deno global
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:8080";

interface BookingLinkRequest {
  enquiryId: string;
  token: string;
  customerEmail: string;
  customerName: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check required environment variables
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error("❌ Gmail credentials missing!");
      throw new Error("Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.");
    }

    console.log("✅ Gmail credentials found");

    // @ts-ignore: Deno global
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    // @ts-ignore: Deno global
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are not set");
    }

    // @ts-ignore: Deno global
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { enquiryId, token, customerEmail, customerName }: BookingLinkRequest = await req.json();

    // Fetch enquiry details
    const { data: enquiry, error: enquiryError } = await supabaseClient
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single();

    if (enquiryError || !enquiry) {
      throw new Error("Enquiry not found");
    }

    const bookingLink = `${APP_URL}/booking/complete?token=${token}`;

    // Use enquiry name to ensure it's always correct
    const customerNameToUse = enquiry.name || customerName;

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    // Send email with booking link using Gmail SMTP
    await transporter.sendMail({
      from: `SS Cleaners <${GMAIL_USER}>`,
      to: customerEmail,
      subject: "Complete Your Booking - Secure Link Inside",
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;"><div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0;"><h1 style="color:white;margin:0;font-size:28px;">🎉 Time to Complete Your Booking!</h1></div><div style="background-color:#ffffff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;"><p style="font-size:16px;color:#374151;">Hi ${customerNameToUse},</p><p style="font-size:16px;color:#374151;line-height:1.6;">Thank you for your interest in our <strong>${enquiry.service_required.replace(/-/g, " ")}</strong> service! We've reviewed your enquiry and prepared a personalized booking form for you.</p><div style="background-color:#f3f4f6;padding:20px;border-radius:8px;margin:25px 0;"><h3 style="margin-top:0;color:#374151;font-size:18px;">📋 Your Enquiry Summary:</h3><p style="margin:5px 0;color:#6b7280;"><strong>Reference ID:</strong> #${enquiry.id.slice(0, 8).toUpperCase()}</p><p style="margin:5px 0;color:#6b7280;"><strong>Service:</strong> ${enquiry.service_required.replace(/-/g, " ")}</p><p style="margin:5px 0;color:#6b7280;"><strong>Location:</strong> ${enquiry.city}</p></div><div style="text-align:center;margin:30px 0;"><a href="${bookingLink}" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">Complete My Booking →</a></div><div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:25px 0;"><p style="margin:0;color:#92400e;font-size:14px;">⏰ <strong>Important:</strong> This secure link will expire in <strong>7 days</strong>. Please complete your booking before then to secure your preferred date and time.</p></div><h3 style="color:#374151;font-size:18px;margin-top:30px;">What to Expect:</h3><ul style="color:#6b7280;line-height:1.8;"><li>Complete detailed property information</li><li>Choose your preferred date and time</li><li>Select additional services if needed</li><li>Provide your exact address with map location</li><li>Receive instant booking confirmation</li></ul><div style="background-color:#eff6ff;padding:20px;border-radius:8px;margin:25px 0;"><h3 style="margin-top:0;color:#1e40af;font-size:18px;">💬 Need Help?</h3><p style="margin:5px 0;color:#374151;">Our team is here to assist you! Reply to this email or call us at:</p><p style="margin:10px 0;color:#374151;">📞 <strong>+91 1234567890</strong><br/>📧 <strong>support@sscleaners.com</strong></p></div><p style="margin-top:30px;color:#374151;font-size:16px;">Looking forward to serving you!</p><p style="margin-top:20px;color:#374151;">Best regards,<br/><strong style="color:#667eea;">SS Cleaners Team</strong></p></div><div style="text-align:center;padding:20px;color:#6b7280;font-size:12px;"><p style="margin:5px 0;">This is an automated email. Please do not reply directly to this message.</p><p style="margin:5px 0;">If you didn't request this booking link, please ignore this email.</p><p style="margin:15px 0;"><a href="${APP_URL}" style="color:#667eea;text-decoration:none;">Visit Our Website</a> | <a href="mailto:support@sscleaners.com" style="color:#667eea;text-decoration:none;">Contact Support</a></p></div></div></body></html>`,
    });

    console.log("✅ Email sent successfully via Gmail SMTP");

    // Log email notification
    console.log("💾 Logging email notification to database...");
    await supabaseClient.from("email_notifications").insert({
      enquiry_id: enquiryId,
      recipient_email: customerEmail,
      recipient_type: "user",
      notification_type: "booking_link_sent",
      subject: "Complete Your Booking - Secure Link Inside",
      body: "Booking link email sent",
      status: "sent",
    });

    // Send notification to admin (non-blocking - don't fail if this fails)
    try {
      await transporter.sendMail({
        from: `SS Cleaners System <${GMAIL_USER}>`,
        to: "pandeyji252002@gmail.com",
        subject: `Booking Link Sent to ${customerNameToUse}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #667eea;">📤 Booking Link Sent</h2>
              <p>A booking link has been successfully sent to <strong>${customerName}</strong> (${customerEmail}).</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Enquiry ID:</strong> #${enquiry.id.slice(0, 8).toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>Service:</strong> ${enquiry.service_required.replace(/-/g, " ")}</p>
                <p style="margin: 5px 0;"><strong>Token:</strong> ${token.slice(0, 16)}...</p>
                <p style="margin: 5px 0;"><strong>Expires:</strong> 7 days from now</p>
              </div>

              <p>You'll be notified when the customer completes their booking.</p>
            </div>
          `,
      });
    } catch (adminError) {
      console.error("⚠️ Admin notification failed (non-critical)");
      // Don't throw - main email already sent successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking link sent successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending booking link:", error instanceof Error ? error.message : "Unknown error");
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
